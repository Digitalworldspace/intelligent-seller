// Search links to every trusted platform, so the customer can always continue
// on a trusted site even when no live product data is available.

import { PLATFORMS, FASHION_WORDS, BEAUTY_WORDS } from "../config/platforms.js";
import { t } from "../../public/i18n.js";

export function wrapAffiliate(url, env, platformKey) {
  const p = PLATFORMS[platformKey];
  if (p?.ownAffiliate) return url; // Amazon & Flipkart links already carry your own ids
  const tpl = env.AFFILIATE_LINK_TEMPLATE;
  return tpl ? tpl.replace("{url}", encodeURIComponent(url)) : url;
}

// Make sure a product link from Amazon or Flipkart carries your affiliate id,
// even if the API ever returns a link without it.
export function ensureAffiliate(url, platformKey, env) {
  try {
    const u = new URL(url);
    if (platformKey === "amazon" && env.AMAZON_PARTNER_TAG && !u.searchParams.get("tag")) u.searchParams.set("tag", env.AMAZON_PARTNER_TAG);
    if (platformKey === "flipkart" && env.FLIPKART_AFFILIATE_ID && !u.searchParams.get("affid")) u.searchParams.set("affid", env.FLIPKART_AFFILIATE_ID);
    return u.toString();
  } catch {
    return url;
  }
}

export function platformLinks(q, env) {
  const isFashion = FASHION_WORDS.test(q);
  const isBeauty = BEAUTY_WORDS.test(q);
  return Object.entries(PLATFORMS)
    .filter(([, p]) => !p.category || (p.category === "fashion" && isFashion) || (p.category === "beauty" && isBeauty))
    .map(([key, p]) => ({ key, name: p.name, url: wrapAffiliate(p.search(q, env), env, key) }));
}

export function facilitiesFor(key, lang = "en") {
  const p = PLATFORMS[key];
  if (!p) return [];
  const fac = t(lang, "fac");
  return p.facilities.map((k) => fac[k] || t("en", "fac")[k]).filter(Boolean);
}
