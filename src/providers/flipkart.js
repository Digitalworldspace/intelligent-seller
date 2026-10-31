// Flipkart through the official Flipkart Affiliate API.
// Docs: https://affiliate.flipkart.com/api-docs/af_prod_ref.html
// Product URLs returned by this API already carry your affiliate id.

import { pick, toNumber, fetchJson } from "../lib/util.js";

const API_URL = "https://affiliate-api.flipkart.net/affiliate/1.0/search.json";

export function flipkartConfigured(env) {
  return Boolean(env.FLIPKART_AFFILIATE_ID && env.FLIPKART_AFFILIATE_TOKEN);
}

export async function searchFlipkart(q, env) {
  const url = `${API_URL}?query=${encodeURIComponent(q)}&resultCount=10`;
  const data = await fetchJson(url, {
    headers: {
      "Fk-Affiliate-Id": env.FLIPKART_AFFILIATE_ID,
      "Fk-Affiliate-Token": env.FLIPKART_AFFILIATE_TOKEN,
      Accept: "application/json"
    }
  });
  const list = data?.products || data?.productInfoList || [];
  return list.map((row) => {
    const b = row.productBaseInfoV1 || {};
    const s = row.productShippingInfoV1 || {};
    const price = toNumber(pick(b, "flipkartSpecialPrice.amount", "flipkartSellingPrice.amount"));
    const mrp = toNumber(pick(b, "maximumRetailPrice.amount"));
    const imgs = b.imageUrls || {};
    const specs = pick(row, "categorySpecificInfoV1.keySpecs") || [];
    return {
      id: "flipkart:" + (b.productId || b.productUrl),
      platform: "flipkart",
      title: b.title || "",
      brand: b.productBrand || "",
      image: imgs["400x400"] || imgs["200x200"] || Object.values(imgs)[0] || "",
      url: b.productUrl || "",
      price,
      mrp: mrp && price && mrp > price ? mrp : null,
      // The search API gives the seller's rating, not the product's star rating.
      rating: toNumber(s.sellerAverageRating),
      ratingCount: toNumber(s.sellerNoOfRatings),
      ratingType: "seller",
      inStock: b.inStock !== false,
      cod: typeof b.codAvailable === "boolean" ? b.codAvailable : null,
      features: specs.slice(0, 4)
    };
  }).filter((p) => p.title && p.url && p.price);
}
