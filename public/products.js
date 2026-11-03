// Your hand-picked products. They show first on the dashboard ("Today's best deals")
// and come first in search results when the search matches.
//
// How to add a product:
//  1. Open the product on Amazon.in or Flipkart and make your affiliate link
//     (Amazon: SiteStripe "Get Link"; Flipkart: Affiliate Link Generator).
//  2. Copy the block below, fill it in, and put it inside the [ ] list.
//     Only url, title and platform are needed. Add price and mrp from the product page
//     and update them when they change, because customers will see them.
//     Without a price the card shows a "See price" button that opens the product.
//
//  {
//    title: "Product name",
//    platform: "Amazon.in",            // Amazon.in, Flipkart, Croma, Reliance Digital, Tata CLiQ, Myntra, AJIO or Nykaa
//    url: "https://amzn.to/xxxxxxx",    // your affiliate link
//    image: "https://m.media-amazon.com/images/I/xxxx.jpg",
//    price: 1299,                       // selling price in ₹ (optional)
//    mrp: 4490,                         // MRP in ₹ (optional)
//    free: false,                       // true shows a FREE badge instead of a price
//    keywords: "words customers may search",
//    benefits: ["short benefit", "another benefit"]
//  },

window.IS_PRODUCTS = [
  {
    title: "SMOWKLY Women's Cotton Trousers | Korean Wide Leg High Waist Palazzo Pants | Casual & Office Wear",
    platform: "Amazon.in",
    url: "https://link.amazon/A07g8bWma",
    image: "https://m.media-amazon.com/images/I/71tjVw2IH+L._SX679_.jpg",
    keywords: "women trousers pants palazzo wide leg korean cotton high waist office wear bottoms",
    benefits: ["Cotton fabric", "Korean wide-leg, high-waist fit", "Works for office and casual wear"]
  },
  {
    title: "SMOWKLY Women's Korean Style Wide Leg Trousers | Pleated Palazzo with Elastic Back Waist",
    platform: "Amazon.in",
    url: "https://link.amazon/A0d30GhIv",
    image: "https://m.media-amazon.com/images/I/71uaAmj2GcL._SX679_.jpg",
    keywords: "women trousers pants palazzo wide leg korean pleated elastic waist office casual",
    benefits: ["Elastic back waist for comfort", "Stretchable and breathable", "Pleated, high-waist office look"]
  },
  {
    title: "KOTTY Women's Wide-Leg Trouser | High Waist Flowy Palazzo Pants with Drawstring",
    platform: "Amazon.in",
    url: "https://link.amazon/B08O9v6V1",
    image: "https://m.media-amazon.com/images/I/719Amyuy2kL._SX679_.jpg",
    keywords: "women trousers pants palazzo wide leg flowy drawstring travel kotty",
    benefits: ["Drawstring high waist", "Lightweight and flowy", "Good for travel and casual wear"]
  },
  {
    title: "LUMONY Leather Makeup Pouch Bag | Large Travel Toiletry Organizer with Handle & Divider (Brown)",
    platform: "Amazon.in",
    url: "https://link.amazon/B06GdlGuA",
    image: "https://m.media-amazon.com/images/I/81t7nzSKQ0L._SX679_.jpg",
    keywords: "makeup pouch bag cosmetic bag toiletry organizer travel kit leather vanity",
    benefits: ["Large capacity with dividers", "Waterproof leather", "Handle for easy carrying"]
  },
  {
    title: "Co-Ord Set for Women | Ethnic Look | Casual Outfit",
    platform: "Amazon.in",
    url: "https://link.amazon/B0dZhjfqs",
    image: "https://m.media-amazon.com/images/I/91gJ5O8Je3L._SX679_.jpg",
    keywords: "women co-ord set coord set ethnic outfit casual two piece",
    benefits: ["Matching two-piece set", "Ethnic look", "Easy casual outfit"]
  },
  {
    title: "Women Who Run with the Wolves: Myths and Stories of the Wild Woman Archetype",
    platform: "Amazon.in",
    url: "https://link.amazon/B06Ir5Y2n",
    image: "https://m.media-amazon.com/images/I/81F2HsDcRmL._SX342_.jpg",
    free: true,
    keywords: "book books reading women who run with the wolves clarissa pinkola estes free kindle",
    benefits: ["Free", "Classic book on women's stories and myths"]
  },
  {
    title: "GRECIILOOKS High Waist Polycotton Parachute Trousers for Women | Flared Cargo Pants with Side Pockets",
    platform: "Amazon.in",
    url: "https://link.amazon/B09X7NdFT",
    image: "https://m.media-amazon.com/images/I/81nQSw9aOHL._SX679_.jpg",
    keywords: "women trousers pants parachute cargo flared high waist travel plus size",
    benefits: ["Side pockets", "Flared parachute style", "Plus sizes available"]
  },
  {
    title: "LITZO Women's Georgette One Piece Dress | Long Sleeve Fit & Flare A-Line Maxi Gown | Party Outfit",
    platform: "Amazon.in",
    url: "https://link.amazon/B03gbu8cv",
    image: "https://m.media-amazon.com/images/I/81ZU8xQteoL._SX679_.jpg",
    keywords: "women dress one piece maxi gown georgette party western a-line long sleeve new year",
    benefits: ["Georgette fabric", "Fit & flare A-line maxi", "Party and New Year look"]
  },
  {
    title: "KZULLY Women's Western Maxi Dress | Indo-Western A-Line Flared Long Gown",
    platform: "Amazon.in",
    url: "https://link.amazon/B07C6ObNt",
    image: "https://m.media-amazon.com/images/I/81IA-9gcCqL._SX679_.jpg",
    keywords: "women dress maxi gown indo western ethnic a-line flared one piece long",
    benefits: ["Indo-western look", "A-line flared pattern", "Long one-piece gown"]
  },
  {
    title: "Shasmi Women's V-Neck A-Line Maxi Dress | Puff Sleeve Waist Cinched Western Dress",
    platform: "Amazon.in",
    url: "https://link.amazon/B08cnXBRE",
    image: "https://m.media-amazon.com/images/I/81d4gDpUadL._SX679_.jpg",
    keywords: "women girls dress maxi v-neck a-line puff sleeve western party new year",
    benefits: ["Waist-cinched fit", "Puff sleeves", "Party and casual wear"]
  },
  {
    title: "Modestouze Attires Women's Floral Rayon Maxi Dress | Sweetheart Neck Puff Sleeve Floor Length",
    platform: "Amazon.in",
    url: "https://link.amazon/B0fjUk2G9",
    image: "https://m.media-amazon.com/images/I/91wVoXDK6fL._SX679_.jpg",
    keywords: "women dress maxi floral rayon sweetheart neck puff sleeve floor length stylish",
    benefits: ["Floral print, rayon blend", "Sweetheart neck, half puff sleeves", "Floor length with zipper"]
  },
  {
    title: "NAINVISH Women's Rayon Co-Ord Set | Printed Shirt and Pant | Two Piece Lounge Outfit",
    platform: "Amazon.in",
    url: "https://link.amazon/B03wvRODR",
    image: "https://m.media-amazon.com/images/I/81i0qvJAmsL._SX679_.jpg",
    keywords: "women co-ord set coord set rayon printed shirt pant two piece lounge western",
    benefits: ["Rayon, printed shirt and pant", "Two-piece set", "Lounge and western wear"]
  },
  {
    title: "TOPLOT Women's Jumpsuit Co-ord Set | Soft Breathable One-Piece Outfit for Casual & Travel",
    platform: "Amazon.in",
    url: "https://link.amazon/B09vSrWPP",
    image: "https://m.media-amazon.com/images/I/81jJi65qEkL._SX679_.jpg",
    keywords: "women jumpsuit co-ord set coord one piece outfit casual travel toplot",
    benefits: ["Soft, breathable fabric", "Comfortable fit with easy movement", "One-piece outfit for casual and travel"]
  },
  {
    title: "Miss Chase Women's Brick Red & Dusty Green Boat Neck Sleeveless Lace Overlaid Dress",
    platform: "Amazon.in",
    url: "https://link.amazon/B0gjA5q16",
    image: "https://m.media-amazon.com/images/I/918Ul+TYEOL._SX679_.jpg",
    keywords: "women dress lace boat neck sleeveless party dress miss chase western",
    benefits: ["Lace overlay design", "Boat neck, sleeveless", "Brick red & dusty green colours"]
  },
  {
    title: "Miss Chase Women's Boat Neck Sleeveless Lace Overlaid Dress (Style 2)",
    platform: "Amazon.in",
    url: "https://link.amazon/B0iWscZ7B",
    image: "https://m.media-amazon.com/images/I/A1c9xCdLu2L._SX679_.jpg",
    keywords: "women dress lace boat neck sleeveless party dress miss chase western",
    benefits: ["Lace overlay design", "Boat neck, sleeveless", "Regular fit"]
  },
  {
    title: "Amazon Brand Myx Women's Flared Fit Palazzo in Rayon (Plus Sizes Available)",
    platform: "Amazon.in",
    url: "https://link.amazon/B0aWf6Y7O",
    image: "https://m.media-amazon.com/images/I/91PJSQuIqnL._SX679_.jpg",
    keywords: "women palazzo pants rayon flared plus size myx amazon brand trousers",
    benefits: ["Soft rayon fabric", "Flared fit", "Plus sizes available"]
  },
  {
    title: "Leriya Fashion Women's Colorblock Shirt Dress | Long Sleeve Belted Tunic | Western Dress",
    platform: "Amazon.in",
    url: "https://link.amazon/B0cvM5gYM",
    image: "https://m.media-amazon.com/images/I/71KTvnz4MxL._SX679_.jpg",
    keywords: "women shirt dress tunic colorblock belted long sleeve western dress vacation leriya",
    benefits: ["Colorblock shirt-dress style", "Long sleeves with belt", "Casual and vacation wear"]
  },
  {
    title: "Leriya Fashion Women's Colorblock Shirt Dress | Belted Tunic (Style 2)",
    platform: "Amazon.in",
    url: "https://link.amazon/B05gsFj82",
    image: "https://m.media-amazon.com/images/I/81XyMC2-IeL._SX679_.jpg",
    keywords: "women shirt dress tunic colorblock belted long sleeve western dress vacation leriya",
    benefits: ["Colorblock shirt-dress style", "Long sleeves with belt", "Casual and vacation wear"]
  },
  {
    title: "Aahwan Women's 100% Cotton Slim Fit Striped Full Sleeve Crop Top",
    platform: "Amazon.in",
    url: "https://link.amazon/B0djam9cL",
    image: "https://m.media-amazon.com/images/I/816-+CnBXpL._SX679_.jpg",
    keywords: "women crop top striped cotton full sleeve slim fit tops western aahwan",
    benefits: ["100% cotton", "Slim fit, full sleeves", "Striped crop top"]
  },
  {
    title: "Aahwan Solid Bodycon Square Neck Long Party Dress for Women & Girls",
    platform: "Amazon.in",
    url: "https://link.amazon/B00eOx03G",
    image: "https://m.media-amazon.com/images/I/61Cbr+89ZCL._SY741_.jpg",
    keywords: "women girls bodycon dress square neck long party dress solid aahwan",
    benefits: ["Bodycon fit", "Square neck", "Long party dress"]
  },
  {
    title: "Miss Chase A+ Women's Relaxed Fit Maxi Georgette & Sequins Dress",
    platform: "Amazon.in",
    url: "https://link.amazon/B02eIWkqw",
    image: "https://m.media-amazon.com/images/I/A17ucta4K6L._SX679_.jpg",
    keywords: "women maxi dress georgette sequins party relaxed fit plus size miss chase",
    benefits: ["Georgette with sequins", "Relaxed fit maxi", "Party look"]
  },
  {
    title: "Leriya Fashion Women's One Piece Midi Party Dress | Summer, Date & Evening Look",
    platform: "Amazon.in",
    url: "https://link.amazon/B04hvQq2r",
    image: "https://m.media-amazon.com/images/I/81OpiORP2FL._SX679_.jpg",
    keywords: "women one piece midi dress party summer date evening western leriya",
    benefits: ["One-piece midi length", "Party, date and evening look", "Summer casual wear"]
  }
];
