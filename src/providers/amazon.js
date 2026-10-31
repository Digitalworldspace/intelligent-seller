// Amazon.in through the official Amazon Creators API.
// PA-API 5 was retired on 30 April 2026; Creators API is its replacement.
// Docs: Associates Central > Creators API (affiliate-program.amazon.in/creatorsapi/docs)
//
// Field names below follow the Creators API (lowerCamelCase). The parser also accepts
// PascalCase so small differences in the response shape don't break it.

import { pick, toNumber, fetchJson } from "../lib/util.js";

const API_URL = "https://creatorsapi.amazon/catalog/v1/searchItems";
const MARKETPLACE = "www.amazon.in";

const FULL_RESOURCES = [
  "itemInfo.title",
  "itemInfo.byLineInfo",
  "itemInfo.features",
  "images.primary.large",
  "offersV2.listings.price",
  "offersV2.listings.availability",
  "offersV2.listings.merchantInfo",
  "customerReviews.count",
  "customerReviews.starRating"
];
const SAFE_RESOURCES = ["itemInfo.title", "images.primary.large", "offersV2.listings.price"];

let token = { value: null, exp: 0 };

export function amazonConfigured(env) {
  return Boolean(env.AMAZON_CREDENTIAL_ID && env.AMAZON_CREDENTIAL_SECRET && env.AMAZON_PARTNER_TAG && env.AMAZON_TOKEN_URL);
}

function isV3(env) { return String(env.AMAZON_CREDENTIAL_VERSION || "3").startsWith("3"); }

async function getToken(env) {
  if (token.value && Date.now() < token.exp - 60_000) return token.value;
  const id = env.AMAZON_CREDENTIAL_ID, secret = env.AMAZON_CREDENTIAL_SECRET;
  let data;
  if (isV3(env)) {
    // Login with Amazon (credential version 3.x)
    data = await fetchJson(env.AMAZON_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grant_type: "client_credentials", client_id: id, client_secret: secret, scope: "creatorsapi::default" })
    });
  } else {
    // Cognito (credential version 2.x)
    data = await fetchJson(env.AMAZON_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64")
      },
      body: new URLSearchParams({ grant_type: "client_credentials", scope: "creatorsapi/default" })
    });
  }
  token = { value: data.access_token, exp: Date.now() + (Number(data.expires_in) || 3600) * 1000 };
  return token.value;
}

async function callSearch(env, q, resources) {
  const access = await getToken(env);
  const auth = isV3(env) ? `Bearer ${access}` : `Bearer ${access}, Version ${env.AMAZON_CREDENTIAL_VERSION}`;
  return fetchJson(API_URL, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json", "x-marketplace": MARKETPLACE },
    body: JSON.stringify({
      keywords: q,
      partnerTag: env.AMAZON_PARTNER_TAG,
      marketplace: MARKETPLACE,
      itemCount: 10,
      resources
    })
  });
}

export async function searchAmazon(q, env) {
  let data;
  try {
    data = await callSearch(env, q, FULL_RESOURCES);
  } catch (e) {
    if (e.status !== 400) throw e;
    data = await callSearch(env, q, SAFE_RESOURCES); // retry with the minimum set of resources
  }
  const items = pick(data, "searchResult.items", "SearchResult.Items", "items") || [];
  return items.map((it) => {
    const listing = pick(it, "offersV2.listings.0", "OffersV2.Listings.0") || {};
    const price = toNumber(pick(listing, "price.money.amount", "Price.Money.Amount", "price.amount"));
    const mrp = toNumber(pick(listing, "price.savingBasis.money.amount", "Price.SavingBasis.Money.Amount", "savingBasis.money.amount"));
    const availability = String(pick(listing, "availability.type", "Availability.Type") || "");
    return {
      id: "amazon:" + (it.asin || it.ASIN),
      platform: "amazon",
      title: pick(it, "itemInfo.title.displayValue", "ItemInfo.Title.DisplayValue") || "",
      brand: pick(it, "itemInfo.byLineInfo.brand.displayValue", "ItemInfo.ByLineInfo.Brand.DisplayValue") || "",
      image: pick(it, "images.primary.large.url", "Images.Primary.Large.URL") || "",
      url: pick(it, "detailPageURL", "DetailPageURL", "detailPageUrl") || "",
      price,
      mrp: mrp && price && mrp > price ? mrp : null,
      rating: toNumber(pick(it, "customerReviews.starRating.value", "CustomerReviews.StarRating.Value")),
      ratingCount: toNumber(pick(it, "customerReviews.count", "CustomerReviews.Count")),
      ratingType: "product",
      inStock: availability ? !/OUT_OF_STOCK|UNAVAILABLE/i.test(availability) : true,
      cod: null,
      features: (pick(it, "itemInfo.features.displayValues", "ItemInfo.Features.DisplayValues") || []).slice(0, 4)
    };
  }).filter((p) => p.title && p.url && p.price);
}
