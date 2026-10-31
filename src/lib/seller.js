// The "Intelligent Seller": turns ranked products into a short sales pitch
// with the best product's advantages, in the customer's language.
// Uses Claude when ANTHROPIC_API_KEY is set, otherwise built-in rules.
// Both use only facts that came from the platforms.

import { PLATFORMS } from "../config/platforms.js";
import { median } from "./score.js";
import { t, fmt, LANGS } from "../../public/i18n.js";

const inr = (n) => Math.round(n).toLocaleString("en-IN");
const shortName = (title) => { const w = title.split(/\s+/); return w.length > 9 ? w.slice(0, 9).join(" ") + "…" : title; };

function ruleAdvantages(best, all, lang) {
  const out = [];
  if (best.rating != null) out.push(fmt(t(lang, best.ratingType === "seller" ? "sellerRat" : "rating"), { r: best.rating, n: inr(best.ratingCount || 0) }));
  if (best.mrp) out.push(fmt(t(lang, "save"), { s: inr(best.mrp - best.price), pc: Math.round((1 - best.price / best.mrp) * 100) }));
  const med = median(all.map((p) => p.price));
  if (med && med - best.price > 50) out.push(fmt(t(lang, "cheaper"), { s: inr(med - best.price) }));
  best.features.slice(0, 3).forEach((f) => out.push(String(f)));
  if (best.inStock) out.push(t(lang, "stock"));
  if (best.cod) out.push(t(lang, "cod"));
  out.push(fmt(t(lang, "sold"), { p: PLATFORMS[best.platform]?.name || best.platform }));
  return out;
}

export function ruleSeller(q, ranked, platformCount, lang, siteCount = 0) {
  if (!ranked.length) {
    return { bestId: null, message: [fmt(t(lang, "noLive"), { q, n: siteCount }), t(lang, "noLive2")], bestLine: "", advantages: [], source: "rules" };
  }
  const best = ranked[0];
  return {
    bestId: best.id,
    message: [fmt(t(lang, "intro"), { q, n: ranked.length, k: platformCount }), fmt(t(lang, "pick"), { name: shortName(best.title) }), t(lang, "rest")],
    bestLine: best.mrp ? fmt(t(lang, "lineOff"), { pc: Math.round((1 - best.price / best.mrp) * 100) }) : t(lang, "lineTop"),
    advantages: ruleAdvantages(best, ranked, lang),
    source: "rules"
  };
}

export async function aiSeller(q, ranked, platformCount, lang, env, siteCount = 0) {
  const fallback = ruleSeller(q, ranked, platformCount, lang, siteCount);
  if (!env.ANTHROPIC_API_KEY || ranked.length === 0) return fallback;

  const top = ranked.slice(0, 8).map((p) => ({
    id: p.id,
    platform: PLATFORMS[p.platform]?.name,
    title: p.title,
    brand: p.brand || undefined,
    price_inr: p.price,
    mrp_inr: p.mrp || undefined,
    rating: p.rating ?? undefined,
    rating_count: p.ratingCount ?? undefined,
    rating_is_for: p.rating != null ? p.ratingType : undefined,
    in_stock: p.inStock,
    cash_on_delivery: p.cod ?? undefined,
    features: p.features.length ? p.features : undefined,
    score: p.score
  }));

  const language = LANGS.find((l) => l.code === lang)?.ai || "simple English";
  const system = [
    "You are the Intelligent Seller on an Indian shopping portal. The customer only typed a search; do not ask them questions.",
    "Pick the single best product for this search from the JSON list and sell it warmly, like a trusted shopkeeper, but honestly.",
    "Use ONLY facts present in the JSON. Never invent ratings, specs, delivery times, offers, cashback or prices.",
    "If rating_is_for is \"seller\", say it is the seller's rating, not the product's.",
    "Prefer products that actually match the search (not accessories), then good ratings, real discount and value.",
    `Write in ${language}. Keep product names and brand names as they are. Reply with JSON only, no other text:`,
    '{"bestId": "<id from the list>", "message": ["2 or 3 short sentences talking to the customer"], "bestLine": "one punchy sales line, max 14 words", "advantages": ["3 to 6 short benefit bullets"]}'
  ].join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: AbortSignal.timeout(20000),
      headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
        max_tokens: 900,
        system,
        messages: [{ role: "user", content: `Search: ${q}\nPlatforms checked: ${platformCount}\nProducts:\n${JSON.stringify(top)}` }]
      })
    });
    if (!res.ok) throw new Error(`Claude HTTP ${res.status}`);
    const data = await res.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    if (!top.some((p) => p.id === json.bestId)) return fallback;
    return {
      bestId: json.bestId,
      message: Array.isArray(json.message) ? json.message.slice(0, 3).map(String) : [String(json.message)],
      bestLine: String(json.bestLine || fallback.bestLine).slice(0, 160),
      advantages: (Array.isArray(json.advantages) ? json.advantages : []).slice(0, 6).map(String),
      source: "ai"
    };
  } catch (e) {
    console.warn("AI seller fell back to rules:", e.message);
    return fallback;
  }
}
