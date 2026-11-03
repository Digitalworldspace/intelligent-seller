// Builds the SEO parts of the site from public/products.js. Run after changing products:
//   npm run seo
// It writes:
//   - the product list and structured data (JSON-LD) into public/index.html, so Google sees
//     the products without running JavaScript
//   - index.html at the repo root: the main page at https://digitalworldspace.github.io/intelligent-seller/
//   - sitemap.xml and robots.txt at the repo root

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { CATEGORIES, LANG_PAGES } from "./seo-pages.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://digitalworldspace.github.io/intelligent-seller/";
const BASE = "/intelligent-seller/";
const PUB = path.join(ROOT, "public");

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Read products.js the same way the browser does.
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(PUB, "products.js"), "utf8"), sandbox);
const products = (sandbox.window.IS_PRODUCTS || []).filter((p) => p && p.url && p.title);

// 1. Static product list (replaced by the live grid when the page's script runs).
const listHtml = products.length
  ? `<section class="panel"><h2>Today's best deals on trusted platforms</h2><ul class="seo-list">${products
      .map((p) => `<li><a href="${esc(p.url)}" rel="sponsored nofollow noopener" target="_blank">${esc(p.title)}</a> – ${esc(p.platform || "")}${p.free ? " – FREE" : ""}</li>`)
      .join("")}</ul></section>`
  : "";

// 2. Structured data: the website (with search box), the organisation and the product list.
const jsonld = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Intelligent Seller",
    alternateName: ["IntelligentSeller", "Intelligent Seller India"],
    url: SITE,
    inLanguage: ["en-IN", "hi-IN", "gu-IN", "mr-IN", "bn-IN", "ta-IN", "te-IN", "kn-IN", "ml-IN", "pa-IN"],
    description: "Search once and get the best product from Amazon.in, Flipkart and other trusted Indian stores, with a lucky draw to win ₹1,000 cash.",
    potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${SITE}?q={search_term_string}` }, "query-input": "required name=search_term_string" }
  },
  { "@context": "https://schema.org", "@type": "Organization", name: "Intelligent Seller", url: SITE, logo: `${SITE}public/og-icon.png` },
  products.length && {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Today's best deals",
    itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, url: p.url, ...(p.image ? { image: p.image } : {}) }))
  }
].filter(Boolean);
const jsonldHtml = jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n");

const between = (html, name, inner) => html.replace(new RegExp(`<!--SEO-${name}-START-->[\\s\\S]*?<!--SEO-${name}-END-->`), `<!--SEO-${name}-START-->${inner}<!--SEO-${name}-END-->`);

// ---------- Landing pages (one per category, in en / hi / gu) ----------
const fill = (t, v) => String(t).replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");
const matchProducts = (cat) => products.filter((p) => {
  const hay = (p.title + " " + (p.keywords || "")).toLowerCase();
  return cat.match.some((w) => hay.includes(w));
});
const pageUrl = (lang, slug) => `${SITE}${LANG_PAGES[lang].dir}deals/${slug}/`;
const pages = [];

for (const cat of CATEGORIES) {
  const items = matchProducts(cat);
  if (!items.length) continue;
  for (const [lang, L] of Object.entries(LANG_PAGES)) {
    const T = cat[lang];
    const url = pageUrl(lang, cat.slug);
    const alternates = Object.keys(LANG_PAGES).map((l) => `<link rel="alternate" hreflang="${LANG_PAGES[l].htmlLang}" href="${pageUrl(l, cat.slug)}">`).join("\n")
      + `\n<link rel="alternate" hreflang="x-default" href="${pageUrl("en", cat.slug)}">`;
    const ld = [
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: L.home, item: SITE },
        { "@type": "ListItem", position: 2, name: T.h1, item: url }] },
      { "@context": "https://schema.org", "@type": "ItemList", name: T.h1, itemListElement: items.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, url: p.url, ...(p.image ? { image: p.image } : {}) })) },
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: T.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }
    ].map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n");
    const others = CATEGORIES.filter((c) => c.slug !== cat.slug && matchProducts(c).length);
    const html = `<!doctype html>
<!-- Generated by scripts/build-seo.mjs. Edit scripts/seo-pages.mjs, then run: npm run seo -->
<html lang="${L.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(T.title)}</title>
<meta name="description" content="${esc(T.desc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
${alternates}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Intelligent Seller">
<meta property="og:title" content="${esc(T.title)}">
<meta property="og:description" content="${esc(T.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${items[0].image || SITE + "public/og-image.png"}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1d5a48">
<link rel="icon" href="${BASE}public/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hind+Vadodara:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap">
<link rel="stylesheet" href="${BASE}public/styles.css">
${ld}
</head>
<body>
<header class="top"><div class="top-in">
  <a class="brand" href="${BASE}" style="text-decoration:none;color:inherit"><div class="mark" aria-hidden="true">IS</div><div><b>Intelligent Seller</b><small>Your personal shopping expert</small></div></a>
  <nav class="tools lang-links">${Object.entries(LANG_PAGES).map(([l, x]) => `<a class="btn btn-quiet" href="${pageUrl(l, cat.slug)}" hreflang="${x.htmlLang}"${l === lang ? ' aria-current="page"' : ""}>${{ en: "English", hi: "हिन्दी", gu: "ગુજરાતી" }[l]}</a>`).join("")}</nav>
</div></header>
<main class="wrap">
  <nav class="crumbs"><a href="${BASE}">${esc(L.home)}</a> › <span>${esc(T.h1)}</span></nav>
  <section class="search-panel">
    <div class="say"><div class="av" aria-hidden="true">IS</div><div class="bubble"><h1>${esc(T.h1)}</h1><p>${esc(T.intro)}</p></div></div>
    <form class="bar" action="${BASE}" method="get" role="search"><input name="q" value="${esc(cat.q)}" aria-label="Search"><button type="submit" class="btn btn-primary">${esc(L.searchBtn)}</button></form>
  </section>
  <div class="layout">
    <div class="main-col">
      <section class="deals-wrap">
        <div class="say"><div class="av" aria-hidden="true">IS</div><div class="bubble"><p>${esc(fill(L.picked, { n: items.length }))}. ${esc(L.win)}</p></div></div>
        <div class="deals">${items.map((p) => `
          <article class="deal">
            <a class="deal-img" href="${esc(p.url)}" target="_blank" rel="sponsored nofollow noopener">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" width="300" height="300">` : ""}</a>
            <h2 class="deal-h">${esc(p.title)}</h2>
            <div class="meta"><span>${esc(p.platform || "")}</span></div>
            ${p.free ? '<div class="price-row"><span class="price free">FREE</span></div>' : ""}
            ${(p.benefits || []).length ? `<ul class="fac">${p.benefits.slice(0, 3).map((b) => `<li>✓ ${esc(b)}</li>`).join("")}</ul>` : ""}
            <a class="btn btn-primary btn-block" href="${esc(p.url)}" target="_blank" rel="sponsored nofollow noopener">${esc(fill(L.seeOn, { p: p.platform || "Amazon.in" }))}</a>
          </article>`).join("")}</div>
      </section>
      <section class="panel faq"><h2>${esc(L.faqT)}</h2>${T.faq.map(([q, a]) => `<details open><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</section>
      ${others.length ? `<section class="panel"><h2>${esc(L.related)}</h2><ul class="seo-list">${others.map((c) => `<li><a href="${pageUrl(lang, c.slug)}">${esc(c[lang].h1)}</a></li>`).join("")}</ul></section>` : ""}
      <p class="aff">${esc(L.note)}</p>
    </div>
    <aside class="side"><div class="side-in"><section class="panel cash-panel cash-banner">
      <div class="cash-hero"><span class="cash-amt num">₹1,000</span><span class="cash-word">CASH</span></div>
      <p>${esc(L.win)}</p>
      <a class="btn btn-cash btn-block" href="${BASE}">${esc(L.searchMore)}</a>
    </section></div></aside>
  </div>
</main>
</body>
</html>
`;
    const out = path.join(ROOT, L.dir, "deals", cat.slug, "index.html");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html);
    pages.push({ url, lang, slug: cat.slug, h1: T.h1 });
  }
}

// Links from the home page to the English category pages (and their translations).
const catLinks = pages.length
  ? `<section class="panel"><h2>Shop by category</h2><ul class="seo-list cat-links">${CATEGORIES.filter((c) => pages.some((p) => p.slug === c.slug)).map((c) =>
      `<li><a href="${pageUrl("en", c.slug)}">${esc(c.en.h1)}</a> · <a href="${pageUrl("hi", c.slug)}" hreflang="hi-IN">${esc(c.hi.h1)}</a> · <a href="${pageUrl("gu", c.slug)}" hreflang="gu-IN">${esc(c.gu.h1)}</a></li>`).join("")}</ul></section>`
  : "";

let page = fs.readFileSync(path.join(PUB, "index.html"), "utf8");
page = between(page, "PRODUCTS", listHtml);
page = between(page, "JSONLD", jsonldHtml);
page = between(page, "CATS", catLinks);
fs.writeFileSync(path.join(PUB, "index.html"), page);

// 3. Root page: same page, with paths pointing into public/.
const rootPage = page
  .replace(/(href|src)="(?!https?:|#|data:|\/)([^"]+)"/g, (m, attr, p) => `${attr}="public/${p}"`)
  .replace("<!doctype html>", "<!doctype html>\n<!-- Generated by scripts/build-seo.mjs from public/index.html. Edit that file, then run: npm run seo -->");
fs.writeFileSync(path.join(ROOT, "index.html"), rootPage);

// 4. Sitemap and robots.txt
const today = new Date().toISOString().slice(0, 10);
const alt = (slug) => Object.keys(LANG_PAGES).map((l) => `    <xhtml:link rel="alternate" hreflang="${LANG_PAGES[l].htmlLang}" href="${pageUrl(l, slug)}"/>`).join("\n");
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url><loc>${SITE}</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
${pages.map((p) => `  <url><loc>${p.url}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority>
${alt(p.slug)}
  </url>`).join("\n")}
</urlset>
`);
fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *
Allow: /
Disallow: /intelligent-seller/public/setup.html

Sitemap: ${SITE}sitemap.xml
`);

console.log(`SEO built: ${products.length} products, ${pages.length} landing pages, index.html, sitemap.xml, robots.txt`);
