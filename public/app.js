// Intelligent Seller: a conversation with a trusted shopkeeper.
// The customer only types what they want; the seller answers with the best product,
// its benefits, the platform's facilities, other options, trusted sites and cashback.

import { LANGS, CHIP_QUERIES, t as tr, fmt, isLang } from "./i18n.js";

const CFG = window.IS_CONFIG || {};
const CB = { enabled: true, amount: 1000, minOrder: 0, ...(CFG.cashback || {}) };
const CONTACT = CFG.contact || {};
const BASE = (CFG.apiBase || "").replace(/\/$/, "");

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const inr = (n) => Math.round(n).toLocaleString("en-IN");
const safeUrl = (u) => (/^https:\/\//i.test(u) ? u : "#");

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

// ---------- Icons ----------
const ICON = {
  send: '<svg class="i" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  info: '<svg class="i" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  shield: '<svg class="i" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  lock: '<svg class="i" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  scale: '<svg class="i" viewBox="0 0 24 24"><path d="M12 4v16M6 20h12M5 8h14"/><path d="M5 8l-3 6a3 3 0 0 0 6 0zM19 8l-3 6a3 3 0 0 0 6 0z"/></svg>',
  gift: '<svg class="i" viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 13h18M12 9v12"/><path d="M12 9c-2-4-6-4-6-1.5S9 9 12 9zm0 0c2-4 6-4 6-1.5S15 9 12 9z"/></svg>',
  check: '<svg class="i" viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>',
  out: '<svg class="i" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  close: '<svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};

// ---------- Server check ----------
let serverOK = false;
const serverReady = fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(4000) })
  .then((r) => r.ok && (r.headers.get("content-type") || "").includes("json") ? r.json() : null)
  .then((j) => { serverOK = Boolean(j && j.ok); })
  .catch(() => { serverOK = false; });

// ---------- Thread helpers ----------
const thread = $("thread");
function add(html, cls = "") {
  const el = document.createElement("div");
  if (cls) el.className = cls;
  el.innerHTML = html;
  thread.appendChild(el);
  return el;
}
const sellerMsg = (inner) => add(`<div class="av" aria-hidden="true">IS</div><div class="bubble">${inner}</div>`, "msg seller");
const userMsg = (text) => add(`<div class="bubble"><p>${esc(text)}</p></div>`, "msg user");
const block = (inner) => add(inner, "block");

function trustCard() {
  const icons = [ICON.shield, ICON.lock, ICON.scale, ICON.gift];
  const items = t("trust").filter((_, i) => i < 3 || CB.enabled);
  return `<section class="trust"><div class="label">${esc(t("trustTitle"))}</div><div class="trust-grid">${items.map(([a, b], i) => `
    <div class="badge"><div class="ic">${icons[i]}</div><div><b>${esc(fmt(a, { amt: amt() }))}</b><span>${esc(fmt(b, { amt: amt() }))}</span></div></div>`).join("")}
  </div></section>`;
}

function cashbackLine() {
  if (!CB.enabled) return "";
  return `<div class="cb cb-line"><span class="cb-chip">${ICON.gift}${esc(fmt(t("cbChip"), { amt: amt() }))}</span><button type="button" class="btn btn-ghost" data-act="terms">${esc(t("cbHow"))}</button></div>`;
}

function cashbackCard() {
  if (!CB.enabled) return "";
  return `<section class="cb">
    <div class="cb-amt num">₹${amt()}</div>
    <div><h3>${esc(fmt(t("cbTitle"), { amt: amt() }))}</h3><p>${esc(fmt(t("cbSub"), { amt: amt() }))}</p>
      ${CB.minOrder ? `<p class="min">${esc(fmt(t("cbMin"), { min: inr(CB.minOrder) }))}</p>` : ""}</div>
    <div class="cb-actions"><button type="button" class="btn btn-accent" data-act="claim">${esc(t("cbClaim"))}</button><button type="button" class="btn btn-ghost" data-act="terms">${esc(t("cbHow"))}</button></div>
  </section>`;
}

// ---------- Static UI ----------
function staticText() {
  document.documentElement.lang = lang;
  $("online").textContent = t("online");
  $("langLabel").textContent = t("lang");
  $("lang").innerHTML = LANGS.map((l) => `<option value="${l.code}"${l.code === lang ? " selected" : ""}>${esc(l.name)}</option>`).join("");
  $("q").placeholder = t("ph");
  $("sendBtn").innerHTML = ICON.send; $("sendBtn").setAttribute("aria-label", t("send"));
  $("infoBtn").innerHTML = ICON.info; $("infoBtn").setAttribute("aria-label", t("termsBtn"));
  $("chips").innerHTML = t("chips").map((c, i) => `<button type="button" data-q="${esc(CHIP_QUERIES[i])}">${esc(c)}</button>`).join("");
}

function greet() {
  thread.innerHTML = "";
  const lines = [...t("greet")];
  if (CB.enabled) lines.push(fmt(t("greetCb"), { amt: amt() }));
  sellerMsg(lines.map((l) => `<p>${esc(l)}</p>`).join(""));
  block(trustCard());
  if (CB.enabled) block(cashbackCard());
}

// ---------- Rendering a reply ----------
function ratingText(p) {
  if (p.rating == null) return "";
  const n = p.ratingCount ? ` · ${inr(p.ratingCount)} ${esc(t("ratings"))}` : "";
  return `<span class="stars num">${p.rating}★</span>${p.ratingType === "seller" ? ` <span>(${esc(t("sellerRating"))})</span>` : ""}<span class="num">${n}</span>`;
}
const cbEligible = (price) => CB.enabled && (!CB.minOrder || price >= CB.minOrder);

function renderReply(data) {
  const msgs = [...data.seller.message];
  if (data.errors?.length) msgs.push(fmt(t("partial"), { list: data.errors.join(", ") }));
  sellerMsg(msgs.map((m) => `<p>${esc(m)}</p>`).join(""));

  const b = data.best;
  if (b) {
    const pc = b.mrp ? Math.round((1 - b.price / b.mrp) * 100) : 0;
    const parts = data.scoreParts || [];
    block(`<article class="pick">
      <div class="pick-head"><span>★ ${esc(t("bestPick"))}</span><span class="num">${esc(t("score"))} ${b.score}/100</span></div>
      <div class="pick-body">
        <div class="pick-top">
          <div class="thumb">${b.image ? `<img src="${esc(safeUrl(b.image))}" alt="" loading="lazy">` : ""}</div>
          <div style="min-width:0"><h2>${esc(b.title)}</h2><div class="meta">${ratingText(b)}<span>${esc(b.platformName)}</span></div></div>
        </div>
        ${data.seller.bestLine ? `<p class="bestline">“${esc(data.seller.bestLine)}”</p>` : ""}
        <div class="price-row"><span class="price num">₹${inr(b.price)}</span>${b.mrp ? `<span class="mrp num">₹${inr(b.mrp)}</span><span class="off num">${pc}% ${esc(t("off"))}</span>` : ""}</div>
        ${cbEligible(b.price) ? `<div><span class="cb-chip">${ICON.gift}${esc(fmt(t("cbChip"), { amt: amt() }))}</span></div>` : ""}
        <div class="label">${esc(t("why"))}</div>
        <ul class="adv">${data.seller.advantages.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
        <a class="btn btn-accent btn-block" href="${esc(safeUrl(b.url))}" target="_blank" rel="sponsored nofollow noopener">${esc(fmt(t("buyOn"), { p: b.platformName }))} ${ICON.out}</a>
        <div class="aff">${esc(t("aff"))}</div>
        ${b.facilities?.length ? `<div class="fac"><div class="label">${esc(fmt(t("whyBuy"), { p: b.platformName }))}</div><ul>${b.facilities.map((f) => `<li>${ICON.check}${esc(f)}</li>`).join("")}</ul></div>` : ""}
        ${parts.length ? `<details class="score"><summary>${esc(t("scoreTitle"))}</summary>${parts.map((s) => `
          <div class="srow"><span>${esc(s.label)}</span><div class="track"><i style="width:${Math.round((b.parts[s.key] / s.max) * 100)}%"></i></div><span class="num">${b.parts[s.key]}/${s.max}</span></div>`).join("")}</details>` : ""}
      </div>
    </article>`);
  }

  if (data.others?.length) {
    block(`<div class="label">${esc(t("others"))}</div><div class="strip">${data.others.map((p) => `
      <a class="alt" href="${esc(safeUrl(p.url))}" target="_blank" rel="sponsored nofollow noopener">
        <div class="img">${p.image ? `<img src="${esc(safeUrl(p.image))}" alt="" loading="lazy">` : ""}</div>
        <div class="name">${esc(p.title)}</div>
        <div class="small">${ratingText(p)}</div>
        <div class="small">${esc(p.platformName)} · ${esc(t("score"))} <span class="num">${p.score}</span></div>
        <b class="num">₹${inr(p.price)}</b>
      </a>`).join("")}</div>`);
  }

  block(`<div class="label">${esc(t("sitesTitle"))}</div><div class="sites">${data.sites.map((s) => `
    <a class="site" href="${esc(safeUrl(s.url))}" target="_blank" rel="sponsored nofollow noopener">${ICON.shield}${esc(s.name)}</a>`).join("")}</div>
    <p class="aff" style="text-align:left;margin:8px 0 0">${esc(t("aff"))}</p>`);

  if (!b && CB.enabled) block(cashbackLine());
  if (data.live) {
    const when = new Date(data.checkedAt).toLocaleString(lang + "-IN", { dateStyle: "medium", timeStyle: "short" });
    block(`<p class="stamp">${esc(fmt(t("stamp"), { d: when }))}</p>`);
  }
}

// ---------- Static mode (no server, e.g. GitHub Pages) ----------
const enc = encodeURIComponent;
const wrap = (url) => (CFG.linkTemplate ? CFG.linkTemplate.replace("{url}", enc(url)) : url);
const FASHION = /\b(shirt|t-?shirt|jeans|kurta|kurti|saree|sari|dress|top|shoes?|sneakers?|sandals?|chappal|jacket|hoodie|trousers?|lehenga|bag|handbag)\b/i;
const BEAUTY = /\b(lipstick|makeup|skincare|serum|cream|moisturi[sz]er|sunscreen|shampoo|conditioner|perfume|kajal|foundation|face ?wash|hair oil)\b/i;
const SITES = [
  { name: "Amazon.in", url: (q) => `https://www.amazon.in/s?k=${enc(q)}${CFG.amazonTag ? `&tag=${enc(CFG.amazonTag)}` : ""}`, own: true },
  { name: "Flipkart", url: (q) => `https://www.flipkart.com/search?q=${enc(q)}${CFG.flipkartAffid ? `&affid=${enc(CFG.flipkartAffid)}` : ""}`, own: true },
  { name: "Croma", url: (q) => `https://www.croma.com/searchB?q=${enc(q)}%3Arelevance&text=${enc(q)}` },
  { name: "Reliance Digital", url: (q) => `https://www.reliancedigital.in/search?q=${enc(q)}` },
  { name: "Tata CLiQ", url: (q) => `https://www.tatacliq.com/search/?searchCategory=all&text=${enc(q)}` },
  { name: "Myntra", cat: "fashion", url: (q) => `https://www.myntra.com/${enc(q.trim().toLowerCase().replace(/\s+/g, "-"))}` },
  { name: "AJIO", cat: "fashion", url: (q) => `https://www.ajio.com/search/?text=${enc(q)}` },
  { name: "Nykaa", cat: "beauty", url: (q) => `https://www.nykaa.com/search/result/?q=${enc(q)}` }
];
function staticResult(q) {
  const sites = SITES
    .filter((s) => !s.cat || (s.cat === "fashion" && FASHION.test(q)) || (s.cat === "beauty" && BEAUTY.test(q)))
    .map((s) => ({ name: s.name, url: s.own ? s.url(q) : wrap(s.url(q)) }));
  return { live: false, best: null, others: [], seller: { message: [fmt(t("noLive"), { q, n: sites.length }), t("noLive2")], advantages: [] }, scoreParts: [], sites, errors: [], checkedAt: new Date().toISOString() };
}

// ---------- Search ----------
let lastQ = "";
let controller = null;
async function run(q, label = q) {
  lastQ = q;
  $("q").value = "";
  const url = new URL(location.href); url.searchParams.set("q", q); history.replaceState(null, "", url);
  const mine = userMsg(label);
  const typing = sellerMsg('<div class="typing" aria-label="…"><span></span><span></span><span></span></div>');
  mine.scrollIntoView({ behavior: "smooth", block: "start" });
  controller?.abort();
  controller = new AbortController();
  let data;
  try {
    await serverReady;
    if (!serverOK) throw new Error("no server");
    const res = await fetch(`${BASE}/api/search?q=${enc(q)}&lang=${lang}`, { signal: controller.signal });
    if (!res.ok) throw new Error(String(res.status));
    data = await res.json();
  } catch (e) {
    if (e.name === "AbortError") { typing.remove(); return; }
    data = staticResult(q);
  }
  typing.remove();
  renderReply(data);
  mine.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- Sheet: trust & terms ----------
const sheet = $("sheet");
function openSheet(html) {
  $("sheetBody").innerHTML = html;
  if (typeof sheet.showModal === "function") sheet.showModal(); else sheet.setAttribute("open", "");
}
function closeSheet() { if (sheet.open) sheet.close?.(); sheet.removeAttribute("open"); }
const head = (title) => `<div class="sheet-head"><h2 id="sheetTitle">${esc(title)}</h2><button type="button" class="icon-btn" style="color:var(--fg);border-color:var(--line);background:var(--sunk)" data-act="close" aria-label="${esc(t("fClose"))}">${ICON.close}</button></div>`;

function openTerms() {
  openSheet(`${head(t("termsBtn"))}
    ${trustCard()}
    ${CB.enabled ? `<div class="sec"><h3>${esc(t("cbHow"))}</h3><ol>${t("cbSteps").map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>
    <div class="sec"><h3>${esc(t("cbTermsT"))}</h3><ul>${t("cbTerms").map((s) => `<li>${esc(s)}</li>`).join("")}${CB.minOrder ? `<li>${esc(fmt(t("cbMin"), { min: inr(CB.minOrder) }))}</li>` : ""}</ul></div>` : ""}
    <div class="sec"><h3>${esc(t("discT"))}</h3><p>${esc(t("disc1"))}</p><p>${esc(t("disc2"))}</p></div>
    <div class="sec"><h3>${esc(t("respT"))}</h3><p>${esc(t("resp1"))}</p><p>${esc(t("resp2"))}</p></div>
    ${CB.enabled ? `<button type="button" class="btn btn-accent btn-block" data-act="claim">${esc(t("cbClaim"))}</button>` : ""}`);
}

// ---------- Sheet: cashback claim ----------
const PLATFORM_NAMES = SITES.map((s) => s.name);
function openClaim() {
  openSheet(`${head(fmt(t("fTitle"), { amt: amt() }))}
    <form id="claimForm" class="sec" novalidate>
      <div class="field"><label for="c-order">${esc(t("fOrder"))}</label><input id="c-order" name="orderId" maxlength="60" autocomplete="off" required></div>
      <div class="field"><label for="c-platform">${esc(t("fPlatform"))}</label><select id="c-platform" name="platform">${PLATFORM_NAMES.map((n) => `<option>${esc(n)}</option>`).join("")}</select></div>
      <div class="field"><label for="c-amount">${esc(t("fAmount"))}</label><input id="c-amount" name="amount" inputmode="numeric" maxlength="9" required></div>
      <div class="field"><label for="c-name">${esc(t("fName"))}</label><input id="c-name" name="name" maxlength="80" autocomplete="name" required></div>
      <div class="field"><label for="c-pay">${esc(t("fPay"))}</label><input id="c-pay" name="payTo" maxlength="80" autocomplete="off" required></div>
      <p class="err" id="c-err" hidden></p>
      <button type="submit" class="btn btn-accent btn-block">${esc(t("fSubmit"))}</button>
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
      form.outerHTML = `<div class="note-ok">${ICON.check} ${esc(t("fDone"))}</div>`;
      return;
    } catch { /* fall through to manual */ }
  }
  // No server: show the details so the customer can send them to you.
  const text = [`${t("fOrder")}: ${claim.orderId}`, `${t("fPlatform")}: ${claim.platform}`, `${t("fAmount")}: ₹${inr(amount)}`, `${t("fName")}: ${claim.name}`, `${t("fPay")}: ${claim.payTo}`].join("\n");
  const where = [CONTACT.whatsapp && `WhatsApp: ${CONTACT.whatsapp}`, CONTACT.email && `Email: ${CONTACT.email}`].filter(Boolean);
  form.outerHTML = `<div class="sec"><h3>${esc(t("fManual"))}</h3>
    ${where.length ? `<pre class="copy">${esc(where.join("\n"))}</pre>` : ""}
    <pre class="copy" id="claimText">${esc(text)}</pre>
    <button type="button" class="btn btn-deep btn-block" data-act="copy">${esc(t("fCopy"))}</button></div>`;
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
$("composer").addEventListener("submit", (e) => { e.preventDefault(); const q = $("q").value.trim(); if (q) run(q); });
$("chips").addEventListener("click", (e) => { const b = e.target.closest("button[data-q]"); if (b) run(b.dataset.q, b.textContent); });
$("infoBtn").addEventListener("click", openTerms);
$("lang").addEventListener("change", (e) => {
  lang = e.target.value;
  try { localStorage.setItem("is-lang", lang); } catch {}
  staticText(); greet();
  if (lastQ) run(lastQ);
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
greet();
const startQ = new URLSearchParams(location.search).get("q");
if (startQ) run(startQ.slice(0, 100));

// Keep the thread clear of the composer, whatever its height.
const sizeComposer = () => document.documentElement.style.setProperty("--composer-h", $("composer").offsetHeight + "px");
new ResizeObserver(sizeComposer).observe($("composer"));
