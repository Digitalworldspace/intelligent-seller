// The "Intelligent Seller": turns ranked products into a short sales pitch
// with the best product's advantages. Uses Claude when ANTHROPIC_API_KEY is set,
// otherwise built-in rules. Both only use facts that came from the platforms.

import { PLATFORMS } from "../config/platforms.js";
import { median } from "./score.js";

const inr = (n) => Math.round(n).toLocaleString("en-IN");

const TXT = {
  en: {
    intro: (q, n, k) => `You searched for “${q}”. I checked ${n} products on ${k} trusted ${k === 1 ? "platform" : "platforms"}.`,
    pick: (name) => `My advice: buy the ${name}.`,
    rest: "Its benefits are listed below, with other good options if you want to compare.",
    noLive: (q) => `Here is “${q}” on India's trusted shopping sites. Tap any site to see its best offers.`,
    rating: (r, n, type) => type === "seller" ? `Sold by a seller rated ${r}★ by ${inr(n || 0)} buyers` : `${r}★ rating from ${inr(n || 0)} buyers`,
    save: (s, pc) => `You save ₹${inr(s)} (${pc}% off MRP)`,
    cheaper: (s) => `₹${inr(s)} cheaper than the typical price of the options I checked`,
    stock: "In stock now",
    cod: "Cash on delivery available",
    platform: (p) => `Sold on ${p}, a trusted platform`,
    line: (p) => p.mrp ? `${Math.round((1 - p.price / p.mrp) * 100)}% off, from a trusted platform` : "Top match for your search on a trusted platform"
  },
  gu: {
    intro: (q, n, k) => `તમે “${q}” શોધ્યું. મેં ${k} વિશ્વાસપાત્ર પ્લેટફોર્મ પર ${n} પ્રોડક્ટ ચકાસી.`,
    pick: (name) => `મારી સલાહ: ${name} લઈ લો.`,
    rest: "નીચે તેના ફાયદા આપ્યા છે, અને સરખામણી માટે બીજા સારા વિકલ્પો પણ.",
    noLive: (q) => `ભારતની વિશ્વાસપાત્ર શોપિંગ સાઇટ પર “${q}” અહીં છે. કોઈપણ સાઇટ પર ટેપ કરી શ્રેષ્ઠ ઓફર જુઓ.`,
    rating: (r, n, type) => type === "seller" ? `${inr(n || 0)} ગ્રાહકોએ ${r}★ આપેલ સેલર વેચે છે` : `${inr(n || 0)} ગ્રાહકોનું ${r}★ રેટિંગ`,
    save: (s, pc) => `તમે ₹${inr(s)} બચાવો છો (MRP પર ${pc}% છૂટ)`,
    cheaper: (s) => `મેં ચકાસેલા વિકલ્પોની સામાન્ય કિંમત કરતા ₹${inr(s)} સસ્તું`,
    stock: "હાલ સ્ટોકમાં છે",
    cod: "કેશ ઓન ડિલિવરી ઉપલબ્ધ",
    platform: (p) => `${p} પર મળે છે, વિશ્વાસપાત્ર પ્લેટફોર્મ`,
    line: (p) => p.mrp ? `${Math.round((1 - p.price / p.mrp) * 100)}% છૂટ, વિશ્વાસપાત્ર પ્લેટફોર્મ પરથી` : "તમારી શોધ માટે વિશ્વાસપાત્ર પ્લેટફોર્મ પરનો શ્રેષ્ઠ મેળ"
  }
};

function ruleAdvantages(best, all, lang) {
  const t = TXT[lang];
  const out = [];
  if (best.rating != null) out.push(t.rating(best.rating, best.ratingCount, best.ratingType));
  if (best.mrp) out.push(t.save(best.mrp - best.price, Math.round((1 - best.price / best.mrp) * 100)));
  const med = median(all.map((p) => p.price));
  if (med && med - best.price > 50) out.push(t.cheaper(med - best.price));
  best.features.slice(0, 3).forEach((f) => out.push(String(f)));
  if (best.inStock) out.push(t.stock);
  if (best.cod) out.push(t.cod);
  out.push(t.platform(PLATFORMS[best.platform]?.name || best.platform));
  return out;
}

export function ruleSeller(q, ranked, platformCount, lang) {
  const t = TXT[lang] || TXT.en;
  if (!ranked.length) return { bestId: null, message: [t.noLive(q)], bestLine: "", advantages: [], source: "rules" };
  const best = ranked[0];
  return {
    bestId: best.id,
    message: [t.intro(q, ranked.length, platformCount), t.pick(shortName(best.title)), t.rest],
    bestLine: t.line(best),
    advantages: ruleAdvantages(best, ranked, lang),
    source: "rules"
  };
}

function shortName(title) {
  const words = title.split(/\s+/);
  return words.length > 9 ? words.slice(0, 9).join(" ") + "…" : title;
}

export async function aiSeller(q, ranked, platformCount, lang, env) {
  const fallback = ruleSeller(q, ranked, platformCount, lang);
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

  const language = lang === "gu" ? "Gujarati (Gujarati script)" : "simple English";
  const system = [
    "You are the Intelligent Seller on an Indian shopping portal. The customer only typed a search; do not ask them questions.",
    "Pick the single best product for this search from the JSON list and sell it warmly but honestly.",
    "Use ONLY facts present in the JSON. Never invent ratings, specs, delivery times, offers or prices.",
    "If rating_is_for is \"seller\", say it is the seller's rating, not the product's.",
    "Prefer products that actually match the search (not accessories), then good ratings, real discount and value.",
    `Write in ${language}. Reply with JSON only, no other text:`,
    '{"bestId": "<id from the list>", "message": ["2 or 3 short sentences talking to the customer"], "bestLine": "one punchy sales line, max 14 words", "advantages": ["3 to 6 short benefit bullets"]}'
  ].join("\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: AbortSignal.timeout(20000),
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
        max_tokens: 800,
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
      bestLine: String(json.bestLine || fallback.bestLine).slice(0, 140),
      advantages: (Array.isArray(json.advantages) ? json.advantages : []).slice(0, 6).map(String),
      source: "ai"
    };
  } catch (e) {
    console.warn("AI seller fell back to rules:", e.message);
    return fallback;
  }
}
