// Settings for the website. Everything here is public, so never put secret keys in this file.
window.IS_CONFIG = {
  // Where the Node server (server.js) runs. Leave "" when the site and the server are on the same address
  // (for example on Render). On GitHub Pages, put your Render address here, e.g. "https://intelligent-seller.onrender.com".
  // If the server can't be reached, the site still works and shows trusted-site links for every search.
  apiBase: "",

  // Affiliate ids used in the trusted-site links. These are visible in links anyway, so they are not secrets.
  amazonTag: "",          // e.g. "styleoflife08-21"
  flipkartAffid: "",      // your Flipkart affiliate id
  // Affiliate network link template for the other stores. {url} is replaced by the page address.
  // e.g. "https://linksredirect.com/?cid=YOUR_ID&source=linkkit&url={url}"
  linkTemplate: "",

  // Cashback paid by you to the customer: guaranteed on every eligible order, "up to ₹1,000".
  // Bigger order, bigger cashback. Each slab: orders of `min` ₹ or more get `amount` ₹.
  // Keep each amount below the affiliate commission you expect on an order of that size,
  // so cashback never costs more than you earn. Keep CASHBACK_TIERS on the server the same.
  cashback: {
    enabled: true,
    tiers: [
      { min: 999, amount: 50 },
      { min: 4999, amount: 200 },
      { min: 14999, amount: 500 },
      { min: 24999, amount: 1000 }
    ]
  },

  // Where customers send cashback claims when the server isn't connected.
  // Shown to customers as plain text they can copy.
  contact: {
    whatsapp: "",   // e.g. "+91 98765 43210"
    email: ""       // e.g. "cashback@yourdomain.in"
  }
};
