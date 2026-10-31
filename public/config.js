// Settings for the website. Everything here is public, so never put secret keys in this file.
window.IS_CONFIG = {
  // Where the Node server (server.js) runs. Leave "" when the site and the server are on the same address
  // (for example on Render). On GitHub Pages, put your Render address here, e.g. "https://intelligent-seller.onrender.com".
  // If the server can't be reached, the site still works and shows trusted-site links for every search.
  apiBase: "",

  // Affiliate ids used in the trusted-site links. These are visible in links anyway, so they are not secrets.
  amazonTag: "",          // e.g. "yourname-21"
  flipkartAffid: "",      // your Flipkart affiliate id
  // Affiliate network link template for the other stores. {url} is replaced by the page address.
  // e.g. "https://linksredirect.com/?cid=YOUR_ID&source=linkkit&url={url}"
  linkTemplate: ""
};
