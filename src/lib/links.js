// Search links to every trusted platform, so the customer can always continue
// on a trusted site even when no live product data is available.

import { PLATFORMS, FASHION_WORDS, BEAUTY_WORDS } from "../config/platforms.js";

export function wrapAffiliate(url, env, platformKey) {
  const p = PLATFORMS[platformKey];
  if (p?.ownAffiliate) return url; // Amazon & Flipkart links already carry your own ids
  const tpl = env.AFFILIATE_LINK_TEMPLATE;
  return tpl ? tpl.replace("{url}", encodeURIComponent(url)) : url;
}

export function platformLinks(q, env, lang = "en") {
  const isFashion = FASHION_WORDS.test(q);
  const isBeauty = BEAUTY_WORDS.test(q);
  return Object.entries(PLATFORMS)
    .filter(([, p]) => !p.category || (p.category === "fashion" && isFashion) || (p.category === "beauty" && isBeauty))
    .map(([key, p]) => ({
      key,
      name: p.name,
      url: wrapAffiliate(p.search(q, env), env, key),
      facilities: facilitiesFor(key, lang)
    }));
}

export function facilitiesFor(key, lang = "en") {
  const p = PLATFORMS[key];
  if (!p) return [];
  return p.facilities.map((f) => (lang === "gu" ? { title: f[2], detail: f[3] } : { title: f[0], detail: f[1] }));
}
