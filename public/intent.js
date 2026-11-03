// Understands what the customer typed, in English or Indian languages:
// what product, budget (min/max ₹), brand, needs (camera, gaming…) and whether they want it cheap.
// Example: "15000 ni andar camera saro phone" → { query: "camera phone", max: 15000, needs: ["camera"], product: "phone" }

const DIGITS = "०१२३४५६७८९૦૧૨૩૪૫૬૭૮૯০১২৩৪৫৬৭৮৯௦௧௨௩௪௫௬௭௮௯౦౧౨౩౪౫౬౭౮౯೦೧೨೩೪೫೬೭೮೯൦൧൨൩൪൫൬൭൮൯੦੧੨੩੪੫੬੭੮੯";
const toAsciiDigits = (s) => s.replace(/[०-९૦-૯০-৯௦-௯౦-౯೦-೯൦-൯੦-੯]/g, (c) => String(DIGITS.indexOf(c) % 10));

// Local words → English search words.
const WORDS = {
  phone: ["ફોન", "મોબાઇલ", "મોબાઈલ", "फ़ोन", "फोन", "मोबाइल", "ফোন", "মোবাইল", "போன்", "மொபைல்", "ఫోన్", "మొబైల్", "ಫೋನ್", "ಮೊಬೈಲ್", "ഫോൺ", "മൊബൈൽ", "ਫ਼ੋਨ", "ਫੋਨ", "ਮੋਬਾਈਲ", "mobile"],
  shoes: ["જૂતા", "બૂટ", "શૂઝ", "જોડા", "जूते", "जूता", "शूज़", "शूज", "জুতো", "জুতা", "ஷூ", "ஷூஸ்", "షూస్", "ಶೂ", "ഷൂസ്", "ਜੁੱਤੀ", "ਜੁੱਤੀਆਂ", "ਬੂਟ", "joota", "joote", "juta"],
  watch: ["ઘડિયાળ", "घड़ी", "घडी", "ঘড়ি", "கடிகாரம்", "వాచ్", "ಗಡಿಯಾರ", "വാച്ച്", "ਘੜੀ", "ghadi", "ghadiyal"],
  earphones: ["ઇયરફોન", "ઈયરફોન", "ईयरफोन", "इयरफोन", "earphone"],
  earbuds: ["ઇયરબડ્સ", "ईयरबड्स", "earbud"],
  headphones: ["હેડફોન", "हेडफोन", "headphone"],
  tv: ["ટીવી", "टीवी", "television"],
  laptop: ["લેપટોપ", "लैपटॉप", "लैपटाप"],
  saree: ["સાડી", "साड़ी", "साडी", "শাড়ি", "புடவை", "చీర", "ಸೀರೆ", "സാരി", "sari", "sadi"],
  kurti: ["કુર્તી", "कुर्ती"],
  fridge: ["ફ્રિજ", "फ्रिज", "refrigerator"],
  "mixer grinder": ["મિક્સર", "मिक्सर", "mixie", "mixer"],
  "air fryer": ["એર ફ્રાયર", "एयर फ्रायर", "airfryer"],
  bag: ["બેગ", "बैग", "थैला"],
  shirt: ["શર્ટ", "शर्ट"],
  cooler: ["કૂલર", "कूलर"],
  fan: ["પંખો", "पंखा"],
  "washing machine": ["વોશિંગ મશીન", "वॉशिंग मशीन"],
  camera: ["કેમેરા", "कैमरा", "क़ैमरा", "ক্যামেরা", "கேமரா", "కెమెరా", "ಕ್ಯಾಮೆರಾ", "ക്യാമറ", "ਕੈਮਰਾ"],
  gaming: ["ગેમિંગ", "गेमिंग", "game"],
  battery: ["બેટરી", "बैटरी", "ব্যাটারি"],
  kids: ["બાળકો", "બાળક", "बच्चों", "बच्चे", "bachcho", "baccho"],
  women: ["મહિલા", "સ્ત્રી", "लेडीज", "महिला", "ladies", "womens"],
  men: ["પુરુષ", "जेंट्स", "पुरुष", "gents", "mens"],
  gift: ["ગિફ્ટ", "ભેટ", "गिफ्ट", "तोहफा"]
};
const LOCAL = Object.entries(WORDS).flatMap(([en, list]) => list.map((w) => [w.toLowerCase(), en])).sort((a, b) => b[0].length - a[0].length);
const NEEDS = ["camera", "gaming", "battery", "music", "bass", "running", "gym", "office", "kids", "gift", "women", "men", "students", "travel", "waterproof"];
const BRANDS = ["samsung", "apple", "iphone", "oneplus", "xiaomi", "redmi", "realme", "vivo", "oppo", "motorola", "nokia", "iqoo", "poco", "google", "pixel",
  "boat", "jbl", "sony", "noise", "fire-boltt", "boult", "philips", "prestige", "bajaj", "havells", "pigeon", "lg", "whirlpool", "godrej", "haier",
  "nike", "adidas", "puma", "campus", "asics", "skechers", "bata", "hp", "dell", "lenovo", "asus", "acer", "lakme", "maybelline", "biba", "w"];
const CHEAP = ["cheap", "cheapest", "budget", "sasta", "sasti", "saste", "sastu", "low price", "સસ્તું", "સસ્તો", "સસ્તી", "सस्ता", "सस्ती", "सस्ते", "কম দামে", "மலிவான", "చౌక", "ಅಗ್ಗದ", "വിലകുറഞ്ഞ", "ਸਸਤਾ"];
const FILLER = ["best", "good", "top", "nice", "buy", "want", "need", "for", "me", "my", "a", "an", "the", "please", "plz", "with", "and", "of", "in", "price", "rs", "inr", "rupees", "rupee", "₹",
  "chahiye", "chaiye", "ni", "nu", "na", "no", "thi", "se", "joie", "joiye", "joiae", "lena", "levu", "hai", "che", "chhe", "mate", "ke", "liye", "ka", "ki", "wala", "wali", "vala", "vali", "saru", "saro", "sari", "accha", "acha", "achha", "sabse", "mujhe", "koi", "evo", "evu", "hoy",
  "જોઈએ", "જોઇએ", "માટે", "સારું", "સારો", "સારી", "સારા", "sara", "saara", "સૌથી", "એવો", "એવું", "હોય", "છે", "નો", "ની", "નું", "ના", "એક", "લેવો", "લેવું", "રૂ", "રૂપિયા",
  "चाहिए", "के", "लिए", "वाला", "वाली", "अच्छा", "अच्छी", "सबसे", "मुझे", "है", "का", "की", "एक", "रु", "रुपये", "रुपए", "कोई"];
// Budget words: before or after the number.
const MAX_WORDS = ["under", "below", "less than", "within", "upto", "up to", "max", "maximum", "budget", "around", "about", "tak", "andar", "niche", "neeche", "sudhi", "se kam",
  "ની અંદર", "અંદર", "થી ઓછું", "થી ઓછા", "થી ઓછી", "સુધી", "સુધીમાં", "નીચે", "બજેટ", "से कम", "तक", "के अंदर", "अंदर", "से नीचे", "बजट", "এর মধ্যে", "এর নিচে", "க்குள்", "లోపు", "ಒಳಗೆ", "ഇൽ താഴെ", "ਤੱਕ", "ਤੋਂ ਘੱਟ"];
const MIN_WORDS = ["above", "over", "more than", "min", "minimum", "from", "starting", "se upar", "thi vadhu", "થી વધુ", "થી ઉપર", "से ज़्यादा", "से ज्यादा", "से ऊपर", "से अधिक", "এর বেশি", "க்கு மேல்", "పైన", "ಮೇಲೆ", "ਤੋਂ ਵੱਧ"];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const has = (text, w) => new RegExp(`(^|[^\\p{L}\\p{M}])${esc(w)}($|[^\\p{L}\\p{M}])`, "iu").test(text);
const strip = (text, w) => text.replace(new RegExp(`(^|[^\\p{L}\\p{M}])${esc(w)}(?=$|[^\\p{L}\\p{M}])`, "giu"), "$1 ");

export function parseIntent(raw) {
  let text = " " + toAsciiDigits(String(raw || "")).toLowerCase().replace(/\s+/g, " ") + " ";
  let min = null, max = null, sort = null;

  // Prices: 15k, 1.5 lakh, 15,000, ₹15000 (not 8gb, 5g, 4.2l, 6000mah)
  text = text.replace(/(\d+(?:\.\d+)?)\s*(lakh|lac|lakhs)\b/g, (_, n) => ` ${Math.round(Number(n) * 100000)} `)
    .replace(/(\d+(?:\.\d+)?)\s*k\b/g, (_, n) => ` ${Math.round(Number(n) * 1000)} `)
    .replace(/(\d),(\d{2,3})/g, "$1$2").replace(/(\d),(\d{3})/g, "$1$2")
    .replace(/₹\s*/g, " ").replace(/\brs\.?\s*(?=\d)/g, " ");

  const PRICE = "(?<![\\w.])(\\d{3,7})(?![\\w.])";
  const range = text.match(new RegExp(`${PRICE}\\s*(?:-|–|to|se|thi|થી|से|ਤੋਂ)\\s*${PRICE}`));
  if (range && Number(range[1]) < Number(range[2])) {
    min = Number(range[1]); max = Number(range[2]);
    text = text.replace(range[0], " ");
  } else {
    const m = text.match(new RegExp(PRICE));
    if (m) {
      const at = m.index, around = text.slice(Math.max(0, at - 25), at + m[0].length + 25);
      const found = (list) => list.some((w) => (/^[a-z ]+$/.test(w) ? has(around, w) : around.includes(w)));
      const isMin = found(MIN_WORDS) && !found(MAX_WORDS);
      if (isMin) min = Number(m[1]); else max = Number(m[1]);
      text = text.replace(m[0], " ");
    }
  }
  if (min != null || max != null) for (const w of [...MAX_WORDS, ...MIN_WORDS].sort((a, b) => b.length - a.length)) text = strip(text, w);

  if (CHEAP.some((w) => has(text, w))) { sort = "low"; for (const w of CHEAP) text = strip(text, w); }

  // Translate local words
  // Longest words first, so "ઇયરફોન" becomes earphones before "ફોન" becomes phone.
  // English words only as whole words (so "earbud" doesn't eat part of "earbuds").
  for (const [w, en] of LOCAL) {
    if (/^[a-z ]+$/.test(w)) { if (has(text, w)) text = text.replace(new RegExp(`(^|[^\\p{L}\\p{M}])${esc(w)}(?=$|[^\\p{L}\\p{M}])`, "giu"), `$1 ${en} `); }
    else if (text.includes(w)) text = text.split(w).join(` ${en} `);
  }

  for (const w of FILLER) text = strip(text, w);
  const query = [...new Set(text.replace(/[^\p{L}\p{M}\d\s-]/gu, " ").split(/\s+/).filter(Boolean))].join(" ");
  const words = query.split(" ").filter(Boolean);
  const brand = BRANDS.find((b) => words.includes(b)) || null;
  const needs = NEEDS.filter((n) => words.includes(n));
  const product = words.filter((w) => w !== brand && !needs.includes(w)).join(" ") || null;

  return { query: query || String(raw || "").trim(), min, max, brand, needs, product, sort };
}

// Add the budget and sort to a platform's search link.
export function filteredSearchUrl(site, url, f) {
  try {
    const u = new URL(url);
    if (site === "Amazon.in") {
      if (f.min || f.max) u.searchParams.set("rh", `p_36:${f.min ? f.min * 100 : ""}-${f.max ? f.max * 100 : ""}`);
      const s = { low: "price-asc-rank", high: "price-desc-rank", rating: "review-rank" }[f.sort];
      if (s) u.searchParams.set("s", s);
    }
    if (site === "Flipkart") {
      if (f.min) u.searchParams.append("p[]", `facets.price_range.from=${f.min}`);
      if (f.min || f.max) u.searchParams.append("p[]", `facets.price_range.to=${f.max || "Max"}`);
      const s = { low: "price_asc", high: "price_desc", rating: "popularity" }[f.sort];
      if (s) u.searchParams.set("sort", s);
    }
    return u.toString();
  } catch { return url; }
}
