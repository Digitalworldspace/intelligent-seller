// Your hand-picked products. They show first on the dashboard ("Today's best deals")
// and come first in search results when the search matches.
//
// How to add a product:
//  1. Open the product on Amazon.in or Flipkart and make your affiliate link
//     (Amazon: SiteStripe "Get Link"; Flipkart: Affiliate Link Generator).
//  2. Copy the block below, fill it in, and put it inside the [ ] list.
//     Only url, title and platform are needed. Add price and mrp from the product page
//     and update them when they change, because customers will see them.
//
//  {
//    title: "boAt Airdopes 141 Wireless Earbuds",
//    platform: "Amazon.in",            // Amazon.in, Flipkart, Croma, Reliance Digital, Tata CLiQ, Myntra, AJIO or Nykaa
//    url: "https://amzn.to/xxxxxxx",    // your affiliate link
//    image: "https://m.media-amazon.com/images/I/xxxx.jpg",  // right-click the product photo > Copy image address
//    price: 1299,                       // selling price in ₹
//    mrp: 4490,                         // MRP in ₹
//    rating: 4.1,                       // star rating shown on the product page
//    ratingCount: 250000,               // number of ratings
//    keywords: "earbuds wireless bluetooth tws headphones",  // words customers may search
//    line: "42 hours battery at a budget price",              // one-line reason to buy
//    benefits: ["42 hours total playback", "Low-latency gaming mode", "IPX4 water resistant"]
//  },
//
// Your Amazon tag and Flipkart id (public/config.js) are added to these links automatically
// if a link is missing them, and Flipkart links are turned into app-tracking deeplinks.

window.IS_PRODUCTS = [
];
