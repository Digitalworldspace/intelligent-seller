import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreProducts } from "../src/lib/score.js";
import { ruleSeller } from "../src/lib/seller.js";
import { platformLinks } from "../src/lib/links.js";

const sample = [
  { id: "a", platform: "amazon", title: "Wireless Earbuds ANC 40h", brand: "X", price: 2499, mrp: 4999, rating: 4.4, ratingCount: 18000, ratingType: "product", inStock: true, cod: null, features: ["ANC"] },
  { id: "b", platform: "flipkart", title: "Wireless Earbuds Lite", brand: "Y", price: 1299, mrp: 2999, rating: 3.6, ratingCount: 900, ratingType: "seller", inStock: true, cod: true, features: [] },
  { id: "c", platform: "amazon", title: "Silicone case cover", brand: "Z", price: 199, mrp: 499, rating: 4.8, ratingCount: 50, ratingType: "product", inStock: true, cod: null, features: [] }
];

test("ranks the real match above a cheap unrelated accessory", () => {
  const r = scoreProducts(sample, "wireless earbuds");
  assert.equal(r[0].id, "a");
  assert.equal(r.at(-1).id, "c");
  r.forEach((p) => assert.ok(p.score >= 0 && p.score <= 100));
});

test("rule seller writes a message and advantages in both languages", () => {
  const r = scoreProducts(sample, "wireless earbuds");
  for (const lang of ["en", "gu"]) {
    const s = ruleSeller("wireless earbuds", r, 2, lang);
    assert.equal(s.bestId, "a");
    assert.ok(s.message.length >= 2);
    assert.ok(s.advantages.length >= 3);
  }
});

test("no products still gives the customer trusted site links", () => {
  const s = ruleSeller("air fryer", [], 0, "en");
  assert.equal(s.bestId, null);
  const links = platformLinks("air fryer", { AMAZON_PARTNER_TAG: "me-21" }, "en");
  assert.ok(links.find((l) => l.key === "amazon").url.includes("tag=me-21"));
  assert.ok(!links.some((l) => l.key === "myntra"), "fashion sites only for fashion searches");
  assert.ok(platformLinks("running shoes", {}, "en").some((l) => l.key === "myntra"));
});

import { ensureAffiliate } from "../src/lib/links.js";
test("product links always carry your affiliate ids", () => {
  const env = { AMAZON_PARTNER_TAG: "me-21", FLIPKART_AFFILIATE_ID: "myid" };
  assert.match(ensureAffiliate("https://www.amazon.in/dp/B0X", "amazon", env), /tag=me-21/);
  assert.equal(ensureAffiliate("https://www.amazon.in/dp/B0X?tag=other-21", "amazon", env), "https://www.amazon.in/dp/B0X?tag=other-21");
  assert.match(ensureAffiliate("https://www.flipkart.com/p/x", "flipkart", env), /affid=myid/);
});
