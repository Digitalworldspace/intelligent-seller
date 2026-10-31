import "dotenv/config";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { PLATFORMS } from "./src/config/platforms.js";
import { searchAmazon, amazonConfigured } from "./src/providers/amazon.js";
import { searchFlipkart, flipkartConfigured } from "./src/providers/flipkart.js";
import { scoreProducts, SCORE_PARTS } from "./src/lib/score.js";
import { aiSeller } from "./src/lib/seller.js";
import { platformLinks, facilitiesFor } from "./src/lib/links.js";
import { TtlCache } from "./src/lib/util.js";
import { t, isLang } from "./public/i18n.js";

const env = process.env;
const app = express();
const dir = path.dirname(fileURLToPath(import.meta.url));
const cache = new TtlCache(10 * 60 * 1000); // 10 minutes; prices change, so keep it short
const DATA_DIR = env.DATA_DIR || path.join(dir, "data");
const CLAIMS_FILE = path.join(DATA_DIR, "claims.jsonl");

const PROVIDERS = [
  { key: "amazon", ready: amazonConfigured, search: searchAmazon },
  { key: "flipkart", ready: flipkartConfigured, search: searchFlipkart }
];

app.disable("x-powered-by");
app.set("trust proxy", 1);

// Allow the GitHub Pages site (or any site you list) to call this server.
app.use("/api", (req, res, next) => {
  const allowed = (env.ALLOWED_ORIGINS || "*").split(",").map((s) => s.trim());
  const origin = req.headers.origin;
  if (allowed.includes("*")) res.set("Access-Control-Allow-Origin", "*");
  else if (origin && allowed.includes(origin)) { res.set("Access-Control-Allow-Origin", origin); res.set("Vary", "Origin"); }
  res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express.static(path.join(dir, "public"), { maxAge: "1h" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    providers: Object.fromEntries(PROVIDERS.map((p) => [p.key, p.ready(env)])),
    ai: Boolean(env.ANTHROPIC_API_KEY),
    claims: true
  });
});

app.get("/api/search", async (req, res) => {
  const q = String(req.query.q || "").trim().slice(0, 100);
  const lang = isLang(req.query.lang) ? req.query.lang : "en";
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
  const sites = platformLinks(q, env);
  const platformsWithData = new Set(products.map((p) => p.platform)).size;
  const seller = await aiSeller(q, ranked, platformsWithData, lang, env, sites.length);

  // Put the seller's chosen product first.
  if (seller.bestId) {
    const i = ranked.findIndex((p) => p.id === seller.bestId);
    if (i > 0) ranked = [ranked[i], ...ranked.slice(0, i), ...ranked.slice(i + 1)];
  }
  const best = ranked[0] || null;
  const labels = t(lang, "parts");

  const payload = {
    query: q,
    lang,
    source: "server",
    live: products.length > 0,
    best: best && { ...best, platformName: PLATFORMS[best.platform].name, facilities: facilitiesFor(best.platform, lang) },
    others: ranked.slice(1, 9).map((p) => ({ ...p, platformName: PLATFORMS[p.platform].name })),
    seller,
    scoreParts: SCORE_PARTS.map((s) => ({ key: s.key, max: s.max, label: labels[s.key] })),
    sites,
    errors: errors.map((e) => e.platform),
    checkedAt: new Date().toISOString()
  };
  if (!errors.length) cache.set(key, payload);
  res.json(payload);
});

// ---------- Cashback claims ----------
const recent = new TtlCache(60 * 60 * 1000, 5000);
// Cashback slabs, same as public/config.js. Override with CASHBACK_TIERS, e.g. [{"min":999,"amount":50}, ...]
const DEFAULT_TIERS = [{ min: 999, amount: 50 }, { min: 4999, amount: 200 }, { min: 14999, amount: 500 }, { min: 24999, amount: 1000 }];
const TIERS = (() => {
  try { const v = JSON.parse(env.CASHBACK_TIERS || "null"); if (Array.isArray(v) && v.length) return v.map((x) => ({ min: Number(x.min) || 0, amount: Number(x.amount) || 0 })).sort((a, b) => a.min - b.min); }
  catch { console.warn("CASHBACK_TIERS is not valid JSON; using the default slabs."); }
  return DEFAULT_TIERS;
})();
const cashbackFor = (orderAmount) => { let a = 0; for (const x of TIERS) if (orderAmount >= x.min) a = x.amount; return a; };
const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);

app.post("/api/cashback", express.json({ limit: "4kb" }), (req, res) => {
  const ipKey = crypto.createHash("sha256").update(String(req.ip)).digest("hex").slice(0, 16);
  const count = recent.get(ipKey) || 0;
  if (count >= 5) return res.status(429).json({ error: "Too many claims from this device. Please try again later." });

  const b = req.body || {};
  const claim = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    orderId: clean(b.orderId, 60),
    platform: clean(b.platform, 40),
    amount: Number(b.amount) || 0,
    name: clean(b.name, 80),
    payTo: clean(b.payTo, 80),
    lang: isLang(b.lang) ? b.lang : "en",
    status: "pending"
  };
  if (!claim.orderId || !claim.platform || !claim.name || !claim.payTo || claim.amount <= 0) {
    return res.status(400).json({ error: "Please fill in every field." });
  }
  claim.cashback = cashbackFor(claim.amount);
  if (!claim.cashback) return res.status(400).json({ error: `Cashback starts from orders of ₹${TIERS[0]?.min ?? 0}.` });

  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.appendFileSync(CLAIMS_FILE, JSON.stringify(claim) + "\n");
  } catch (e) {
    console.error("Could not save claim:", e.message);
    return res.status(500).json({ error: "Could not save your claim. Please try again." });
  }
  recent.set(ipKey, count + 1);
  res.json({ ok: true, id: claim.id });
});

// Download all claims (for you, the owner). Call with header: x-admin-key: <ADMIN_KEY>
app.get("/api/cashback/claims", (req, res) => {
  const key = env.ADMIN_KEY;
  const given = String(req.headers["x-admin-key"] || "");
  if (!key || given.length !== key.length || !crypto.timingSafeEqual(Buffer.from(given), Buffer.from(key))) {
    return res.status(401).json({ error: "Not allowed." });
  }
  let rows = [];
  try { rows = fs.readFileSync(CLAIMS_FILE, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)); } catch { /* no claims yet */ }
  res.json({ count: rows.length, claims: rows });
});

const port = Number(env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Intelligent Seller running on http://localhost:${port}`);
  for (const p of PROVIDERS) console.log(`  ${PLATFORMS[p.key].name}: ${p.ready(env) ? "connected" : "not configured (search links only)"}`);
  console.log(`  AI seller: ${env.ANTHROPIC_API_KEY ? "on" : "off (using built-in rules)"}`);
  console.log(`  Cashback claims saved to: ${CLAIMS_FILE}`);
});
