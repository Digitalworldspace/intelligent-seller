# Intelligent Seller

Customer khali search kare che. **Intelligent Seller** pote India na trusted shopping platform (Amazon.in, Flipkart, Croma, Reliance Digital, Tata CLiQ, Myntra, AJIO, Nykaa) par product shodhe che, sauthi saru product pasand kare che, ane tena fayda, platform ni suvidha ane "best line" sathe batave che. Customer ne kai puchvu padtu nathi.

The customer only searches. The Intelligent Seller looks up products on India's trusted shopping platforms, picks the best one, and shows its benefits, the platform's facilities and a one-line pitch, without asking the customer anything.

## Features

- **Seller that talks**: a short message in English or Gujarati ("You searched for…, buy this one…").
- **Best pick card**: image, price, MRP, discount, rating, "why I picked this" list, Buy button (affiliate link).
- **Transparent score out of 100**: match, rating, number of ratings, discount, value, platform trust and availability. The same rules apply to every product, and commission is never part of the score.
- **Platform facilities**: delivery, returns, COD and EMI for the platform that sells the best pick.
- **Other good options**, ranked.
- **Links to every trusted site** for the same search, so the customer always has a next step.
- **Affiliate disclosure** and a **"who is responsible for your order"** note on every page.
- Optional **AI seller (Claude)** writes a smarter pitch, using only facts from the platforms.

## Chat design, languages and cashback

- **Chat style, mobile first**: the seller greets the customer, the search box is pinned at the bottom like a messaging app, and the best pick, its benefits, other options and trusted sites appear inside the conversation.
- **10 languages**: English, हिन्दी, ગુજરાતી, मराठी, বাংলা, தமிழ், తెలుగు, ಕನ್ನಡ, മലയാളം, ਪੰਜਾਬੀ. The site picks the phone's language automatically; customers can change it from the top bar. All text lives in `public/i18n.js`. Please have a native speaker review each language before launch.
- **Monthly ₹1,000 lucky draw: only the winner gets the prize.** Every verified order placed through the site is one entry. On the last day of each month one winner is picked at random and paid by UPI. Set it in `public/config.js` (`luckyDraw`) and `DRAW_*` on the server.
  - Lucky draws tied to a purchase can fall under lottery and promotion laws in India, which differ by state. Have the draw rules checked by a CA or lawyer before launch.

### Run the monthly draw (with the server)

All owner calls need the header `x-admin-key: YOUR_ADMIN_KEY`.

1. **See entries**: `GET /api/cashback/claims`
2. **Verify** each entry against your Amazon/Flipkart affiliate dashboard (order exists, not returned):
   `POST /api/draw/verify` with `{"ids":["<entry id>", ...], "status":"verified"}` (or `"rejected"`)
3. **Run the draw** on the last day of the month: `POST /api/draw/run` with `{"month":"2026-11"}`.
   The winner is picked at random from that month's verified entries, saved to `data/winners.json`, and shown on the site as first name + initial.
4. **Pay** the winner on the UPI ID in the result, within 7 days.

Without the server (GitHub Pages only), entries reach you on WhatsApp/email (`contact` in `public/config.js`). Pick the winner yourself and add them to `luckyDraw.winners` in `public/config.js`, e.g. `{ month: "2026-11", name: "Priya S.", city: "Surat" }`.

## Where the data comes from

| Platform | How | What you need |
|---|---|---|
| Amazon.in | Official **Amazon Creators API** (PA-API 5 was retired on 30 April 2026) | Amazon Associates account + Creators API credentials |
| Flipkart | Official **Flipkart Affiliate API** | Flipkart Affiliate ID + API token |
| Croma, Reliance Digital, Tata CLiQ, Myntra, AJIO, Nykaa | Search links on the real site | Optional affiliate network link template (e.g. Cuelinks / EarnKaro) |

The app never scrapes websites. It uses only official affiliate APIs and public search links, and it never shows a price that didn't come from the platform.

Until you add API keys, the app shows the seller's message and the trusted-site links for every search. Product cards appear as soon as Amazon or Flipkart keys are added.

## Run it on your computer

```bash
git clone <this repo>
cd intelligent-seller
npm install
cp .env.example .env     # then fill in your keys
npm start                # open http://localhost:3000
```

Node.js 18 or newer is required. Run the tests with `npm test`.

### Keys (`.env`)

1. **Amazon.in**: Sign in to [Amazon Associates](https://affiliate-program.amazon.in) → Tools → Creators API → create credentials. Copy the Credential ID, Secret and **Version**. Set `AMAZON_TOKEN_URL` to the token URL for that version (see the Creators API docs, "Using cURL → Regional endpoints"). Amazon may require qualifying sales before API access is given.
2. **Flipkart**: Sign in to [Flipkart Affiliate](https://affiliate.flipkart.com) → API token. Copy the Affiliate ID and token.
3. **Other sites (optional)**: Join an affiliate network that supports these stores and paste its link template in `AFFILIATE_LINK_TEMPLATE` (use `{url}` where the page URL goes).
4. **AI seller (optional)**: Add `ANTHROPIC_API_KEY`. Without it the seller uses built-in rules.

Check what is connected at `/api/health`.

## Put it online (free tier)

**Render**: New → Blueprint → choose this repo. `render.yaml` is included. Add your keys under Environment.

Any Node host works (Railway, a VPS, etc.): run `npm install` and `npm start`.

## Customise

- `src/config/platforms.js`: platform names, trust ratings, facilities text (English + Gujarati), and search URLs. **Review the facilities text against each platform's current policy before going live.**
- `src/lib/score.js`: scoring rules and weights.
- `src/lib/seller.js`: the seller's wording and the AI instructions.
- `public/`: the website (HTML, CSS, JS).

## Legal checklist (India)

- Keep the **affiliate disclosure** visible (ASCI guidelines for influencer/affiliate advertising). Buy buttons are marked "Affiliate link" and use `rel="sponsored"`.
- Follow each affiliate program's rules (Amazon Associates Operating Agreement, Flipkart Affiliate terms), including rules on showing prices and how fresh they must be. Prices here are cached for at most 10 minutes and show a "checked at" time.
- Don't use platform logos or make the site look like the platform itself.
- The "who is responsible for your order" note makes clear that the platform and its seller handle orders, payment, delivery, returns and warranty.

This is not legal advice. Check the current terms of each program before launch.

## Project structure

```
server.js                  Express server and /api/search
src/providers/amazon.js    Amazon Creators API
src/providers/flipkart.js  Flipkart Affiliate API
src/lib/score.js           Transparent 0-100 score
src/lib/seller.js          Seller message (rules or Claude)
src/lib/links.js           Trusted-site search links + affiliate wrapping
src/config/platforms.js    Platforms, trust, facilities (EN + GU)
public/                    Website
test/                      Tests (npm test)
```
