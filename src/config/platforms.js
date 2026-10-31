// Trusted platforms shown by Intelligent Seller.
// Facilities are general and vary by product and seller. Review this list before going live
// and keep the wording in line with each platform's current policy pages.
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
    facilities: [
      ["Fast delivery", "Quicker delivery for Prime members on eligible items", "ઝડપી ડિલિવરી", "પ્રાઇમ સભ્યોને યોગ્ય પ્રોડક્ટ પર ઝડપી ડિલિવરી"],
      ["Easy returns", "Return or replacement on most items", "સરળ રિટર્ન", "મોટાભાગની પ્રોડક્ટ પર રિટર્ન અથવા રિપ્લેસમેન્ટ"],
      ["Cash on delivery", "On eligible orders", "કેશ ઓન ડિલિવરી", "યોગ્ય ઓર્ડર પર"],
      ["Bank & EMI offers", "Card offers and EMI on many products", "બેંક અને EMI ઓફર", "ઘણી પ્રોડક્ટ પર કાર્ડ ઓફર અને EMI"]
    ]
  },
  flipkart: {
    name: "Flipkart",
    trust: 4.6,
    search: (q, env) => `https://www.flipkart.com/search?q=${enc(q)}${env.FLIPKART_AFFILIATE_ID ? `&affid=${enc(env.FLIPKART_AFFILIATE_ID)}` : ""}`,
    ownAffiliate: true,
    facilities: [
      ["Wide delivery network", "Delivers across most Indian pin codes", "વિશાળ ડિલિવરી નેટવર્ક", "ભારતના મોટાભાગના પિન કોડ પર ડિલિવરી"],
      ["Returns & replacement", "On most items, as listed on the product page", "રિટર્ન અને રિપ્લેસમેન્ટ", "મોટાભાગની પ્રોડક્ટ પર, પ્રોડક્ટ પેજ પ્રમાણે"],
      ["Cash on delivery", "On eligible orders", "કેશ ઓન ડિલિવરી", "યોગ્ય ઓર્ડર પર"],
      ["Bank & EMI offers", "Card offers and no-cost EMI on many products", "બેંક અને EMI ઓફર", "ઘણી પ્રોડક્ટ પર કાર્ડ ઓફર અને નો-કોસ્ટ EMI"]
    ]
  },
  croma: {
    name: "Croma",
    trust: 4.4,
    search: (q) => `https://www.croma.com/searchB?q=${enc(q)}%3Arelevance&text=${enc(q)}`,
    facilities: [
      ["Tata group store", "Electronics retailer from the Tata group", "ટાટા ગ્રુપ સ્ટોર", "ટાટા ગ્રુપનો ઇલેક્ટ્રોનિક્સ સ્ટોર"],
      ["Store pickup", "Collect from a nearby Croma store", "સ્ટોર પિકઅપ", "નજીકના ક્રોમા સ્ટોરથી લો"],
      ["Extended warranty", "Optional protection plans", "વધારાની વોરંટી", "વૈકલ્પિક પ્રોટેક્શન પ્લાન"]
    ]
  },
  reliance: {
    name: "Reliance Digital",
    trust: 4.3,
    search: (q) => `https://www.reliancedigital.in/search?q=${enc(q)}`,
    facilities: [
      ["Big store network", "Stores across India for service", "મોટું સ્ટોર નેટવર્ક", "સર્વિસ માટે આખા ભારતમાં સ્ટોર"],
      ["Installation", "Installation on large appliances", "ઇન્સ્ટોલેશન", "મોટા એપ્લાયન્સ પર ઇન્સ્ટોલેશન"],
      ["EMI options", "On many products", "EMI વિકલ્પ", "ઘણી પ્રોડક્ટ પર"]
    ]
  },
  tatacliq: {
    name: "Tata CLiQ",
    trust: 4.2,
    search: (q) => `https://www.tatacliq.com/search/?searchCategory=all&text=${enc(q)}`,
    facilities: [
      ["Tata group platform", "Authorised brand sellers", "ટાટા ગ્રુપ પ્લેટફોર્મ", "માન્ય બ્રાન્ડ સેલર"],
      ["Easy returns", "As listed on the product page", "સરળ રિટર્ન", "પ્રોડક્ટ પેજ પ્રમાણે"]
    ]
  },
  myntra: {
    name: "Myntra",
    trust: 4.5,
    category: "fashion",
    search: (q) => `https://www.myntra.com/${enc(q.trim().toLowerCase().replace(/\s+/g, "-"))}`,
    facilities: [
      ["Fashion specialist", "Clothing, shoes and accessories", "ફેશન નિષ્ણાત", "કપડાં, શૂઝ અને એક્સેસરીઝ"],
      ["Easy exchange", "Size exchange on eligible items", "સરળ એક્સચેન્જ", "યોગ્ય પ્રોડક્ટ પર સાઇઝ બદલી"]
    ]
  },
  ajio: {
    name: "AJIO",
    trust: 4.2,
    category: "fashion",
    search: (q) => `https://www.ajio.com/search/?text=${enc(q)}`,
    facilities: [
      ["Fashion & brands", "Reliance fashion platform", "ફેશન અને બ્રાન્ડ", "રિલાયન્સનું ફેશન પ્લેટફોર્મ"],
      ["Returns", "As listed on the product page", "રિટર્ન", "પ્રોડક્ટ પેજ પ્રમાણે"]
    ]
  },
  nykaa: {
    name: "Nykaa",
    trust: 4.4,
    category: "beauty",
    search: (q) => `https://www.nykaa.com/search/result/?q=${enc(q)}`,
    facilities: [
      ["Beauty specialist", "Makeup, skincare and wellness", "બ્યુટી નિષ્ણાત", "મેકઅપ, સ્કિનકેર અને વેલનેસ"],
      ["Authentic products", "Sourced from brands and authorised sellers", "અસલી પ્રોડક્ટ", "બ્રાન્ડ અને માન્ય સેલર પાસેથી"]
    ]
  }
};

export const FASHION_WORDS = /\b(shirt|t-?shirt|jeans|kurta|kurti|saree|sari|dress|top|shoes?|sneakers?|sandals?|chappal|jacket|hoodie|trousers?|lehenga|bag|handbag|watch(?!es? (?:smart|fitness)))\b/i;
export const BEAUTY_WORDS = /\b(lipstick|makeup|skincare|serum|cream|moisturi[sz]er|sunscreen|shampoo|conditioner|perfume|kajal|foundation|face ?wash|hair oil)\b/i;
