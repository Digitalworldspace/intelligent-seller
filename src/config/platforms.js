// Trusted platforms shown by Intelligent Seller.
// facilities: keys into public/i18n.js (fac), so they show in every language.
// Facilities are general and vary by product and seller. Review the wording in public/i18n.js
// before going live and keep it in line with each platform's current policy pages.
//
// trust: your own 0-5 rating of the platform's service (used in the score). Change as you like.
// search(q): the platform's public search page for the query.

const enc = encodeURIComponent;

export const PLATFORMS = {
  amazon: {
    name: "Amazon.in",
    trust: 4.7,
    search: (q, env) => `https://www.amazon.in/s?k=${enc(q)}${env.AMAZON_PARTNER_TAG ? `&tag=${enc(env.AMAZON_PARTNER_TAG)}` : ""}`,
    ownAffiliate: true,
    facilities: ["fastDelivery", "easyReturns", "cod", "bankEmi"]
  },
  flipkart: {
    name: "Flipkart",
    trust: 4.6,
    search: (q, env) => `https://www.flipkart.com/search?q=${enc(q)}${env.FLIPKART_AFFILIATE_ID ? `&affid=${enc(env.FLIPKART_AFFILIATE_ID)}` : ""}`,
    ownAffiliate: true,
    facilities: ["wideDelivery", "easyReturns", "cod", "bankEmi"]
  },
  croma: {
    name: "Croma",
    trust: 4.4,
    search: (q) => `https://www.croma.com/searchB?q=${enc(q)}%3Arelevance&text=${enc(q)}`,
    facilities: ["tataStore", "storePickup", "extWarranty"]
  },
  reliance: {
    name: "Reliance Digital",
    trust: 4.3,
    search: (q) => `https://www.reliancedigital.in/search?q=${enc(q)}`,
    facilities: ["storeNetwork", "installation", "bankEmi"]
  },
  tatacliq: {
    name: "Tata CLiQ",
    trust: 4.2,
    search: (q) => `https://www.tatacliq.com/search/?searchCategory=all&text=${enc(q)}`,
    facilities: ["authBrand", "easyReturns"]
  },
  myntra: {
    name: "Myntra",
    trust: 4.5,
    category: "fashion",
    search: (q) => `https://www.myntra.com/${enc(q.trim().toLowerCase().replace(/\s+/g, "-"))}`,
    facilities: ["fashion", "sizeExchange"]
  },
  ajio: {
    name: "AJIO",
    trust: 4.2,
    category: "fashion",
    search: (q) => `https://www.ajio.com/search/?text=${enc(q)}`,
    facilities: ["relFashion", "easyReturns"]
  },
  nykaa: {
    name: "Nykaa",
    trust: 4.4,
    category: "beauty",
    search: (q) => `https://www.nykaa.com/search/result/?q=${enc(q)}`,
    facilities: ["beauty", "authentic"]
  }
};

export const FASHION_WORDS = /\b(shirt|t-?shirt|jeans|kurta|kurti|saree|sari|dress|top|shoes?|sneakers?|sandals?|chappal|jacket|hoodie|trousers?|lehenga|bag|handbag|watch(?!es? (?:smart|fitness)))\b/i;
export const BEAUTY_WORDS = /\b(lipstick|makeup|skincare|serum|cream|moisturi[sz]er|sunscreen|shampoo|conditioner|perfume|kajal|foundation|face ?wash|hair oil)\b/i;
