// Intelligent Seller dashboard.
// The customer only searches. The page then shows, without asking anything:
// summary numbers, the best product with its benefits and a clear buy button,
// a comparison of all options, the seller's advice, the platform's facilities,
// cashback and trust information.

import { LANGS, CHIP_QUERIES, t as tr, fmt, isLang } from "./i18n.js";

const CFG = window.IS_CONFIG || {};
const CB = { enabled: true, amount: 1000, minOrder: 0, ...(CFG.cashback || {}) };
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
const amt = () => inr(CB.amount);
const cbEligible = (price) => CB.enabled && (!CB.minOrder || price >= CB.minOrder);

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
const FASHION = /\b(shirt|t-?shirt|jeans|kurta|kurti|saree|sari|dress|top|shoes?|sneakers?|sandals?|chappal|jacket|hoodie|trousers?|lehenga|bag|handbag)\b/i;
const BEAUTY = /\b(lipstick|makeup|skincare|serum|cream|moisturi[sz]er|sunscreen|shampoo|conditioner|perfume|kajal|foundation|face ?wash|hair oil)\b/i;
const wrap = (url) => (CFG.linkTemplate ? CFG.linkTemplate.replace("{url}", enc(url)) : url);
const SITES = [
  { name: "Amazon.in", own: true, fac: ["fastDelivery", "easyReturns", "cod", "bankEmi"],
    url: (q) => `https://www.amazon.in/s?k=${enc(q)}${CFG.amazonTag ? `&tag=${enc(CFG.amazonTag)}` : ""}`,
    home: () => `https://www.amazon.in/${CFG.amazonTag ? `?tag=${enc(CFG.amazonTag)}` : ""}` },
  { name: "Flipkart", own: true, fac: ["wideDelivery", "easyReturns", "cod", "bankEmi"],
    url: (q) => `https://www.flipkart.com/search?q=${enc(q)}${CFG.flipkartAffid ? `&affid=${enc(CFG.flipkartAffid)}` : ""}`,
    home: () => `https://www.flipkart.com/${CFG.flipkartAffid ? `?affid=${enc(CFG.flipkartAffid)}` : ""}` },
  { name: "Croma", fac: ["tataStore", "storePickup", "extWarranty"], url: (q) => `https://www.croma.com/searchB?q=${enc(q)}%3Arelevance&text=${enc(q)}`, home: () => "https://www.croma.com/" },
  { name: "Reliance Digital", fac: ["storeNetwork", "installation", "bankEmi"], url: (q) => `https://www.reliancedigital.in/search?q=${enc(q)}`, home: () => "https://www.reliancedigital.in/" },
  { name: "Tata CLiQ", fac: ["authBrand", "easyReturns"], url: (q) => `https://www.tatacliq.com/search/?searchCategory=all&text=${enc(q)}`, home: () => "https://www.tatacliq.com/" },
  { name: "Myntra", cat: "fashion", fac: ["fashion", "sizeExchange"], url: (q) => `https://www.myntra.com/${enc(q.trim().toLowerCase().replace(/\s+/g, "-"))}`, home: () => "https://www.myntra.com/" },
  { name: "AJIO", cat: "fashion", fac: ["relFashion", "easyReturns"], url: (q) => `https://www.ajio.com/search/?text=${enc(q)}`, home: () => "https://www.ajio.com/" },
  { name: "Nykaa", cat: "beauty", fac: ["beauty", "authentic"], url: (q) => `https://www.nykaa.com/search/result/?q=${enc(q)}`, home: () => "https://www.nykaa.com/" }
];
const facText = (keys) => keys.map((k) => t("fac")[k]).filter(Boolean);
function sitesFor(q) {
  return SITES
    .filter((s) => (q ? !s.cat || (s.cat === "fashion" && FASHION.test(q)) || (s.cat === "beauty" && BEAUTY.test(q)) : !s.cat))
    .map((s) => {
      const raw = q ? s.url(q) : s.home();
      return { name: s.name, url: s.own ? raw : wrap(raw), facilities: facText(s.fac) };
    });
}

// ---------- Server check ----------
let serverOK = false;
const serverReady = fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(4000) })
  .then((r) => (r.ok && (r.headers.get("content-type") || "").includes("json") ? r.json() : null))
  .then((j) => { serverOK = Boolean(j && j.ok); })
  .catch(() => { serverOK = false; });

// ---------- Building blocks ----------
function kpis(items) {
  return `<section class="kpis">${items.filter(Boolean).map(([label, value, cls = ""]) =>
    `<div class="kpi ${cls}"><span>${esc(label)}</span><b class="num">${esc(value)}</b></div>`).join("")}</section>`;
}

function advicePanel(lines) {
  return `<section class="panel advice"><div class="who"><div class="mark" aria-hidden="true">IS</div><b>${esc(t("advice"))}</b></div>
    ${lines.map((l) => `<p>${esc(l)}</p>`).join("")}</section>`;
}

function cashPanel() {
  if (!CB.enabled) return "";
  return `<section class="panel cash-panel">
    <div class="label">${esc(t("kCash"))}</div>
    <div class="cash-amt num">₹${amt()}</div>
    <h3>${esc(fmt(t("cbTitle"), { amt: amt() }))}</h3>
    <p>${esc(fmt(t("cbSub"), { amt: amt() }))}</p>
    ${CB.minOrder ? `<p class="min">${esc(fmt(t("cbMin"), { min: inr(CB.minOrder) }))}</p>` : ""}
    <div class="cash-actions"><button type="button" class="btn btn-cash" data-act="claim">${esc(t("cbClaim"))}</button><button type="button" class="btn btn-outline" data-act="terms">${esc(t("cbHow"))}</button></div>
  </section>`;
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
        <span class="pill pill-best">${ICON.star}${esc(t("bestPick"))} · ${esc(t("score"))} ${b.score}/100</span>
        <h2>${esc(b.title)}</h2>
        <div class="meta">${ratingText(b)}<span>${esc(b.platformName)}</span></div>
        ${data.seller.bestLine ? `<p class="bestline">${esc(data.seller.bestLine)}</p>` : ""}
        <div class="price-row"><span class="price num">₹${inr(b.price)}</span>${b.mrp ? `<span class="mrp num">₹${inr(b.mrp)}</span><span class="off num">${pc}% ${esc(t("off"))}</span>` : ""}</div>
        ${cbEligible(b.price) ? `<div class="cash-note">${ICON.gift}${esc(fmt(t("cbChip"), { amt: amt() }))}</div>` : ""}
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
    ${parts.length ? `<div class="pick-section"><div class="label">${esc(t("scoreTitle"))}</div><div class="scores">${parts.map((s) => `
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
      <td class="r num" data-l="${esc(t("cPrice"))}"><b>₹${inr(p.price)}</b></td>
      <td class="r num save" data-l="${esc(t("cSave"))}">${p.mrp ? `₹${inr(p.mrp - p.price)}` : "—"}</td>
      <td class="r num" data-l="${esc(t("cScore"))}">${p.score}</td>
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
  bar.innerHTML = `<div><b class="num">₹${inr(b.price)}</b>${cbEligible(b.price) ? `<span>${esc(fmt(t("cbChip"), { amt: amt() }))}</span>` : ""}</div>
    <a class="btn btn-primary" href="${esc(safeUrl(b.url))}" target="_blank" rel="sponsored nofollow noopener">${esc(fmt(t("buyOn"), { p: b.platformName }))}</a>`;
  bar.hidden = false;
  document.body.classList.add("has-buybar");
}

// ---------- Views ----------
function renderWelcome() {
  const sites = sitesFor("");
  $("results").innerHTML = `
    ${kpis([[t("kPlatforms"), String(sites.length)], CB.enabled && [t("kCash"), `₹${amt()}`, "cash"]])}
    <div class="grid" style="margin-top:18px">
      <div class="col">${platformsPanel(sites)}</div>
      <aside class="col">${advicePanel(t("greet"))}${cashPanel()}${trustPanel()}</aside>
    </div>`;
  setBuybar(null);
}

function renderResult(data) {
  const b = data.best;
  const msgs = [...data.seller.message];
  if (data.errors?.length) msgs.push(fmt(t("partial"), { list: data.errors.join(", ") }));
  const all = b ? [b, ...(data.others || [])] : [];
  const minPrice = all.length ? Math.min(...all.map((p) => p.price)) : null;
  const maxSave = all.reduce((m, p) => Math.max(m, p.mrp ? p.mrp - p.price : 0), 0);
  const platformCount = b ? new Set(all.map((p) => p.platformName)).size : data.sites.length;
  const when = data.live ? new Date(data.checkedAt).toLocaleString(lang + "-IN", { dateStyle: "medium", timeStyle: "short" }) : "";

  $("results").innerHTML = `
    ${kpis([
      b && [t("kCompared"), String(all.length)],
      [t("kPlatforms"), String(platformCount)],
      minPrice && [t("kBest"), `₹${inr(minPrice)}`],
      maxSave > 0 && [t("kSave"), `₹${inr(maxSave)}`, "save"],
      CB.enabled && [t("kCash"), `₹${amt()}`, "cash"]
    ])}
    <div class="grid" style="margin-top:18px">
      <div class="col">
        ${b ? pickPanel(b, data) + comparePanel(b, data.others || []) : ""}
        ${b ? platformsPanel(data.sites.map((s) => ({ ...s, facilities: [] }))) : platformsPanel(data.sites)}
        ${when ? `<p class="stamp">${esc(fmt(t("stamp"), { d: when }))}</p>` : ""}
      </div>
      <aside class="col">
        ${advicePanel(msgs)}
        ${b ? facPanel(b) : ""}
        ${cashPanel()}
        ${trustPanel()}
      </aside>
    </div>`;
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
function staticResult(q) {
  const sites = sitesFor(q);
  return { live: false, best: null, others: [], seller: { message: [fmt(t("noLive"), { q, n: sites.length }), t("noLive2")], advantages: [] }, scoreParts: [], sites, errors: [], checkedAt: new Date().toISOString() };
}

async function run(q) {
  lastQ = q;
  $("q").value = q;
  const url = new URL(location.href); url.searchParams.set("q", q); history.replaceState(null, "", url);
  $("results").innerHTML = `<div class="panel loading"><span class="spinner"></span><span>${esc(fmt(t("intro").split(".")[0] + ".", { q, n: "…", k: "…" }))}</span></div>`;
  controller?.abort();
  controller = new AbortController();
  let data;
  try {
    await serverReady;
    if (!serverOK) throw new Error("no server");
    const res = await fetch(`${BASE}/api/search?q=${enc(q)}&lang=${lang}`, { signal: controller.signal });
    if (!res.ok) throw new Error(String(res.status));
    data = await res.json();
    // The server only knows facilities for live products; add them for the site cards.
    data.sites = data.sites.map((s) => ({ ...s, facilities: facText(SITES.find((x) => x.name === s.name)?.fac || []) }));
  } catch (e) {
    if (e.name === "AbortError") return;
    data = staticResult(q);
  }
  renderResult(data);
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
    <div class="sec"><h3>${esc(t("cbTermsT"))}</h3><ul>${t("cbTerms").map((s) => `<li>${esc(s)}</li>`).join("")}${CB.minOrder ? `<li>${esc(fmt(t("cbMin"), { min: inr(CB.minOrder) }))}</li>` : ""}</ul></div>` : ""}
    <div class="sec"><h3>${esc(t("discT"))}</h3><p>${esc(t("disc1"))}</p><p>${esc(t("disc2"))}</p></div>
    <div class="sec"><h3>${esc(t("respT"))}</h3><p>${esc(t("resp1"))}</p><p>${esc(t("resp2"))}</p></div>
    ${CB.enabled ? `<button type="button" class="btn btn-cash btn-block" data-act="claim">${esc(t("cbClaim"))}</button>` : ""}`);
}

function openClaim() {
  openSheet(`${head(fmt(t("fTitle"), { amt: amt() }))}
    <form id="claimForm" class="sec" novalidate>
      <div class="field"><label for="c-order">${esc(t("fOrder"))}</label><input id="c-order" name="orderId" maxlength="60" autocomplete="off" required></div>
      <div class="field"><label for="c-platform">${esc(t("fPlatform"))}</label><select id="c-platform" name="platform">${SITES.map((s) => `<option>${esc(s.name)}</option>`).join("")}</select></div>
      <div class="field"><label for="c-amount">${esc(t("fAmount"))}</label><input id="c-amount" name="amount" inputmode="numeric" maxlength="9" required></div>
      <div class="field"><label for="c-name">${esc(t("fName"))}</label><input id="c-name" name="name" maxlength="80" autocomplete="name" required></div>
      <div class="field"><label for="c-pay">${esc(t("fPay"))}</label><input id="c-pay" name="payTo" maxlength="80" autocomplete="off" required></div>
      <p class="err" id="c-err" hidden></p>
      <button type="submit" class="btn btn-cash btn-block">${esc(t("fSubmit"))}</button>
    </form>
    <div class="sec"><h3>${esc(t("cbTermsT"))}</h3><ul>${t("cbTerms").map((s) => `<li>${esc(s)}</li>`).join("")}</ul></div>`);
}

async function submitClaim(form) {
  const f = Object.fromEntries(new FormData(form));
  const amount = Number(String(f.amount).replace(/[^\d.]/g, ""));
  const err = $("c-err");
  const fail = (m) => { err.textContent = m; err.hidden = false; };
  if (!f.orderId.trim() || !f.name.trim() || !f.payTo.trim() || !amount) return fail(t("fErr"));
  if (CB.minOrder && amount < CB.minOrder) return fail(fmt(t("fMinErr"), { min: inr(CB.minOrder) }));
  err.hidden = true;
  const claim = { orderId: f.orderId.trim(), platform: f.platform, amount, name: f.name.trim(), payTo: f.payTo.trim(), lang };

  await serverReady;
  if (serverOK) {
    try {
      const res = await fetch(`${BASE}/api/cashback`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(claim) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) return fail(j.error || t("error"));
      form.outerHTML = `<div class="note-ok">${ICON.check}<span>${esc(t("fDone"))}</span></div>`;
      return;
    } catch { /* fall through to manual */ }
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
$("searchForm").addEventListener("submit", (e) => { e.preventDefault(); const q = $("q").value.trim(); if (q) run(q); });
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
});
document.addEventListener("submit", (e) => { if (e.target.id === "claimForm") { e.preventDefault(); submitClaim(e.target); } });
sheet.addEventListener("click", (e) => { if (e.target === sheet) closeSheet(); });

staticText();
const startQ = new URLSearchParams(location.search).get("q");
if (startQ) run(startQ.slice(0, 100)); else renderWelcome();
