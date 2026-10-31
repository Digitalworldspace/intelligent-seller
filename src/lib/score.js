// Transparent scoring. Every product is scored with the same rules,
// and the commission a platform pays never enters the score.

import { PLATFORMS } from "../config/platforms.js";

export const SCORE_PARTS = [
  { key: "match", max: 15, en: "Matches your search", gu: "તમારી શોધ સાથે મેળ" },
  { key: "rating", max: 25, en: "Buyer rating", gu: "ગ્રાહક રેટિંગ" },
  { key: "popularity", max: 10, en: "Number of ratings", gu: "રેટિંગની સંખ્યા" },
  { key: "discount", max: 15, en: "Discount on MRP", gu: "MRP પર છૂટ" },
  { key: "value", max: 10, en: "Price vs other options", gu: "બીજા વિકલ્પો સામે કિંમત" },
  { key: "trust", max: 15, en: "Platform trust", gu: "પ્લેટફોર્મ વિશ્વાસ" },
  { key: "availability", max: 10, en: "In stock & payment options", gu: "સ્ટોક અને પેમેન્ટ વિકલ્પ" }
];

const tokens = (s) => String(s).toLowerCase().split(/[^a-z0-9઀-૿]+/).filter((t) => t.length > 1);

function median(nums) {
  const a = nums.filter(Boolean).sort((x, y) => x - y);
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

const clamp01 = (x) => Math.max(0, Math.min(1, x));

export function scoreProducts(products, query) {
  const qt = tokens(query);
  const med = median(products.map((p) => p.price));

  const scored = products.map((p) => {
    const title = p.title.toLowerCase();
    const matchFrac = qt.length ? qt.filter((t) => title.includes(t)).length / qt.length : 1;
    const hasRating = p.rating != null;
    const parts = {
      match: matchFrac * 15,
      // Missing ratings count as neutral (half marks) so a product isn't punished for missing data.
      rating: hasRating ? clamp01((p.rating - 3) / 2) * 25 : 12.5,
      popularity: p.ratingCount ? clamp01(Math.log10(p.ratingCount) / 5) * 10 : 5,
      discount: p.mrp ? clamp01((1 - p.price / p.mrp) / 0.6) * 15 : 0,
      value: med ? clamp01(0.5 + (med - p.price) / (2 * med)) * 10 : 5,
      trust: clamp01(((PLATFORMS[p.platform]?.trust ?? 4) - 3.5) / 1.5) * 15,
      availability: (p.inStock ? 7 : 0) + (p.cod ? 3 : p.cod === null ? 1.5 : 0)
    };
    // Accessories that don't match the search at all are pushed down.
    const penalty = matchFrac === 0 ? 0.6 : 1;
    const total = Math.round(Object.values(parts).reduce((a, b) => a + b, 0) * penalty);
    return { ...p, score: total, parts: Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, Math.round(v)])) };
  });

  return scored.sort((a, b) => b.score - a.score);
}

export { median };
