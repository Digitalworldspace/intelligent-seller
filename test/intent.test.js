import { test } from "node:test";
import assert from "node:assert/strict";
import { parseIntent, filteredSearchUrl } from "../public/intent.js";

test("understands budget, product and needs in Gujarati-English mix", () => {
  const i = parseIntent("15000 ni andar camera saro phone joie");
  assert.equal(i.max, 15000);
  assert.equal(i.min, null);
  assert.deepEqual(i.needs, ["camera"]);
  assert.match(i.query, /camera/);
  assert.match(i.query, /phone/);
});

test("understands Gujarati and Hindi script", () => {
  const g = parseIntent("૨૦૦૦ સુધીમાં સારા ઇયરફોન");
  assert.equal(g.max, 2000);
  assert.match(g.query, /earphones/);
  const h = parseIntent("सस्ते जूते 1000 से कम");
  assert.equal(h.max, 1000);
  assert.equal(h.sort, "low");
  assert.match(h.query, /shoes/);
});

test("understands k, lakh, ranges, minimum and brands", () => {
  assert.equal(parseIntent("boat earbuds under 2k").max, 2000);
  assert.equal(parseIntent("boat earbuds under 2k").brand, "boat");
  assert.equal(parseIntent("laptop under 1.5 lakh").max, 150000);
  const r = parseIntent("phone 10000 to 20000");
  assert.deepEqual([r.min, r.max], [10000, 20000]);
  assert.equal(parseIntent("tv above 30000").min, 30000);
});

test("does not mistake specs for a budget", () => {
  const i = parseIntent("5G phone 8gb 128gb 6000mah");
  assert.equal(i.max, null);
  assert.equal(i.min, null);
  assert.equal(parseIntent("air fryer 4.2l").max, null);
});

test("adds budget and sort to Amazon and Flipkart links", () => {
  const a = filteredSearchUrl("Amazon.in", "https://www.amazon.in/s?k=phone&tag=me-21", { max: 15000, sort: "low" });
  assert.match(a, /rh=p_36%3A-1500000/);
  assert.match(a, /s=price-asc-rank/);
  assert.match(a, /tag=me-21/);
  const f = filteredSearchUrl("Flipkart", "https://dl.flipkart.com/dl/search?q=phone", { min: 10000, max: 15000 });
  assert.match(f, /facets\.price_range\.from%3D10000/);
  assert.match(f, /facets\.price_range\.to%3D15000/);
});

test("budget direction and repeated words", () => {
  const g = parseIntent("best mobile under 20000 for gaming");
  assert.deepEqual([g.min, g.max], [null, 20000]);
  assert.deepEqual(g.needs, ["gaming"]);
  assert.equal(parseIntent("mixer grinder 3000").query, "mixer grinder");
  assert.equal(parseIntent("2000 ni andar saara earbuds joie").query, "earbuds");
});
