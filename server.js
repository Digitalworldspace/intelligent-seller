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
import { platformLinks, facilitiesFor, ensureAffiliate } from "./src/lib/links.js";
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
    affiliate: { amazonTag: Boolean(env.AMAZON_PARTNER_TAG), flipkartId: Boolean(env.FLIPKART_AFFILIATE_ID), otherStores: Boolean(env.AFFILIATE_LINK_TEMPLATE) },
    claims: true,
    draw: { prize: DRAW.prize, winnersPerMonth: DRAW.perMonth }
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

  const products = results.flat().map((p) => ({ ...p, url: ensureAffiliate(p.url, p.platform, env) }));
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

// ---------- Monthly lucky draw ----------
// Customers send their order as an entry. You verify entries against your affiliate dashboard,
// then run the draw at month end. Only the winner(s) get the prize.
const recent = new TtlCache(60 * 60 * 1000, 5000);
const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
const WINNERS_FILE = path.join(DATA_DIR, "winners.json");
const DRAW = {
  prize: Number(env.DRAW_PRIZE) || 1000,
  perMonth: Math.max(1, Number(env.DRAW_WINNERS_PER_MONTH) || 1),
  minOrder: Number(env.DRAW_MIN_ORDER) || 0
};

const readEntries = () => { try { return fs.readFileSync(CLAIMS_FILE, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; } };
const writeEntries = (rows) => { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(CLAIMS_FILE, rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : "")); };
const readWinners = () => { try { return JSON.parse(fs.readFileSync(WINNERS_FILE, "utf8")); } catch { return []; } };
const writeWinners = (rows) => { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.writeFileSync(WINNERS_FILE, JSON.stringify(rows, null, 2)); };
// Public name: first name + first letter of the last name, e.g. "Priya S."
const publicName = (name) => { const p = String(name).trim().split(/\s+/); return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : p[0]; };
const monthOf = (iso) => new Date(new Date(iso).getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 7); // month in India time

function isAdmin(req) {
  const key = env.ADMIN_KEY;
  const given = String(req.headers["x-admin-key"] || "");
  return Boolean(key) && given.length === key.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(key));
}

// A customer enters the draw with an order placed through the site.
app.post("/api/cashback", express.json({ limit: "4kb" }), (req, res) => {
  const ipKey = crypto.createHash("sha256").update(String(req.ip)).digest("hex").slice(0, 16);
  const count = recent.get(ipKey) || 0;
  if (count >= 5) return res.status(429).json({ error: "Too many entries from this device. Please try again later." });

  const b = req.body || {};
  const entry = {
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
  if (!entry.orderId || !entry.platform || !entry.name || !entry.payTo || entry.amount <= 0) {
    return res.status(400).json({ error: "Please fill in every field." });
  }
  if (DRAW.minOrder && entry.amount < DRAW.minOrder) return res.status(400).json({ error: `Orders of ₹${DRAW.minOrder} or more can enter the draw.` });
  const rows = readEntries();
  if (rows.some((r) => r.orderId.toLowerCase() === entry.orderId.toLowerCase() && r.platform === entry.platform)) {
    return res.status(409).json({ error: "This order is already in the draw." });
  }
  try { rows.push(entry); writeEntries(rows); }
  catch (e) { console.error("Could not save entry:", e.message); return res.status(500).json({ error: "Could not save your entry. Please try again." }); }
  recent.set(ipKey, count + 1);
  res.json({ ok: true, id: entry.id });
});

// Public list of winners (first name + initial only).
app.get("/api/winners", (_req, res) => {
  res.json({ prize: DRAW.prize, winners: readWinners().map((w) => ({ month: w.month, name: w.publicName, city: w.city || "" })) });
});

// ----- Owner only (header x-admin-key: ADMIN_KEY) -----
app.get("/api/cashback/claims", (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Not allowed." });
  const rows = readEntries();
  res.json({ count: rows.length, entries: rows, winners: readWinners() });
});

// Mark entries after checking them in your affiliate dashboard: { "ids": [...], "status": "verified" | "rejected" }
app.post("/api/draw/verify", express.json({ limit: "64kb" }), (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Not allowed." });
  const ids = new Set(Array.isArray(req.body?.ids) ? req.body.ids : []);
  const status = req.body?.status === "rejected" ? "rejected" : "verified";
  const rows = readEntries();
  let changed = 0;
  for (const r of rows) if (ids.has(r.id)) { r.status = status; changed++; }
  writeEntries(rows);
  res.json({ ok: true, changed });
});

// Pick the month's winner(s) at random from verified entries: { "month": "2026-11" }
app.post("/api/draw/run", express.json({ limit: "4kb" }), (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: "Not allowed." });
  const month = /^\d{4}-\d{2}$/.test(req.body?.month || "") ? req.body.month : monthOf(new Date().toISOString());
  const winners = readWinners();
  if (winners.some((w) => w.month === month)) return res.status(409).json({ error: `The draw for ${month} has already been run.`, winners: winners.filter((w) => w.month === month) });
  const pool = readEntries().filter((r) => r.status === "verified" && monthOf(r.at) === month);
  if (!pool.length) return res.status(400).json({ error: `No verified entries for ${month}. Verify entries first.` });
  const picked = [];
  const left = [...pool];
  while (picked.length < DRAW.perMonth && left.length) picked.push(left.splice(crypto.randomInt(left.length), 1)[0]);
  const rows = picked.map((e) => ({ month, entryId: e.id, publicName: publicName(e.name), name: e.name, payTo: e.payTo, orderId: e.orderId, platform: e.platform, prize: DRAW.prize, city: clean(req.body?.city, 40), drawnAt: new Date().toISOString(), entries: pool.length }));
  writeWinners([...rows, ...winners]);
  res.json({ ok: true, month, entries: pool.length, winners: rows });
});

const port = Number(env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Intelligent Seller running on http://localhost:${port}`);
  for (const p of PROVIDERS) console.log(`  ${PLATFORMS[p.key].name}: ${p.ready(env) ? "connected" : "not configured (search links only)"}`);
  console.log(`  AI seller: ${env.ANTHROPIC_API_KEY ? "on" : "off (using built-in rules)"}`);
  console.log(`  Lucky draw entries saved to: ${CLAIMS_FILE}`);
});
