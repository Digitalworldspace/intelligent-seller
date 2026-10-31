// Intelligent Seller front end: the customer only searches; everything else is shown automatically.

const T = {
  en: {
    tag: "Your personal shopping expert",
    hero: "Just tell me what you want. I'll find the best one.",
    sub: "I check India's trusted shopping platforms, compare the options and show you the one worth buying, with all its benefits.",
    ph: "Try: wireless earbuds, air fryer, running shoes…",
    go: "Search", who: "Your seller",
    bestPick: "My best pick for you", score: "Score", buyOn: (p) => `Buy on ${p}`, aff: "Affiliate link",
    off: "off", ratings: "ratings", sellerRating: "seller rating",
    why: "Why I picked this", shelf: "Other good options I checked", scoreTitle: "How it scored",
    deskEye: "Where to buy", deskWhy: "Why buy on this platform",
    sitesTitle: "See it on every trusted site", sitesSub: "Compare offers yourself on India's trusted shopping platforms.",
    howEye: "How I choose", howT: "I compare, you just buy",
    how: ["I check how well each product matches your search.", "I read ratings and how many people rated it.", "I compare the real discount and the price against other options.", "I prefer trusted platforms with good service. Nobody pays to be ranked here."],
    discT: "Affiliate disclosure",
    disc1: "Links on this page are affiliate links. If you buy through them, we may earn a small commission from the platform. You pay the same price.",
    disc2: "Commission never changes our ranking. Every product is scored with the same rules shown on this page.",
    respT: "Who is responsible for your order",
    resp1: "We do not sell or ship products. Your order, payment, delivery, returns and warranty are handled by the platform and its seller.",
    resp2: "Prices, stock and offers come from the platforms and can change at any time. Please check the final price and terms on the platform before paying.",
    stamp: (d) => `Prices checked ${d}. They may have changed since.`,
    error: "Something went wrong while searching. Please try again.",
    partial: (list) => `${list} didn't respond just now, so its products aren't included.`,
    chips: ["wireless earbuds", "air fryer", "running shoes", "smartwatch", "mixer grinder", "5G phone"]
  },
  gu: {
    tag: "તમારો પોતાનો શોપિંગ નિષ્ણાત",
    hero: "બસ કહો શું જોઈએ છે. હું શ્રેષ્ઠ શોધી આપીશ.",
    sub: "હું ભારતના વિશ્વાસપાત્ર શોપિંગ પ્લેટફોર્મ ચકાસું છું, વિકલ્પોની સરખામણી કરું છું અને ખરીદવા જેવી પ્રોડક્ટ તેના ફાયદા સાથે બતાવું છું.",
    ph: "લખો: earbuds, air fryer, running shoes…",
    go: "શોધો", who: "તમારો સેલર",
    bestPick: "તમારા માટે મારી શ્રેષ્ઠ પસંદગી", score: "સ્કોર", buyOn: (p) => `${p} પર ખરીદો`, aff: "એફિલિએટ લિંક",
    off: "છૂટ", ratings: "રેટિંગ", sellerRating: "સેલર રેટિંગ",
    why: "મેં આ કેમ પસંદ કર્યું", shelf: "મેં ચકાસેલા બીજા સારા વિકલ્પો", scoreTitle: "સ્કોર કેવી રીતે આવ્યો",
    deskEye: "ક્યાંથી ખરીદવું", deskWhy: "આ પ્લેટફોર્મ પરથી કેમ ખરીદવું",
    sitesTitle: "દરેક વિશ્વાસપાત્ર સાઇટ પર જુઓ", sitesSub: "ભારતના વિશ્વાસપાત્ર શોપિંગ પ્લેટફોર્મ પર જાતે ઓફરની સરખામણી કરો.",
    howEye: "હું કેવી રીતે પસંદ કરું છું", howT: "હું સરખામણી કરું, તમે બસ ખરીદો",
    how: ["દરેક પ્રોડક્ટ તમારી શોધ સાથે કેટલી મેળ ખાય છે તે ચકાસું છું.", "રેટિંગ અને કેટલા લોકોએ રેટિંગ આપ્યું તે જોઉં છું.", "સાચી છૂટ અને બીજા વિકલ્પો સામે કિંમત સરખાવું છું.", "સારી સર્વિસવાળા વિશ્વાસપાત્ર પ્લેટફોર્મને પ્રાથમિકતા. રેન્કિંગ માટે કોઈ પૈસા આપતું નથી."],
    discT: "એફિલિએટ જાહેરાત",
    disc1: "આ પેજ પરની લિંક એફિલિએટ લિંક છે. તેના દ્વારા ખરીદો તો પ્લેટફોર્મ અમને નાનું કમિશન આપી શકે. તમારી કિંમત એ જ રહે છે.",
    disc2: "કમિશનથી અમારું રેન્કિંગ બદલાતું નથી. દરેક પ્રોડક્ટ આ પેજ પર બતાવેલા એક જ નિયમથી સ્કોર થાય છે.",
    respT: "તમારા ઓર્ડરની જવાબદારી કોની",
    resp1: "અમે પ્રોડક્ટ વેચતા કે મોકલતા નથી. ઓર્ડર, પેમેન્ટ, ડિલિવરી, રિટર્ન અને વોરંટી પ્લેટફોર્મ અને તેના સેલર સંભાળે છે.",
    resp2: "કિંમત, સ્ટોક અને ઓફર પ્લેટફોર્મ પરથી આવે છે અને ગમે ત્યારે બદલાઈ શકે. પેમેન્ટ પહેલા પ્લેટફોર્મ પર અંતિમ કિંમત અને શરતો ચકાસો.",
    stamp: (d) => `કિંમત ${d} એ ચકાસી. ત્યાર પછી બદલાઈ શકે.`,
    error: "શોધતી વખતે ભૂલ થઈ. ફરી પ્રયાસ કરો.",
    partial: (list) => `${list} એ હમણાં જવાબ ન આપ્યો, એટલે તેની પ્રોડક્ટ શામેલ નથી.`,
    chips: ["wireless earbuds", "air fryer", "running shoes", "smartwatch", "mixer grinder", "5G phone"]
  }
};

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const inr = (n) => Math.round(n).toLocaleString("en-IN");
const safeUrl = (u) => (/^https:\/\//i.test(u) ? u : "#");

let lang = "en";
try { const s = localStorage.getItem("is-lang"); if (s === "en" || s === "gu") lang = s; } catch {}
let lastQ = new URLSearchParams(location.search).get("q") || "wireless earbuds";
let controller = null;

function staticText() {
  const t = T[lang];
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-t]").forEach((el) => { const v = t[el.dataset.t]; if (typeof v === "string") el.textContent = v; });
  $("q").placeholder = t.ph;
  $("chips").innerHTML = t.chips.map((c) => `<button type="button" data-q="${esc(c)}">${esc(c)}</button>`).join("");
  $("howDesk").innerHTML = `<div class="eyebrow">${t.howEye}</div><h3>${t.howT}</h3><ul class="fac">${t.how.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>`;
  ["en", "gu"].forEach((l) => $("lang-" + l).setAttribute("aria-pressed", String(l === lang)));
}

function ratingText(p, t) {
  if (p.rating == null) return "";
  const n = p.ratingCount ? ` · ${inr(p.ratingCount)} ${t.ratings}` : "";
  return `<span class="stars num">${p.rating}★</span>${p.ratingType === "seller" ? ` <span>(${t.sellerRating})</span>` : ""}<span class="num">${n}</span>`;
}

function render(data) {
  const t = T[lang];
  const msgs = [...data.seller.message];
  if (data.errors?.length) msgs.push(t.partial(data.errors.join(", ")));
  $("sellerMsg").innerHTML = msgs.map((m) => `<p>${esc(m)}</p>`).join("");

  const b = data.best;
  $("pick").hidden = !b;
  $("desk").hidden = !b;
  $("shelfWrap").hidden = !data.others?.length;

  if (b) {
    const pc = b.mrp ? Math.round((1 - b.price / b.mrp) * 100) : 0;
    $("pick").innerHTML = `
      <div class="pick-head"><span>★ ${t.bestPick}</span><span class="num">${t.score} ${b.score}/100</span></div>
      <div class="pick-body">
        <div class="thumb">${b.image ? `<img src="${esc(safeUrl(b.image))}" alt="" loading="lazy">` : ""}</div>
        <div style="min-width:0">
          <h2>${esc(b.title)}</h2>
          <div class="meta">${ratingText(b, t)}<span>${esc(b.platformName)}</span></div>
          ${data.seller.bestLine ? `<p class="bestline">“${esc(data.seller.bestLine)}”</p>` : ""}
          <div class="priceRow"><span class="price num">₹${inr(b.price)}</span>${b.mrp ? `<span class="mrp num">₹${inr(b.mrp)}</span><span class="off num">${pc}% ${t.off}</span>` : ""}</div>
          <div class="eyebrow" style="margin-top:16px">${t.why}</div>
          <ul class="adv">${data.seller.advantages.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
          <div class="cta"><a class="buy" href="${esc(safeUrl(b.url))}" target="_blank" rel="sponsored nofollow noopener">${esc(t.buyOn(b.platformName))} →</a><span class="aff">${t.aff}</span></div>
          <div class="score"><h3>${t.scoreTitle}</h3>
            ${data.scoreParts.map((s) => `<div class="srow"><span>${esc(s.label)}</span><div class="track"><i style="width:${Math.round((b.parts[s.key] / s.max) * 100)}%"></i></div><span class="num">${b.parts[s.key]}/${s.max}</span></div>`).join("")}
          </div>
        </div>
      </div>`;

    $("desk").innerHTML = `<div class="eyebrow">${t.deskEye}</div><h3>${esc(b.platformName)}</h3>
      <div class="eyebrow">${t.deskWhy}</div>
      <ul class="fac">${b.facilities.map((f) => `<li><b>${esc(f.title)}</b><span>${esc(f.detail)}</span></li>`).join("")}</ul>
      <a class="buy" href="${esc(safeUrl(b.url))}" target="_blank" rel="sponsored nofollow noopener">${esc(t.buyOn(b.platformName))} →</a>`;
  }

  $("shelf").innerHTML = (data.others || []).map((p) => `
    <a class="alt" href="${esc(safeUrl(p.url))}" target="_blank" rel="sponsored nofollow noopener">
      <div class="img">${p.image ? `<img src="${esc(safeUrl(p.image))}" alt="" loading="lazy">` : ""}</div>
      <div style="min-width:0"><div class="name">${esc(p.title)}</div>
        <div class="small">${ratingText(p, t)} · ${esc(p.platformName)} · ${t.score} <span class="num">${p.score}</span></div></div>
      <div class="right"><b class="num">₹${inr(p.price)}</b>${p.mrp ? `<span class="small mrp num">₹${inr(p.mrp)}</span>` : ""}</div>
    </a>`).join("");

  $("sites").innerHTML = data.sites.map((s) => `<a class="site" href="${esc(safeUrl(s.url))}" target="_blank" rel="sponsored nofollow noopener">${esc(s.name)} <span>→</span></a>`).join("");

  const when = new Date(data.checkedAt).toLocaleString(lang === "gu" ? "gu-IN" : "en-IN", { dateStyle: "medium", timeStyle: "short" });
  $("stamp").textContent = data.live ? t.stamp(when) : "";
}

async function run(q) {
  lastQ = q;
  $("q").value = q;
  const url = new URL(location.href); url.searchParams.set("q", q); history.replaceState(null, "", url);
  $("sellerMsg").innerHTML = `<div class="typing" aria-label="…"><span></span><span></span><span></span></div>`;
  controller?.abort();
  controller = new AbortController();
  const base = (CFG.apiBase || "").replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/api/search?q=${encodeURIComponent(q)}&lang=${lang}`, { signal: controller.signal });
    if (!res.ok || !(res.headers.get("content-type") || "").includes("json")) throw new Error(String(res.status));
    render(await res.json());
  } catch (e) {
    if (e.name === "AbortError") return;
    // No server (for example on GitHub Pages): still help the customer with trusted-site links.
    render(staticResult(q));
  }
}

// ---------- Static mode: works without the server ----------
const CFG = window.IS_CONFIG || {};
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
const STATIC_MSG = {
  en: (q, n) => [`You searched for “${q}”. Here it is on ${n} of India's trusted shopping sites.`, "Tap a site to see its best offers. Amazon.in and Flipkart usually have the widest choice and fast delivery."],
  gu: (q, n) => [`તમે “${q}” શોધ્યું. ભારતની ${n} વિશ્વાસપાત્ર શોપિંગ સાઇટ પર તે અહીં છે.`, "કોઈપણ સાઇટ પર ટેપ કરી શ્રેષ્ઠ ઓફર જુઓ. Amazon.in અને Flipkart પર સામાન્ય રીતે સૌથી વધુ વિકલ્પ અને ઝડપી ડિલિવરી મળે છે."]
};
function staticResult(q) {
  const sites = SITES
    .filter((s) => !s.cat || (s.cat === "fashion" && FASHION.test(q)) || (s.cat === "beauty" && BEAUTY.test(q)))
    .map((s) => ({ name: s.name, url: s.own ? s.url(q) : wrap(s.url(q)) }));
  return { live: false, best: null, others: [], seller: { message: STATIC_MSG[lang](q, sites.length), advantages: [] }, scoreParts: [], sites, errors: [], checkedAt: new Date().toISOString() };
}

$("searchForm").addEventListener("submit", (e) => { e.preventDefault(); const q = $("q").value.trim(); if (q) run(q); });
$("chips").addEventListener("click", (e) => { const b = e.target.closest("button[data-q]"); if (b) run(b.dataset.q); });
document.querySelectorAll(".lang button").forEach((b) => b.addEventListener("click", () => {
  lang = b.dataset.lang;
  try { localStorage.setItem("is-lang", lang); } catch {}
  staticText(); run(lastQ);
}));

staticText();
run(lastQ);
