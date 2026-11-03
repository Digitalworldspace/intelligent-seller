// Settings for the website. Everything here is public, so never put secret keys in this file.
window.IS_CONFIG = {
  // Where the Node server (server.js) runs. Leave "" when the site and the server are on the same address
  // (for example on Render). On GitHub Pages, put your Render address here, e.g. "https://intelligent-seller.onrender.com".
  // If the server can't be reached, the site still works and shows trusted-site links for every search.
  apiBase: "",

  // Affiliate ids used in the trusted-site links. These are visible in links anyway, so they are not secrets.
  amazonTag: "styleoflife08-21",   // Amazon Associates tracking ID
  flipkartAffid: "",      // your Flipkart affiliate id
  // Affiliate network link template for the other stores. {url} is replaced by the page address.
  // e.g. "https://linksredirect.com/?cid=YOUR_ID&source=linkkit&url={url}"
  linkTemplate: "",

  // Monthly lucky draw: only the winner gets the prize.
  // Every verified order placed through this site is one entry. On the last day of each month
  // you pick the winner(s) at random (see README: "Run the monthly draw") and pay them by UPI.
  luckyDraw: {
    enabled: true,
    prize: 1000,          // ₹ for each winner
    winnersPerMonth: 1,
    minOrder: 0,          // minimum order amount in ₹ to enter (0 = any order)
    // Shown on the site when no server is connected. Add each winner after the draw, newest first.
    // Use first name + initial only, e.g. { month: "2026-11", name: "Priya S.", city: "Surat" }
    winners: []
  },

  // Where customers send cashback claims when the server isn't connected.
  // Shown to customers as plain text they can copy.
  contact: {
    whatsapp: "",   // e.g. "+91 98765 43210"
    email: "styleoflife987@gmail.com"
  },

  // Every claim is emailed here (through FormSubmit, which needs no server).
  // The first claim sends an "Activate form" email to this address: open it and click Activate once.
  // After that you can replace the address with the random alias FormSubmit gives you, to keep it out of the page.
  notifyEmail: "styleoflife987@gmail.com"
};
