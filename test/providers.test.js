import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { searchFlipkart } from "../src/providers/flipkart.js";
import { searchAmazon } from "../src/providers/amazon.js";

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });
const reply = (body) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });

test("parses a Flipkart affiliate search response", async () => {
  globalThis.fetch = async () => reply({
    products: [{
      productBaseInfoV1: {
        productId: "ACC1", title: "Air Fryer 4.2L", productBrand: "Brand",
        maximumRetailPrice: { amount: 8999 }, flipkartSpecialPrice: { amount: 4999 },
        imageUrls: { "400x400": "https://img.example/a.jpg" }, productUrl: "https://dl.flipkart.com/x?affid=me", inStock: true, codAvailable: true
      },
      productShippingInfoV1: { sellerAverageRating: 4.3, sellerNoOfRatings: 1200 },
      categorySpecificInfoV1: { keySpecs: ["4.2 L", "1500 W"] }
    }]
  });
  const [p] = await searchFlipkart("air fryer", { FLIPKART_AFFILIATE_ID: "me", FLIPKART_AFFILIATE_TOKEN: "t" });
  assert.equal(p.price, 4999);
  assert.equal(p.mrp, 8999);
  assert.equal(p.ratingType, "seller");
  assert.equal(p.cod, true);
  assert.deepEqual(p.features, ["4.2 L", "1500 W"]);
});

test("gets a Creators API token, then parses Amazon search items", async () => {
  const calls = [];
  globalThis.fetch = async (url, opts) => {
    calls.push({ url: String(url), opts });
    if (String(url).includes("/auth/")) return reply({ access_token: "tok", expires_in: 3600 });
    return reply({
      searchResult: { items: [{
        asin: "B0TEST", detailPageURL: "https://www.amazon.in/dp/B0TEST?tag=me-21",
        itemInfo: { title: { displayValue: "Wireless Earbuds Pro" }, features: { displayValues: ["ANC", "40h battery"] } },
        images: { primary: { large: { url: "https://m.media-amazon.com/x.jpg" } } },
        offersV2: { listings: [{ price: { money: { amount: 2499 }, savingBasis: { money: { amount: 4999 } } }, availability: { type: "IN_STOCK" } }] }
      }] }
    });
  };
  const env = { AMAZON_CREDENTIAL_ID: "id", AMAZON_CREDENTIAL_SECRET: "s", AMAZON_CREDENTIAL_VERSION: "3.2", AMAZON_TOKEN_URL: "https://api.amazon.co.uk/auth/o2/token", AMAZON_PARTNER_TAG: "me-21" };
  const [p] = await searchAmazon("earbuds", env);
  assert.equal(p.title, "Wireless Earbuds Pro");
  assert.equal(p.price, 2499);
  assert.equal(p.mrp, 4999);
  const api = calls.find((c) => c.url.includes("searchItems"));
  assert.equal(api.opts.headers["x-marketplace"], "www.amazon.in");
  assert.equal(api.opts.headers.Authorization, "Bearer tok");
});
