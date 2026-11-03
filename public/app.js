// Intelligent Seller dashboard.
// The customer only searches. The page then shows, without asking anything:
// summary numbers, the best product with its benefits and a clear buy button,
// a comparison of all options, the seller's advice, the platform's facilities,
// cashback and trust information.

import { LANGS, CHIP_QUERIES, t as tr, fmt, isLang } from "./i18n.js";
import { parseIntent, filteredSearchUrl } from "./intent.js";

const CFG = window.IS_CONFIG || {};
const CB = { enabled: true, prize: 1000, winnersPerMonth: 1, minOrder: 0, winners: [], ...(CFG.luckyDraw || {}) };
const MIN_ORDER = Number(CB.minOrder) || 0;
let WINNERS = Array.isArray(CB.winners) ? CB.winners : [];
const CONTACT = CFG.contact || {};
const BASE = (CFG.apiBase || "").replace(/\/$/, "");

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const inr = (n) => Math.round(n).toLocaleString("en-IN");
const safeUrl = (u) => (/^https:\/\//i.test(u) ? u : "#");
const enc = encodeURIComponent;

// ---------- Language ----------
function pickLang() {
  try { const s = localStorage.getItem("is-lang"); if (isLang(s)) return s; } catch {}
  for (const l of navigator.languages || [navigator.language || "en"]) {
    const code = String(l).slice(0, 2).toLowerCase();
    if (isLang(code)) return code;
  }
  return "en";
}
let lang = pickLang();
const t = (key) => tr(lang, key);
const amt = () => inr(CB.prize);
const cbEligible = (price) => CB.enabled && price >= MIN_ORDER;
const drawVars = () => ({ amt: amt(), n: CB.winnersPerMonth, min: inr(MIN_ORDER) });
// The draw happens on the last day of the current month.
function daysLeft() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return Math.max(0, Math.round((end - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000));
}
function nextDrawDate() {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return d.toLocaleDateString(lang + "-IN", { day: "numeric", month: "long", year: "numeric" });
}

// ---------- Icons ----------
const ICON = {
  shield: '<svg class="i" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  lock: '<svg class="i" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  scale: '<svg class="i" viewBox="0 0 24 24"><path d="M12 4v16M6 20h12M5 8h14"/><path d="M5 8l-3 6a3 3 0 0 0 6 0zM19 8l-3 6a3 3 0 0 0 6 0z"/></svg>',
  gift: '<svg class="i" viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 13h18M12 9v12"/><path d="M12 9c-2-4-6-4-6-1.5S9 9 12 9zm0 0c2-4 6-4 6-1.5S15 9 12 9z"/></svg>',
  check: '<svg class="i" viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>',
  out: '<svg class="i" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  close: '<svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  star: '<svg class="i" viewBox="0 0 24 24"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>'
};

// ---------- Trusted platforms (used when the server isn't connected) ----------
const FASHION = /\b(shirt|t-?shirt|jeans|kurta|kurti|saree|sari|dress|top|shoes?|sneakers?|sandals?|chappal|jacket|hoodie|trousers?|pants?|palazzo|gown|co-?ord|lehenga|bag|handbag)\b/i;
const BEAUTY = /\b(lipstick|makeup|skincare|serum|cream|moisturi[sz]er|sunscreen|shampoo|conditioner|perfume|kajal|foundation|face ?wash|hair oil)\b/i;
const wrap = (url) => (CFG.linkTemplate ? CFG.linkTemplate.replace("{url}", enc(url)) : url);
const SITES = [
  { name: "Amazon.in", own: true, fac: ["fastDelivery", "easyReturns", "cod", "bankEmi"],
    url: (q) => `https://www.amazon.in/s?k=${enc(q)}${CFG.amazonTag ? `&tag=${enc(CFG.amazonTag)}` : ""}`,
    home: () => `https://www.amazon.in/${CFG.amazonTag ? `?tag=${enc(CFG.amazonTag)}` : ""}` },
  { name: "Flipkart", own: true, fac: ["wideDelivery", "easyReturns", "cod", "bankEmi"],
    url: (q) => `https://dl.flipkart.com/dl/search?q=${enc(q)}${CFG.flipkartAffid ? `&affid=${enc(CFG.flipkartAffid)}` : ""}`,
    home: () => `https://dl.flipkart.com/dl/${CFG.flipkartAffid ? `?affid=${enc(CFG.flipkartAffid)}` : ""}` },
  { name: "Croma", fac: ["tataStore", "storePickup", "extWarranty"], url: (q) => `https://www.croma.com/searchB?q=${enc(q)}%3Arelevance&text=${enc(q)}`, home: () => "https://www.croma.com/" },
  { name: "Reliance Digital", fac: ["storeNetwork", "installation", "bankEmi"], url: (q) => `https://www.reliancedigital.in/search?q=${enc(q)}`, home: () => "https://www.reliancedigital.in/" },
  { name: "Tata CLiQ", fac: ["authBrand", "easyReturns"], url: (q) => `https://www.tatacliq.com/search/?searchCategory=all&text=${enc(q)}`, home: () => "https://www.tatacliq.com/" },
  { name: "Myntra", cat: "fashion", fac: ["fashion", "sizeExchange"], url: (q) => `https://www.myntra.com/${enc(q.trim().toLowerCase().replace(/\s+/g, "-"))}`, home: () => "https://www.myntra.com/" },
  { name: "AJIO", cat: "fashion", fac: ["relFashion", "easyReturns"], url: (q) => `https://www.ajio.com/search/?text=${enc(q)}`, home: () => "https://www.ajio.com/" },
  { name: "Nykaa", cat: "beauty", fac: ["beauty", "authentic"], url: (q) => `https://www.nykaa.com/search/result/?q=${enc(q)}`, home: () => "https://www.nykaa.com/" }
];
const facText = (keys) => keys.map((k) => t("fac")[k]).filter(Boolean);
const siteFac = (name) => facText(SITES.find((x) => x.name === name)?.fac || []);

// Your Amazon tag / Flipkart id on every link, and Flipkart app-tracking deeplinks.
function withAffiliate(url, platform) {
  try {
    const u = new URL(url);
    if (/(^|\.)amazon\.in$/.test(u.hostname) && CFG.amazonTag && !u.searchParams.get("tag")) u.searchParams.set("tag", CFG.amazonTag);
    if (/(^|\.)flipkart\.com$/.test(u.hostname)) {
      if (u.hostname !== "dl.flipkart.com") { u.hostname = "dl.flipkart.com"; if (!u.pathname.startsWith("/dl/") && u.pathname !== "/dl") u.pathname = "/dl" + u.pathname; }
      if (CFG.flipkartAffid && !u.searchParams.get("affid")) u.searchParams.set("affid", CFG.flipkartAffid);
    }
    const own = /(^|\.)(amazon\.[a-z.]+|amzn\.to|link\.amazon|a\.co|flipkart\.com|fkrt\.it|fkrt\.cc)$/.test(u.hostname);
    return own ? u.toString() : wrap(u.toString());
  } catch { return url; }
}
const num = (v) => { const n = Number(String(v ?? "").replace(/[^\d.]/g, "")); return n > 0 ? n : null; };

// Products you add in public/products.js, shown first.
const FEATURED = (Array.isArray(window.IS_PRODUCTS) ? window.IS_PRODUCTS : [])
  .filter((p) => p && p.url && p.title)
  .map((p, i) => {
    const price = num(p.price), mrp = num(p.mrp);
    const site = SITES.find((x) => x.name.toLowerCase() === String(p.platform || "").toLowerCase());
    return {
      id: "own:" + i, featured: true, title: String(p.title), platformName: site ? site.name : String(p.platform || ""),
      url: withAffiliate(String(p.url)), image: p.image || "", price, mrp: mrp && price && mrp > price ? mrp : null,
      rating: num(p.rating), ratingCount: num(p.ratingCount), ratingType: "product", score: null, free: p.free === true,
      keywords: String(p.keywords || ""), line: String(p.line || ""), benefits: Array.isArray(p.benefits) ? p.benefits.map(String) : []
    };
  });
const tokens = (s) => String(s).toLowerCase().split(/[^a-z0-9\u0900-\u0DFF]+/).filter((x) => x.length > 1);
function matchFeatured(q) {
  const qt = tokens(q);
  return FEATURED.map((p) => {
    const hay = (p.title + " " + p.keywords).toLowerCase();
    return { p, hit: qt.filter((x) => hay.includes(x)).length };
  }).filter((x) => x.hit > 0).sort((a, b) => b.hit - a.hit).map((x) => x.p);
}
function ownAdvantages(p) {
  const out = [];
  if (p.rating != null) out.push(fmt(t("rating"), { r: p.rating, n: inr(p.ratingCount || 0) }));
  if (p.mrp && p.price) out.push(fmt(t("save"), { s: inr(p.mrp - p.price), pc: Math.round((1 - p.price / p.mrp) * 100) }));
  p.benefits.slice(0, 5).forEach((b) => out.push(b));
  if (p.platformName) out.push(fmt(t("sold"), { p: p.platformName }));
  return out;
}
const pctOff = (p) => (p.mrp && p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0);
function sitesFor(q) {
  return SITES
    .filter((s) => (q ? !s.cat || (s.cat === "fashion" && FASHION.test(q)) || (s.cat === "beauty" && BEAUTY.test(q)) : !s.cat))
    .map((s) => {
      const raw = q ? filteredSearchUrl(s.name, s.url(q), F) : s.home();
      return { name: s.name, url: s.own ? raw : wrap(raw), facilities: facText(s.fac) };
    });
}

// ---------- Server check ----------
let serverOK = false;
const serverReady = fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(4000) })
  .then((r) => (r.ok && (r.headers.get("content-type") || "").includes("json") ? r.json() : null))
  .then((j) => { serverOK = Boolean(j && j.ok); })
  .catch(() => { serverOK = false; });

// Winners from the server, when it is connected (otherwise from config.js).
serverReady.then(async () => {
  if (!serverOK) return;
  try {
    const r = await fetch(`${BASE}/api/winners`);
    const j = await r.json();
    if (Array.isArray(j.winners) && j.winners.length) {
      WINNERS = j.winners;
      document.querySelectorAll(".winners-box").forEach((el) => { el.outerHTML = winnersList(); });
    }
  } catch { /* keep config winners */ }
});

// ---------- Building blocks ----------
function kpis(items) {
  return `<section class="kpis">${items.filter(Boolean).map(([label, value, cls = ""]) =>
    `<div class="kpi ${cls}"><span>${esc(label)}</span><b class="num">${esc(value)}</b></div>`).join("")}</section>`;
}

// The seller speaks in chat bubbles; the customer's search shows as their own message.
function sellerSays(lines, extra = "") {
  return `<div class="say"><div class="av" aria-hidden="true">IS</div><div class="bubble">${lines.map((l) => `<p>${esc(l)}</p>`).join("")}${extra}</div></div>`;
}
function customerSays(text) {
  return `<div class="say me"><div class="bubble">${esc(text)}</div></div>`;
}
function advicePanel(lines) { return sellerSays(lines); }

function winnersList() {
  if (!CB.enabled) return "";
  const list = WINNERS.slice(0, 6);
  const body = list.length
    ? `<ul class="winners">${list.map((w) => `<li><span class="w-ic">${ICON.star}</span><span><b>${esc(w.name)}</b>${w.city ? ` · ${esc(w.city)}` : ""}</span><span class="num">${esc(w.month || "")}</span></li>`).join("")}</ul>`
    : `<p class="min">${esc(fmt(t("noWinners"), { d: nextDrawDate() }))}</p>`;
  return `<div class="winners-box"><div class="label">${esc(t("winnersT"))}</div>${body}</div>`;
}

function cashPanel() {
  if (!CB.enabled) return "";
  const v = drawVars();
  const lines = [
    [ICON.gift, fmt(t("daysLeft"), { d: daysLeft() })],
    [ICON.star, fmt(t("winnerEvery"), v)],
    [ICON.check, t("freeEntry")],
    [ICON.scale, fmt(t("yearPrize"), { y: inr(CB.prize * CB.winnersPerMonth * 12) })]
  ];
  return `<section class="panel cash-panel cash-banner">
    <div class="label">${esc(t("kCash"))}</div>
    <div class="cash-hero"><span class="cash-amt num">₹${amt()}</span><span class="cash-word">${esc(t("cashWord"))}</span></div>
    <h3>${esc(fmt(t("cbTitle"), v))}</h3>
    <ul class="cash-lines">${lines.map(([ic, txt]) => `<li>${ic}<b>${esc(txt)}</b></li>`).join("")}</ul>
    <p>${esc(fmt(t("cbSub"), v))}</p>
    <p class="draw-date">${ICON.gift}${esc(fmt(t("nextDraw"), { d: nextDrawDate() }))}</p>
    ${MIN_ORDER ? `<p class="min">${esc(fmt(t("fMinErr"), v))}</p>` : ""}
    ${winnersList()}
    <div class="cash-actions"><button type="button" class="btn btn-cash" data-act="claim">${esc(t("cbClaim"))}</button><button type="button" class="btn btn-outline" data-act="terms">${esc(t("cbHow"))}</button></div>
  </section>`;
}

function dealsPanel(list) {
  if (!list.length) return "";
  return `<section class="deals-wrap">${sellerSays([t("dealsSay")])}
    <div class="deals">${list.map((p) => `
      <article class="deal">
        <a class="deal-img" href="${esc(safeUrl(p.url))}" target="_blank" rel="sponsored nofollow noopener">${p.image ? `<img src="${esc(safeUrl(p.image))}" alt="" loading="lazy">` : ""}${pctOff(p) ? `<span class="deal-off num">${pctOff(p)}% ${esc(t("off"))}</span>` : ""}</a>
        <h3>${esc(p.title)}</h3>
        <div class="meta">${ratingText(p)}<span>${esc(p.platformName)}</span></div>
        ${p.line ? `<p class="deal-line">${esc(p.line)}</p>` : ""}
        <div class="price-row">${p.free ? `<span class="price free">${esc(t("free"))}</span>` : p.price ? `<span class="price num">₹${inr(p.price)}</span>${p.mrp ? `<span class="mrp num">₹${inr(p.mrp)}</span>` : ""}` : ""}</div>
        ${CB.enabled ? `<div class="cash-note">${ICON.gift}${esc(fmt(t("cbChip"), drawVars()))}</div>` : ""}
        <a class="btn btn-primary btn-block" href="${esc(safeUrl(p.url))}" target="_blank" rel="sponsored nofollow noopener">${esc(p.price || p.free ? fmt(t("buyOn"), { p: p.platformName }) : t("seePrice"))} ${ICON.out}</a>
      </article>`).join("")}</div>
    <p class="aff">${esc(t("aff"))}</p></section>`;
}

function trustPanel() {
  const icons = [ICON.shield, ICON.lock, ICON.scale, ICON.gift];
  const items = t("trust").filter((_, i) => i < 3 || CB.enabled);
  return `<section class="panel"><div class="label">${esc(t("trustTitle"))}</div><ul class="trust-list">${items.map(([a, b], i) => `
    <li><div class="ic">${icons[i]}</div><div><b>${esc(fmt(a, { amt: amt() }))}</b><span>${esc(fmt(b, { amt: amt() }))}</span></div></li>`).join("")}</ul></section>`;
}

function platformsPanel(sites, q) {
  return `<section class="panel"><div class="label">${esc(t("shopOn"))}</div><div class="platforms">${sites.map((s) => `
    <div class="plat">
      <h3>${ICON.shield}${esc(s.name)}</h3>
      ${s.facilities?.length ? `<ul>${s.facilities.map((f) => `<li>${ICON.check}${esc(f)}</li>`).join("")}</ul>` : ""}
      <a class="btn btn-outline" href="${esc(safeUrl(s.url))}" target="_blank" rel="sponsored nofollow noopener">${esc(fmt(t("seeOn"), { p: s.name }))} ${ICON.out}</a>
    </div>`).join("")}</div>
    <p class="aff">${esc(t("aff"))}</p></section>`;
}

function ratingText(p) {
  if (p.rating == null) return "";
  const n = p.ratingCount ? ` · ${inr(p.ratingCount)} ${esc(t("ratings"))}` : "";
  return `<span class="stars num">${p.rating}★</span>${p.ratingType === "seller" ? ` <span>(${esc(t("sellerRating"))})</span>` : ""}<span class="num">${n}</span>`;
}

function pickPanel(b, data) {
  const pc = b.mrp ? Math.round((1 - b.price / b.mrp) * 100) : 0;
  const parts = data.scoreParts || [];
  return `<article class="panel pick">
    <div class="pick-top">
      <div class="thumb">${b.image ? `<img src="${esc(safeUrl(b.image))}" alt="" loading="lazy">` : ""}</div>
      <div style="min-width:0">
        <span class="pill pill-best">${ICON.star}${esc(b.featured ? t("ourPick") : t("bestPick"))}${b.score != null ? ` · ${esc(t("score"))} ${b.score}/100` : ""}</span>
        <h2>${esc(b.title)}</h2>
        <div class="meta">${ratingText(b)}<span>${esc(b.platformName)}</span></div>
        ${data.seller.bestLine ? `<p class="bestline">${esc(data.seller.bestLine)}</p>` : ""}
        <div class="price-row">${b.free ? `<span class="price free">${esc(t("free"))}</span>` : ""}${b.price ? `<span class="price num">₹${inr(b.price)}</span>` : ""}${b.mrp && b.price ? `<span class="mrp num">₹${inr(b.mrp)}</span><span class="off num">${pc}% ${esc(t("off"))}</span>` : ""}</div>
        ${cbEligible(b.price || 0) ? `<div class="cash-note">${ICON.gift}${esc(fmt(t("cbChip"), drawVars()))}</div>` : ""}
      </div>
    </div>
    <div class="pick-section">
      <div class="label">${esc(t("why"))}</div>
      <ul class="benefits">${data.seller.advantages.map((a) => `<li>${ICON.check}<span>${esc(a)}</span></li>`).join("")}</ul>
    </div>
    <div class="pick-section">
      <div class="buy-row">
        <a class="btn btn-primary btn-lg" href="${esc(safeUrl(b.url))}" target="_blank" rel="sponsored nofollow noopener">${esc(fmt(t("buyOn"), { p: b.platformName }))} ${ICON.out}</a>
        ${CB.enabled ? `<button type="button" class="btn btn-outline" data-act="terms">${esc(t("cbHow"))}</button>` : ""}
      </div>
      <p class="aff">${esc(t("aff"))}</p>
    </div>
    ${parts.length && b.parts ? `<div class="pick-section"><div class="label">${esc(t("scoreTitle"))}</div><div class="scores">${parts.map((s) => `
      <div class="srow"><span>${esc(s.label)}</span><div class="track"><i style="width:${Math.round((b.parts[s.key] / s.max) * 100)}%"></i></div><span class="num">${b.parts[s.key]}/${s.max}</span></div>`).join("")}</div></div>` : ""}
  </article>`;
}

function comparePanel(best, others) {
  const rows = [best, ...others];
  return `<section class="panel"><div class="label">${esc(t("compare"))}</div><div class="table-wrap"><table class="cmp">
    <thead><tr><th>${esc(t("cProduct"))}</th><th>${esc(t("cPlatform"))}</th><th>${esc(t("cRating"))}</th><th class="r">${esc(t("cPrice"))}</th><th class="r">${esc(t("cSave"))}</th><th class="r">${esc(t("cScore"))}</th><th></th></tr></thead>
    <tbody>${rows.map((p, i) => `<tr class="${i === 0 ? "is-best" : ""}">
      <td><div class="p-cell">${p.image ? `<img src="${esc(safeUrl(p.image))}" alt="" loading="lazy">` : '<span class="ph"></span>'}<span class="p-name">${esc(p.title)}</span></div></td>
      <td data-l="${esc(t("cPlatform"))}">${esc(p.platformName)}</td>
      <td data-l="${esc(t("cRating"))}">${p.rating != null ? `<span class="stars num">${p.rating}★</span>` : "—"}</td>
      <td class="r num" data-l="${esc(t("cPrice"))}"><b>${p.price ? `₹${inr(p.price)}` : "—"}</b></td>
      <td class="r num save" data-l="${esc(t("cSave"))}">${p.mrp && p.price ? `₹${inr(p.mrp - p.price)}` : "—"}</td>
      <td class="r num" data-l="${esc(t("cScore"))}">${p.score != null ? p.score : (p.featured ? "★" : "—")}</td>
      <td class="r go"><a class="view" href="${esc(safeUrl(p.url))}" target="_blank" rel="sponsored nofollow noopener">${esc(t("view"))} →</a></td>
    </tr>`).join("")}</tbody></table></div></section>`;
}

function facPanel(b) {
  if (!b.facilities?.length) return "";
  return `<section class="panel"><div class="label">${esc(fmt(t("whyBuy"), { p: b.platformName }))}</div>
    <ul class="fac">${b.facilities.map((f) => `<li>${ICON.check}<span>${esc(f)}</span></li>`).join("")}</ul></section>`;
}

function setBuybar(b) {
  const bar = $("buybar");
  if (!b) { bar.hidden = true; document.body.classList.remove("has-buybar"); return; }
  bar.innerHTML = `<div>${b.price ? `<b class="num">₹${inr(b.price)}</b>` : ""}${cbEligible(b.price || 0) ? `<span>${esc(fmt(t("cbChip"), drawVars()))}</span>` : ""}</div>
    <a class="btn btn-primary" href="${esc(safeUrl(b.url))}" target="_blank" rel="sponsored nofollow noopener">${esc(fmt(t("buyOn"), { p: b.platformName }))}</a>`;
  bar.hidden = false;
  document.body.classList.add("has-buybar");
}

// ---------- Views ----------
function renderSide() {
  $("side").innerHTML = `<div class="side-in">${cashPanel()}${trustPanel()}</div>`;
}

function renderWelcome() {
  const sites = sitesFor("");
  // All your products come first, right under the search.
  $("deals").innerHTML = dealsPanel(FEATURED);
  $("deals").hidden = !FEATURED.length;
  $("results").innerHTML = `${FEATURED.length ? "" : sellerSays(t("greet"))}${platformsPanel(sites)}`;
  renderSide();
  setBuybar(null);
}

function renderResult(data) {
  const b = data.best;
  const msgs = [...data.seller.message];
  if (data.errors?.length) msgs.push(fmt(t("partial"), { list: data.errors.join(", ") }));
  const all = b ? [b, ...(data.others || [])] : [];
  const prices = all.map((p) => p.price).filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxSave = all.reduce((m, p) => Math.max(m, p.mrp && p.price ? p.mrp - p.price : 0), 0);
  const platformCount = b ? new Set(all.map((p) => p.platformName)).size : data.sites.length;
  const when = data.live ? new Date(data.checkedAt).toLocaleString(lang + "-IN", { dateStyle: "medium", timeStyle: "short" }) : "";

  $("results").innerHTML = `
    <div class="chat">
      ${lastQ ? customerSays(lastQ) : ""}
      ${sellerSays(msgs, INTENT ? intentBar() : "")}
    </div>
    ${INTENT ? `<section class="panel search-tools">${filterBar()}</section>` : ""}
    ${kpis([
      b && [t("kCompared"), String(all.length)],
      [t("kPlatforms"), String(platformCount)],
      minPrice && [t("kBest"), `₹${inr(minPrice)}`],
      maxSave > 0 && [t("kSave"), `₹${inr(maxSave)}`, "save"]
    ])}
    <div class="col" style="margin-top:18px">
      ${b ? pickPanel(b, data) : ""}
      ${b ? facPanel(b) : ""}
      ${b && data.others?.length ? comparePanel(b, data.others) : ""}
      ${b ? platformsPanel(data.sites.map((s) => ({ ...s, facilities: [] }))) : platformsPanel(data.sites)}
      ${when ? `<p class="stamp">${esc(fmt(t("stamp"), { d: when }))}</p>` : ""}
    </div>`;
  renderSide();
  setBuybar(b);
}

function renderNotes() {
  $("notes").innerHTML = `
    <div class="panel"><h3>${esc(t("discT"))}</h3><p>${esc(t("disc1"))}</p><p>${esc(t("disc2"))}</p></div>
    <div class="panel"><h3>${esc(t("respT"))}</h3><p>${esc(t("resp1"))}</p><p>${esc(t("resp2"))}</p></div>`;
}

function staticText() {
  document.documentElement.lang = lang;
  $("tag").textContent = t("tag");
  $("langLabel").textContent = t("lang");
  $("lang").innerHTML = LANGS.map((l) => `<option value="${l.code}"${l.code === lang ? " selected" : ""}>${esc(l.name)}</option>`).join("");
  $("termsBtn").innerHTML = `${ICON.shield}<span>${esc(t("termsBtn"))}</span>`;
  $("termsBtn").setAttribute("aria-label", t("termsBtn"));
  $("heroT").textContent = t("heroT");
  $("heroS").textContent = t("heroS");
  $("q").placeholder = t("ph");
  $("searchBtn").textContent = t("searchBtn");
  $("popular").textContent = t("popular");
  $("chips").innerHTML = t("chips").map((c, i) => `<button type="button" data-q="${esc(CHIP_QUERIES[i])}">${esc(c)}</button>`).join("");
  renderNotes();
}

// ---------- Search ----------
let lastQ = "";
let controller = null;
// What the system understood, the filters, and the raw results (to re-filter without searching again).
let INTENT = null;
let F = { min: null, max: null, minRating: 0, platform: "", sort: "rel" };
let RAW = null;

const budgetText = () => (F.min && F.max ? fmt(t("bBetween"), { a: inr(F.min), b: inr(F.max) })
  : F.max ? fmt(t("bUnder"), { x: inr(F.max) }) : F.min ? fmt(t("bAbove"), { x: inr(F.min) }) : "");
const whatText = () => [INTENT.brand, INTENT.product || INTENT.query, ...INTENT.needs.filter((n) => !(INTENT.product || "").includes(n))]
  .filter(Boolean).join(" ") + (budgetText() ? `, ${budgetText()}` : "");

function anyAdvantages(p) {
  if (p.featured) return ownAdvantages(p);
  const out = [];
  if (p.rating != null) out.push(fmt(t(p.ratingType === "seller" ? "sellerRat" : "rating"), { r: p.rating, n: inr(p.ratingCount || 0) }));
  if (p.mrp && p.price) out.push(fmt(t("save"), { s: inr(p.mrp - p.price), pc: pctOff(p) }));
  (p.features || []).slice(0, 3).forEach((f) => out.push(String(f)));
  if (p.inStock) out.push(t("stock"));
  if (p.cod) out.push(t("cod"));
  if (p.platformName) out.push(fmt(t("sold"), { p: p.platformName }));
  return out;
}

// Keep only products that are really what was searched (not accessories), before sorting by price.
function relevant(list) {
  const words = String(INTENT?.query || "").toLowerCase().split(" ").filter((w) => w.length > 2);
  if (!words.length) return list;
  const stem = (w) => w.replace(/(es|s)$/, "");
  const hits = (p) => { const tt = (p.title + " " + (p.keywords || "")).toLowerCase(); return words.filter((w) => tt.includes(stem(w))).length; };
  const best = Math.max(0, ...list.map(hits));
  if (!best) return list;
  // Accessories ("shoe cleaning kit") match fewer of the searched words than the product itself.
  return list.filter((p) => hits(p) === best);
}

function applyFilters(list) {
  const priced = F.min || F.max;
  let out = relevant(list).filter((p) => {
    if (priced && !p.price) return false;
    if (F.min && p.price < F.min) return false;
    if (F.max && p.price > F.max) return false;
    if (F.minRating && !(p.rating >= F.minRating)) return false;
    if (F.platform && p.platformName !== F.platform) return false;
    return true;
  });
  const byPrice = (dir) => (a, b) => (a.price ? 0 : 1) - (b.price ? 0 : 1) || dir * ((a.price || 0) - (b.price || 0));
  if (F.sort === "low") out = [...out].sort(byPrice(1));
  if (F.sort === "high") out = [...out].sort(byPrice(-1));
  if (F.sort === "off") out = [...out].sort((a, b) => pctOff(b) - pctOff(a));
  if (F.sort === "rating") out = [...out].sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.ratingCount || 0) - (a.ratingCount || 0));
  return out;
}

// Build the page from the raw results + filters.
function compose() {
  const raw = RAW;
  const q = INTENT.query;
  const fromServer = raw.best ? [raw.best, ...(raw.others || [])] : [];
  const own = matchFeatured([q, INTENT.brand, ...INTENT.needs].filter(Boolean).join(" "));
  const all = [...own, ...fromServer.filter((p) => !own.some((o) => o.url === p.url))];
  const list = applyFilters(all);
  const sites = sitesFor(q);
  const data = { ...raw, sites, others: [], best: null };
  if (raw.source === "server") data.sites = sites;

  if (list.length) {
    const top = list[0];
    data.best = { ...top, facilities: top.facilities?.length ? top.facilities : siteFac(top.platformName) };
    data.others = list.slice(1, 9);
    const sameAsServer = raw.best && top.id === raw.best.id;
    data.seller = sameAsServer
      ? { ...raw.seller, message: [fmt(t("msgGot"), { what: whatText() }), ...raw.seller.message] }
      : {
          message: [fmt(t("msgGot"), { what: whatText() }), fmt(t("pick"), { name: top.title }), t("rest")],
          bestLine: top.line || (top.mrp ? fmt(t("lineOff"), { pc: pctOff(top) }) : t("lineTop")),
          advantages: anyAdvantages(top)
        };
  } else {
    const msgs = [fmt(t("msgGot"), { what: whatText() })];
    if (all.length) msgs.push(t("noMatch"));
    msgs.push(fmt(t("noLive"), { q, n: sites.length }), t("noLive2"));
    data.seller = { message: msgs, advantages: [] };
    data.live = false;
  }
  renderResult(data);
}

function intentBar() {
  if (!INTENT) return "";
  const chips = [
    INTENT.product && [t("iProduct"), INTENT.product],
    budgetText() && [t("iBudget"), budgetText()],
    ...INTENT.needs.map((n) => [t("iNeed"), n]),
    INTENT.brand && [t("iBrand"), INTENT.brand],
    F.sort === "low" && INTENT.sort === "low" && [t("iCheap"), "✓"]
  ].filter(Boolean);
  if (!chips.length) return "";
  return `<div class="understood"><span class="label">${esc(t("understood"))}</span>${chips.map(([k, v]) => `<span class="u-chip"><span>${esc(k)}</span><b>${esc(v)}</b></span>`).join("")}</div>`;
}

function filterBar() {
  const opt = (v, label, cur) => `<option value="${esc(v)}"${String(cur) === String(v) ? " selected" : ""}>${esc(label)}</option>`;
  return `<form class="filters" id="filters" onsubmit="return false">
    <div class="label">${esc(t("fltTitle"))}</div>
    <div class="f-row">
      <label class="f-field"><span>${esc(t("fMin"))}</span><input id="f-min" inputmode="numeric" maxlength="7" value="${F.min || ""}" placeholder="0"></label>
      <label class="f-field"><span>${esc(t("fMax"))}</span><input id="f-max" inputmode="numeric" maxlength="7" value="${F.max || ""}" placeholder="∞"></label>
      <label class="f-field"><span>${esc(t("fRating"))}</span><select id="f-rating">${opt(0, t("fAny"), F.minRating)}${opt(3, "3★+", F.minRating)}${opt(4, "4★+", F.minRating)}${opt(4.5, "4.5★+", F.minRating)}</select></label>
      <label class="f-field"><span>${esc(t("fPlat"))}</span><select id="f-plat">${opt("", t("fAllPlat"), F.platform)}${SITES.map((x) => opt(x.name, x.name, F.platform)).join("")}</select></label>
      <label class="f-field"><span>${esc(t("fSort"))}</span><select id="f-sort">${opt("rel", t("sRel"), F.sort)}${opt("low", t("sLow"), F.sort)}${opt("high", t("sHigh"), F.sort)}${opt("off", t("sOff"), F.sort)}${opt("rating", t("sRate"), F.sort)}</select></label>
      <button type="button" class="btn btn-quiet f-clear" data-act="fclear">${esc(t("fClear"))}</button>
    </div>
  </form>`;
}

function readFilters() {
  const n = (id) => { const v = Number(String($(id)?.value || "").replace(/[^\d]/g, "")); return v > 0 ? v : null; };
  F = { min: n("f-min"), max: n("f-max"), minRating: Number($("f-rating")?.value) || 0, platform: $("f-plat")?.value || "", sort: $("f-sort")?.value || "rel" };
  if (F.min && F.max && F.min > F.max) [F.min, F.max] = [F.max, F.min];
}

function staticResult(q) {
  return { live: false, best: null, others: [], seller: { message: [], advantages: [] }, scoreParts: [], sites: [], errors: [], checkedAt: new Date().toISOString() };
}

async function run(q) {
  lastQ = q;
  $("deals").hidden = true; // search results show the matching products instead
  $("q").value = q;
  const url = new URL(location.href); url.searchParams.set("q", q); history.replaceState(null, "", url);
  INTENT = parseIntent(q);
  F = { min: INTENT.min, max: INTENT.max, minRating: 0, platform: "", sort: INTENT.sort || "rel" };
  $("results").innerHTML = `<div class="panel loading"><span class="spinner"></span><span>${esc(fmt(t("msgGot"), { what: whatText() }).split(".")[0])}…</span></div>`;
  controller?.abort();
  controller = new AbortController();
  let data;
  try {
    await serverReady;
    if (!serverOK) throw new Error("no server");
    const res = await fetch(`${BASE}/api/search?q=${enc(INTENT.query)}&lang=${lang}`, { signal: controller.signal });
    if (!res.ok) throw new Error(String(res.status));
    data = await res.json();
    data.source = "server";
  } catch (e) {
    if (e.name === "AbortError") return;
    data = staticResult(q);
  }
  RAW = data;
  compose();
  $("results").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- Sheet: trust & terms, cashback claim ----------
const sheet = $("sheet");
function openSheet(html) {
  $("sheetBody").innerHTML = html;
  if (typeof sheet.showModal === "function") sheet.showModal(); else sheet.setAttribute("open", "");
}
function closeSheet() { if (sheet.open) sheet.close?.(); sheet.removeAttribute("open"); }
const head = (title) => `<div class="sheet-head"><h2 id="sheetTitle">${esc(title)}</h2><button type="button" class="icon-btn" data-act="close" aria-label="${esc(t("fClose"))}">${ICON.close}</button></div>`;

function openTerms() {
  openSheet(`${head(t("termsBtn"))}
    ${CB.enabled ? `<div class="sec"><h3>${esc(t("cbHow"))}</h3><ol>${t("cbSteps").map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>
    <div class="sec"><h3>${esc(t("cbTermsT"))}</h3><ul>${t("cbTerms").map((s) => `<li>${esc(fmt(s, drawVars()))}</li>`).join("")}${MIN_ORDER ? `<li>${esc(fmt(t("fMinErr"), drawVars()))}</li>` : ""}</ul></div>
    <div class="sec"><p>${esc(fmt(t("nextDraw"), { d: nextDrawDate() }))}</p>${winnersList()}</div>` : ""}
    <div class="sec"><h3>${esc(t("discT"))}</h3><p>${esc(t("disc1"))}</p><p>${esc(t("disc2"))}</p></div>
    <div class="sec"><h3>${esc(t("respT"))}</h3><p>${esc(t("resp1"))}</p><p>${esc(t("resp2"))}</p></div>
    ${CB.enabled ? `<button type="button" class="btn btn-cash btn-block" data-act="claim">${esc(t("cbClaim"))}</button>` : ""}`);
}

function openClaim() {
  openSheet(`${head(fmt(t("fTitle"), drawVars()))}
    <form id="claimForm" class="sec" novalidate>
      <div class="field"><label for="c-order">${esc(t("fOrder"))}</label><input id="c-order" name="orderId" maxlength="60" autocomplete="off" required></div>
      <div class="field"><label for="c-platform">${esc(t("fPlatform"))}</label><select id="c-platform" name="platform">${SITES.map((s) => `<option>${esc(s.name)}</option>`).join("")}</select></div>
      <div class="field"><label for="c-amount">${esc(t("fAmount"))}</label><input id="c-amount" name="amount" inputmode="numeric" maxlength="9" required></div>
      <div class="field"><label for="c-name">${esc(t("fName"))}</label><input id="c-name" name="name" maxlength="80" autocomplete="name" required></div>
      <div class="field"><label for="c-pay">${esc(t("fPay"))}</label><input id="c-pay" name="payTo" maxlength="80" autocomplete="off" required></div>
      <p class="err" id="c-err" hidden></p>
      <button type="submit" class="btn btn-cash btn-block">${esc(t("fSubmit"))}</button>
    </form>
    <div class="sec"><h3>${esc(t("cbTermsT"))}</h3><ul>${t("cbTerms").map((s) => `<li>${esc(fmt(s, drawVars()))}</li>`).join("")}</ul></div>`);
}

async function submitClaim(form) {
  const f = Object.fromEntries(new FormData(form));
  const amount = Number(String(f.amount).replace(/[^\d.]/g, ""));
  const err = $("c-err");
  const fail = (m) => { err.textContent = m; err.hidden = false; };
  if (!f.orderId.trim() || !f.name.trim() || !f.payTo.trim() || !amount) return fail(t("fErr"));
  if (MIN_ORDER && amount < MIN_ORDER) return fail(fmt(t("fMinErr"), drawVars()));
  err.hidden = true;
  const claim = { orderId: f.orderId.trim(), platform: f.platform, amount, name: f.name.trim(), payTo: f.payTo.trim(), lang };
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true; btn.textContent = t("fSending");

  // 1) Email the claim to the owner (works on GitHub Pages, no server needed).
  let mailed = false;
  if (CFG.notifyEmail) {
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${enc(CFG.notifyEmail)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Lucky draw claim: ${claim.platform} order ${claim.orderId} (₹${inr(amount)})`,
          _template: "table", _captcha: "false",
          "Order ID": claim.orderId, "Platform": claim.platform, "Order amount": `₹${inr(amount)}`,
          "Name": claim.name, "UPI ID / phone": claim.payTo, "Language": lang,
          "Sent at": new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        }),
        signal: AbortSignal.timeout(15000)
      });
      const j = await res.json().catch(() => ({}));
      mailed = res.ok && String(j.success) === "true";
    } catch { mailed = false; }
  }

  // 2) Also save it on the server, when one is connected.
  let saved = false;
  await serverReady;
  if (serverOK) {
    try {
      const res = await fetch(`${BASE}/api/cashback`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(claim) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok && res.status !== 409) { btn.disabled = false; btn.textContent = t("fSubmit"); return fail(j.error || t("error")); }
      saved = true;
    } catch { saved = false; }
  }

  if (mailed || saved) {
    form.outerHTML = `<div class="note-ok">${ICON.check}<span>${esc(t("fDone"))}</span></div>`;
    return;
  }
  const text = [`${t("fOrder")}: ${claim.orderId}`, `${t("fPlatform")}: ${claim.platform}`, `${t("fAmount")}: ₹${inr(amount)}`, `${t("fName")}: ${claim.name}`, `${t("fPay")}: ${claim.payTo}`].join("\n");
  const where = [CONTACT.whatsapp && `WhatsApp: ${CONTACT.whatsapp}`, CONTACT.email && `Email: ${CONTACT.email}`].filter(Boolean);
  form.outerHTML = `<div class="sec"><h3>${esc(t("fManual"))}</h3>
    ${where.length ? `<pre class="copy">${esc(where.join("\n"))}</pre>` : ""}
    <pre class="copy" id="claimText">${esc(text)}</pre>
    <button type="button" class="btn btn-primary btn-block" data-act="copy">${esc(t("fCopy"))}</button></div>`;
}

async function copyClaim(btn) {
  const text = $("claimText")?.textContent || "";
  try { await navigator.clipboard.writeText(text); btn.textContent = t("fCopied"); }
  catch {
    const r = document.createRange(); r.selectNodeContents($("claimText"));
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  }
}

// ---------- Events ----------
$("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = $("q").value.trim();
  if (q) run(q);
  else { lastQ = ""; INTENT = null; RAW = null; const u = new URL(location.href); u.searchParams.delete("q"); history.replaceState(null, "", u); renderWelcome(); }
});
$("chips").addEventListener("click", (e) => { const b = e.target.closest("button[data-q]"); if (b) run(b.dataset.q); });
$("lang").addEventListener("change", (e) => {
  lang = e.target.value;
  try { localStorage.setItem("is-lang", lang); } catch {}
  staticText();
  if (lastQ) run(lastQ); else renderWelcome();
});
document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-act]");
  if (!a) return;
  const act = a.dataset.act;
  if (act === "claim") openClaim();
  else if (act === "terms") openTerms();
  else if (act === "close") closeSheet();
  else if (act === "copy") copyClaim(a);
  else if (act === "fclear") { F = { min: null, max: null, minRating: 0, platform: "", sort: "rel" }; compose(); }
});
document.addEventListener("change", (e) => { if (e.target.closest("#filters") && RAW) { readFilters(); compose(); } });
document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.closest("#filters") && RAW) { e.preventDefault(); readFilters(); compose(); } });
document.addEventListener("submit", (e) => { if (e.target.id === "claimForm") { e.preventDefault(); submitClaim(e.target); } });
sheet.addEventListener("click", (e) => { if (e.target === sheet) closeSheet(); });

staticText();
const startQ = new URLSearchParams(location.search).get("q");
if (startQ) run(startQ.slice(0, 100)); else renderWelcome();
