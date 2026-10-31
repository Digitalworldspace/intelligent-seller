import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PLATFORMS } from "./src/config/platforms.js";
import { searchAmazon, amazonConfigured } from "./src/providers/amazon.js";
import { searchFlipkart, flipkartConfigured } from "./src/providers/flipkart.js";
import { scoreProducts, SCORE_PARTS } from "./src/lib/score.js";
import { aiSeller } from "./src/lib/seller.js";
import { platformLinks, facilitiesFor } from "./src/lib/links.js";
import { TtlCache } from "./src/lib/util.js";

const env = process.env;
const app = express();
const dir = path.dirname(fileURLToPath(import.meta.url));
const cache = new TtlCache(10 * 60 * 1000); // 10 minutes; prices change, so keep it short

const PROVIDERS = [
  { key: "amazon", ready: amazonConfigured, search: searchAmazon },
  { key: "flipkart", ready: flipkartConfigured, search: searchFlipkart }
];

app.disable("x-powered-by");
app.use(express.static(path.join(dir, "public"), { maxAge: "1h" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    providers: Object.fromEntries(PROVIDERS.map((p) => [p.key, p.ready(env)])),
    ai: Boolean(env.ANTHROPIC_API_KEY)
  });
});

app.get("/api/search", async (req, res) => {
  const q = String(req.query.q || "").trim().slice(0, 100);
  const lang = req.query.lang === "gu" ? "gu" : "en";
  if (!q) return res.status(400).json({ error: "Type what you want to buy." });

  const key = `${lang}|${q.toLowerCase()}`;
  const hit = cache.get(key);
  if (hit) return res.json(hit);

  const active = PROVIDERS.filter((p) => p.ready(env));
  const errors = [];
  const results = await Promise.all(active.map(async (p) => {
    try { return await p.search(q, env); }
    catch (e) { errors.push({ platform: PLATFORMS[p.key].name, message: e.message }); console.warn(p.key, e.message); return []; }
  }));

  const products = results.flat();
  let ranked = scoreProducts(products, q);
  const platformsWithData = new Set(products.map((p) => p.platform)).size;
  const seller = await aiSeller(q, ranked, platformsWithData, lang, env);

  // Put the seller's chosen product first.
  if (seller.bestId) {
    const i = ranked.findIndex((p) => p.id === seller.bestId);
    if (i > 0) ranked = [ranked[i], ...ranked.slice(0, i), ...ranked.slice(i + 1)];
  }
  const best = ranked[0] || null;

  const payload = {
    query: q,
    lang,
    live: products.length > 0,
    best: best && { ...best, platformName: PLATFORMS[best.platform].name, facilities: facilitiesFor(best.platform, lang) },
    others: ranked.slice(1, 9).map((p) => ({ ...p, platformName: PLATFORMS[p.platform].name })),
    seller,
    scoreParts: SCORE_PARTS.map((s) => ({ key: s.key, max: s.max, label: s[lang] })),
    sites: platformLinks(q, env, lang),
    errors: errors.map((e) => e.platform),
    checkedAt: new Date().toISOString()
  };
  if (!errors.length) cache.set(key, payload);
  res.json(payload);
});

const port = Number(env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Intelligent Seller running on http://localhost:${port}`);
  for (const p of PROVIDERS) console.log(`  ${PLATFORMS[p.key].name}: ${p.ready(env) ? "connected" : "not configured (search links only)"}`);
  console.log(`  AI seller: ${env.ANTHROPIC_API_KEY ? "on" : "off (using built-in rules)"}`);
});
