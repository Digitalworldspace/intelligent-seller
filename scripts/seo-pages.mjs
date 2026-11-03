// Landing pages for search engines: one page per product category, in English, Hindi and Gujarati.
// Each page targets the words people actually type in Google. Products are matched from
// public/products.js by the `match` words. Edit the text here, then run: npm run seo

export const LANG_PAGES = {
  en: { dir: "", htmlLang: "en-IN", home: "Home", deals: "Deals", seeOn: "See on {p}", searchMore: "Search more on Intelligent Seller", searchBtn: "Search", related: "More categories", faqT: "Frequently asked questions", win: "Every order through our links is an entry to win ₹1,000 cash.", note: "Prices, stock and offers are set by the platform and can change. Check them on the platform before you pay. Links are affiliate links: we may earn a small commission at no extra cost to you.", picked: "{n} hand-picked products" },
  hi: { dir: "hi/", htmlLang: "hi-IN", home: "होम", deals: "डील्स", seeOn: "{p} पर देखें", searchMore: "Intelligent Seller पर और खोजें", searchBtn: "खोजें", related: "और कैटेगरी", faqT: "अक्सर पूछे जाने वाले सवाल", win: "हमारे लिंक से हर ऑर्डर ₹1,000 नकद जीतने की एंट्री है।", note: "कीमत, स्टॉक और ऑफ़र प्लेटफ़ॉर्म तय करता है और बदल सकते हैं। पेमेंट से पहले प्लेटफ़ॉर्म पर जाँच लें। ये एफ़िलिएट लिंक हैं: आपके लिए बिना अतिरिक्त खर्च के हमें छोटा कमीशन मिल सकता है।", picked: "{n} चुने हुए प्रोडक्ट" },
  gu: { dir: "gu/", htmlLang: "gu-IN", home: "હોમ", deals: "ડીલ્સ", seeOn: "{p} પર જુઓ", searchMore: "Intelligent Seller પર વધુ શોધો", searchBtn: "શોધો", related: "વધુ કેટેગરી", faqT: "વારંવાર પૂછાતા પ્રશ્નો", win: "અમારી લિંકથી થતો દરેક ઓર્ડર ₹1,000 રોકડા જીતવાની એન્ટ્રી છે.", note: "કિંમત, સ્ટોક અને ઓફર પ્લેટફોર્મ નક્કી કરે છે અને બદલાઈ શકે. પેમેન્ટ પહેલા પ્લેટફોર્મ પર ચકાસો. આ એફિલિએટ લિંક છે: તમારા માટે વધારાના ખર્ચ વગર અમને નાનું કમિશન મળી શકે.", picked: "{n} પસંદ કરેલી પ્રોડક્ટ" }
};

export const CATEGORIES = [
  {
    slug: "palazzo-pants-trousers-for-women",
    match: ["palazzo", "trousers", "wide leg", "parachute"],
    q: "palazzo pants for women",
    en: {
      title: "Palazzo Pants & Wide Leg Trousers for Women – Best Deals Online India",
      desc: "Hand-picked palazzo pants and wide-leg trousers for women on Amazon.in: Korean style, high waist, cotton, parachute and office wear. Compare and buy, and win ₹1,000 cash.",
      h1: "Palazzo Pants & Wide Leg Trousers for Women",
      intro: "Looking for comfortable palazzo pants or wide-leg trousers? Here are our hand-picked picks on Amazon.in: Korean-style high-waist trousers, pleated palazzos with elastic waist, flowy drawstring pants for travel and parachute cargo pants with pockets. Good for office, college and casual wear.",
      faq: [["Which palazzo pants are best for office wear?", "High-waist, wide-leg trousers in cotton or cotton blend with a pleated front look neat for office. The SMOWKLY Korean-style trousers on this page are made for office and casual wear."], ["Are palazzo pants comfortable for daily wear?", "Yes. Palazzos with an elastic or drawstring waist and breathable fabric, like the KOTTY flowy trousers, are comfortable for all-day wear and travel."], ["Where can I buy palazzo pants online in India?", "You can buy them on Amazon.in through the links on this page. Payment, delivery and returns are handled by Amazon."]]
    },
    hi: {
      title: "महिलाओं के लिए पलाज़ो पैंट और वाइड लेग ट्राउज़र – बेस्ट ऑनलाइन डील्स",
      desc: "Amazon.in पर महिलाओं के लिए चुने हुए पलाज़ो पैंट और वाइड लेग ट्राउज़र: कोरियन स्टाइल, हाई वेस्ट, कॉटन, पैराशूट और ऑफ़िस वियर। तुलना करें, खरीदें और ₹1,000 नकद जीतें।",
      h1: "महिलाओं के लिए पलाज़ो पैंट और वाइड लेग ट्राउज़र",
      intro: "आरामदायक पलाज़ो पैंट या वाइड लेग ट्राउज़र ढूँढ रही हैं? Amazon.in पर हमारी चुनी हुई पसंद: कोरियन स्टाइल हाई वेस्ट ट्राउज़र, इलास्टिक वेस्ट वाले प्लीटेड पलाज़ो, ट्रैवल के लिए ड्रॉस्ट्रिंग वाले हल्के पैंट और पॉकेट वाले पैराशूट कार्गो पैंट। ऑफ़िस, कॉलेज और कैज़ुअल के लिए बढ़िया।",
      faq: [["ऑफ़िस के लिए कौन-से पलाज़ो पैंट अच्छे हैं?", "कॉटन या कॉटन ब्लेंड के हाई वेस्ट, वाइड लेग और प्लीटेड ट्राउज़र ऑफ़िस में अच्छे लगते हैं। इस पेज के SMOWKLY कोरियन स्टाइल ट्राउज़र ऑफ़िस और कैज़ुअल वियर के लिए हैं।"], ["क्या पलाज़ो पैंट रोज़ पहनने में आरामदायक हैं?", "हाँ। इलास्टिक या ड्रॉस्ट्रिंग वेस्ट और हवादार कपड़े वाले पलाज़ो, जैसे KOTTY फ़्लोई ट्राउज़र, पूरे दिन और ट्रैवल में आरामदायक हैं।"], ["भारत में पलाज़ो पैंट ऑनलाइन कहाँ से खरीदें?", "इस पेज के लिंक से Amazon.in पर खरीद सकते हैं। पेमेंट, डिलीवरी और रिटर्न Amazon संभालता है।"]]
    },
    gu: {
      title: "મહિલાઓ માટે પલાઝો પેન્ટ અને વાઇડ લેગ ટ્રાઉઝર – બેસ્ટ ઓનલાઇન ડીલ્સ",
      desc: "Amazon.in પર મહિલાઓ માટે પસંદ કરેલા પલાઝો પેન્ટ અને વાઇડ લેગ ટ્રાઉઝર: કોરિયન સ્ટાઇલ, હાઇ વેસ્ટ, કોટન, પેરાશૂટ અને ઓફિસ વેર. સરખાવો, ખરીદો અને ₹1,000 રોકડા જીતો.",
      h1: "મહિલાઓ માટે પલાઝો પેન્ટ અને વાઇડ લેગ ટ્રાઉઝર",
      intro: "આરામદાયક પલાઝો પેન્ટ કે વાઇડ લેગ ટ્રાઉઝર શોધો છો? Amazon.in પર અમારી પસંદગી: કોરિયન સ્ટાઇલ હાઇ વેસ્ટ ટ્રાઉઝર, ઇલાસ્ટિક વેસ્ટવાળા પ્લીટેડ પલાઝો, પ્રવાસ માટે ડ્રોસ્ટ્રિંગવાળા હળવા પેન્ટ અને ખિસ્સાવાળા પેરાશૂટ કાર્ગો પેન્ટ. ઓફિસ, કોલેજ અને રોજિંદા પહેરવા માટે સરસ.",
      faq: [["ઓફિસ માટે કયા પલાઝો પેન્ટ સારા?", "કોટન કે કોટન બ્લેન્ડના હાઇ વેસ્ટ, વાઇડ લેગ અને પ્લીટેડ ટ્રાઉઝર ઓફિસમાં સરસ લાગે છે. આ પેજ પરના SMOWKLY કોરિયન સ્ટાઇલ ટ્રાઉઝર ઓફિસ અને કેઝ્યુઅલ વેર માટે છે."], ["શું પલાઝો પેન્ટ રોજ પહેરવામાં આરામદાયક છે?", "હા. ઇલાસ્ટિક કે ડ્રોસ્ટ્રિંગ વેસ્ટ અને હવાદાર કાપડવાળા પલાઝો, જેમ કે KOTTY ફ્લોઇ ટ્રાઉઝર, આખો દિવસ અને પ્રવાસમાં આરામદાયક છે."], ["ભારતમાં પલાઝો પેન્ટ ઓનલાઇન ક્યાંથી ખરીદવા?", "આ પેજની લિંકથી Amazon.in પર ખરીદી શકો. પેમેન્ટ, ડિલિવરી અને રિટર્ન Amazon સંભાળે છે."]]
    }
  },
  {
    slug: "maxi-dress-for-women",
    match: ["maxi", "gown", "dress"],
    q: "maxi dress for women",
    en: {
      title: "Maxi Dress for Women – Party, Western & Indo-Western Gowns | Best Deals",
      desc: "Hand-picked maxi dresses and long gowns for women on Amazon.in: georgette party gowns, floral rayon maxis, A-line and indo-western dresses for New Year and parties. Win ₹1,000 cash.",
      h1: "Maxi Dresses & Long Gowns for Women",
      intro: "Find a maxi dress for parties, weddings, New Year or everyday wear. Our picks on Amazon.in include georgette fit-and-flare gowns, puff-sleeve V-neck maxis, floral rayon floor-length dresses and indo-western A-line gowns.",
      faq: [["Which maxi dress is good for a New Year party?", "A georgette fit-and-flare gown or a V-neck A-line maxi with puff sleeves looks elegant at parties. The LITZO and Shasmi dresses on this page are made as party outfits."], ["What is an indo-western maxi dress?", "It mixes an Indian ethnic look with a western gown cut, usually an A-line flared one-piece. The KZULLY dress on this page is an indo-western style."], ["Where can I buy maxi dresses online in India?", "Through the Amazon.in links on this page. Size, price and returns are shown on the Amazon product page."]]
    },
    hi: {
      title: "महिलाओं के लिए मैक्सी ड्रेस – पार्टी, वेस्टर्न और इंडो-वेस्टर्न गाउन | बेस्ट डील्स",
      desc: "Amazon.in पर महिलाओं के लिए चुनी हुई मैक्सी ड्रेस और लॉन्ग गाउन: जॉर्जेट पार्टी गाउन, फ़्लोरल रेयॉन मैक्सी, A-लाइन और इंडो-वेस्टर्न ड्रेस। ₹1,000 नकद जीतें।",
      h1: "महिलाओं के लिए मैक्सी ड्रेस और लॉन्ग गाउन",
      intro: "पार्टी, शादी, न्यू ईयर या रोज़ के लिए मैक्सी ड्रेस ढूँढें। Amazon.in पर हमारी पसंद: जॉर्जेट फ़िट-एंड-फ़्लेयर गाउन, पफ़ स्लीव V-नेक मैक्सी, फ़्लोरल रेयॉन फ़्लोर-लेंथ ड्रेस और इंडो-वेस्टर्न A-लाइन गाउन।",
      faq: [["न्यू ईयर पार्टी के लिए कौन-सी मैक्सी ड्रेस अच्छी है?", "जॉर्जेट फ़िट-एंड-फ़्लेयर गाउन या पफ़ स्लीव वाली V-नेक A-लाइन मैक्सी पार्टी में सुंदर लगती है। इस पेज की LITZO और Shasmi ड्रेस पार्टी आउटफ़िट के तौर पर बनी हैं।"], ["इंडो-वेस्टर्न मैक्सी ड्रेस क्या होती है?", "इसमें भारतीय एथनिक लुक और वेस्टर्न गाउन कट मिलते हैं, आमतौर पर A-लाइन फ़्लेयर्ड वन-पीस। इस पेज की KZULLY ड्रेस इंडो-वेस्टर्न स्टाइल है।"], ["भारत में मैक्सी ड्रेस ऑनलाइन कहाँ से खरीदें?", "इस पेज के Amazon.in लिंक से। साइज़, कीमत और रिटर्न Amazon प्रोडक्ट पेज पर दिखते हैं।"]]
    },
    gu: {
      title: "મહિલાઓ માટે મેક્સી ડ્રેસ – પાર્ટી, વેસ્ટર્ન અને ઇન્ડો-વેસ્ટર્ન ગાઉન | બેસ્ટ ડીલ્સ",
      desc: "Amazon.in પર મહિલાઓ માટે પસંદ કરેલા મેક્સી ડ્રેસ અને લોંગ ગાઉન: જ્યોર્જેટ પાર્ટી ગાઉન, ફ્લોરલ રેયોન મેક્સી, A-લાઇન અને ઇન્ડો-વેસ્ટર્ન ડ્રેસ. ₹1,000 રોકડા જીતો.",
      h1: "મહિલાઓ માટે મેક્સી ડ્રેસ અને લોંગ ગાઉન",
      intro: "પાર્ટી, લગ્ન, નવા વર્ષ કે રોજ માટે મેક્સી ડ્રેસ શોધો. Amazon.in પર અમારી પસંદગી: જ્યોર્જેટ ફિટ-એન્ડ-ફ્લેર ગાઉન, પફ સ્લીવ V-નેક મેક્સી, ફ્લોરલ રેયોન ફ્લોર-લેન્થ ડ્રેસ અને ઇન્ડો-વેસ્ટર્ન A-લાઇન ગાઉન.",
      faq: [["નવા વર્ષની પાર્ટી માટે કયો મેક્સી ડ્રેસ સારો?", "જ્યોર્જેટ ફિટ-એન્ડ-ફ્લેર ગાઉન કે પફ સ્લીવવાળો V-નેક A-લાઇન મેક્સી પાર્ટીમાં સુંદર લાગે છે. આ પેજ પરના LITZO અને Shasmi ડ્રેસ પાર્ટી આઉટફિટ તરીકે બનેલા છે."], ["ઇન્ડો-વેસ્ટર્ન મેક્સી ડ્રેસ એટલે શું?", "તેમાં ભારતીય એથનિક લુક અને વેસ્ટર્ન ગાઉન કટ ભેગા થાય છે, સામાન્ય રીતે A-લાઇન ફ્લેર્ડ વન-પીસ. આ પેજ પરનો KZULLY ડ્રેસ ઇન્ડો-વેસ્ટર્ન સ્ટાઇલ છે."], ["ભારતમાં મેક્સી ડ્રેસ ઓનલાઇન ક્યાંથી ખરીદવા?", "આ પેજની Amazon.in લિંકથી. સાઇઝ, કિંમત અને રિટર્ન Amazon પ્રોડક્ટ પેજ પર દેખાય છે."]]
    }
  },
  {
    slug: "co-ord-set-for-women",
    match: ["co-ord", "coord"],
    q: "co-ord set for women",
    en: {
      title: "Co-Ord Sets for Women – Ethnic, Printed & Lounge Two-Piece Sets | Best Deals",
      desc: "Hand-picked co-ord sets for women on Amazon.in: ethnic-look sets and printed rayon shirt and pant sets for casual and lounge wear. Win ₹1,000 cash.",
      h1: "Co-Ord Sets for Women",
      intro: "A co-ord set is a matching top and bottom that makes an outfit in one go. Our picks on Amazon.in include an ethnic-look co-ord set and a printed rayon shirt-and-pant set for casual, lounge and western wear.",
      faq: [["What is a co-ord set?", "A co-ord (coordinated) set is a matching two-piece outfit, usually a top or shirt with pants, made in the same fabric or print."], ["Is a rayon co-ord set good for summer?", "Rayon is light and breathable, so a rayon co-ord set like the NAINVISH set on this page is comfortable in warm weather."], ["Where can I buy co-ord sets online in India?", "Through the Amazon.in links on this page."]]
    },
    hi: {
      title: "महिलाओं के लिए को-ऑर्ड सेट – एथनिक, प्रिंटेड और लाउंज टू-पीस सेट | बेस्ट डील्स",
      desc: "Amazon.in पर महिलाओं के लिए चुने हुए को-ऑर्ड सेट: एथनिक लुक सेट और प्रिंटेड रेयॉन शर्ट-पैंट सेट, कैज़ुअल और लाउंज वियर के लिए। ₹1,000 नकद जीतें।",
      h1: "महिलाओं के लिए को-ऑर्ड सेट",
      intro: "को-ऑर्ड सेट यानी मैचिंग टॉप और बॉटम, जिससे एक बार में पूरा आउटफ़िट बन जाता है। Amazon.in पर हमारी पसंद: एथनिक लुक को-ऑर्ड सेट और कैज़ुअल, लाउंज और वेस्टर्न वियर के लिए प्रिंटेड रेयॉन शर्ट-पैंट सेट।",
      faq: [["को-ऑर्ड सेट क्या होता है?", "को-ऑर्ड (कोऑर्डिनेटेड) सेट एक मैचिंग टू-पीस आउटफ़िट है, आमतौर पर एक ही कपड़े या प्रिंट का टॉप या शर्ट और पैंट।"], ["क्या रेयॉन को-ऑर्ड सेट गर्मी में अच्छा है?", "रेयॉन हल्का और हवादार होता है, इसलिए इस पेज का NAINVISH जैसा रेयॉन को-ऑर्ड सेट गर्मी में आरामदायक है।"], ["भारत में को-ऑर्ड सेट ऑनलाइन कहाँ से खरीदें?", "इस पेज के Amazon.in लिंक से।"]]
    },
    gu: {
      title: "મહિલાઓ માટે કો-ઓર્ડ સેટ – એથનિક, પ્રિન્ટેડ અને લાઉન્જ ટુ-પીસ સેટ | બેસ્ટ ડીલ્સ",
      desc: "Amazon.in પર મહિલાઓ માટે પસંદ કરેલા કો-ઓર્ડ સેટ: એથનિક લુક સેટ અને પ્રિન્ટેડ રેયોન શર્ટ-પેન્ટ સેટ, કેઝ્યુઅલ અને લાઉન્જ વેર માટે. ₹1,000 રોકડા જીતો.",
      h1: "મહિલાઓ માટે કો-ઓર્ડ સેટ",
      intro: "કો-ઓર્ડ સેટ એટલે મેચિંગ ટોપ અને બોટમ, જેથી એક જ વારમાં આખો આઉટફિટ તૈયાર. Amazon.in પર અમારી પસંદગી: એથનિક લુક કો-ઓર્ડ સેટ અને કેઝ્યુઅલ, લાઉન્જ અને વેસ્ટર્ન વેર માટે પ્રિન્ટેડ રેયોન શર્ટ-પેન્ટ સેટ.",
      faq: [["કો-ઓર્ડ સેટ એટલે શું?", "કો-ઓર્ડ (કોઓર્ડિનેટેડ) સેટ એક મેચિંગ ટુ-પીસ આઉટફિટ છે, સામાન્ય રીતે એક જ કાપડ કે પ્રિન્ટનું ટોપ કે શર્ટ અને પેન્ટ."], ["શું રેયોન કો-ઓર્ડ સેટ ઉનાળામાં સારો?", "રેયોન હળવું અને હવાદાર હોય છે, એટલે આ પેજ પરનો NAINVISH જેવો રેયોન કો-ઓર્ડ સેટ ગરમીમાં આરામદાયક છે."], ["ભારતમાં કો-ઓર્ડ સેટ ઓનલાઇન ક્યાંથી ખરીદવા?", "આ પેજની Amazon.in લિંકથી."]]
    }
  },
  {
    slug: "makeup-pouch-bag",
    match: ["makeup", "pouch", "cosmetic"],
    q: "makeup pouch bag",
    en: {
      title: "Makeup Pouch Bag – Large Travel Cosmetic & Toiletry Organizer | Best Deals",
      desc: "Hand-picked makeup pouch bag on Amazon.in: large-capacity waterproof leather cosmetic and toiletry organizer with handle and dividers for travel. Win ₹1,000 cash.",
      h1: "Makeup Pouch & Travel Cosmetic Bag",
      intro: "Keep makeup, skincare and toiletries organised at home and on trips. Our pick on Amazon.in is a large-capacity leather makeup pouch with dividers, a handle and a waterproof finish.",
      faq: [["What should I look for in a travel makeup bag?", "Enough space with dividers, a waterproof material that is easy to wipe, and a handle or sturdy zip. The LUMONY pouch on this page has all three."], ["Can a makeup pouch hold toiletries too?", "A large-capacity organizer with dividers can hold toiletries along with makeup, which is handy for travel."], ["Where can I buy a makeup pouch online in India?", "Through the Amazon.in link on this page."]]
    },
    hi: {
      title: "मेकअप पाउच बैग – बड़ा ट्रैवल कॉस्मेटिक और टॉयलेटरी ऑर्गनाइज़र | बेस्ट डील्स",
      desc: "Amazon.in पर चुना हुआ मेकअप पाउच बैग: बड़ी क्षमता वाला वॉटरप्रूफ़ लेदर कॉस्मेटिक और टॉयलेटरी ऑर्गनाइज़र, हैंडल और डिवाइडर के साथ। ₹1,000 नकद जीतें।",
      h1: "मेकअप पाउच और ट्रैवल कॉस्मेटिक बैग",
      intro: "मेकअप, स्किनकेयर और टॉयलेटरी घर और सफ़र में व्यवस्थित रखें। Amazon.in पर हमारी पसंद: डिवाइडर, हैंडल और वॉटरप्रूफ़ फ़िनिश वाला बड़ा लेदर मेकअप पाउच।",
      faq: [["ट्रैवल मेकअप बैग में क्या देखें?", "डिवाइडर के साथ पर्याप्त जगह, आसानी से साफ़ होने वाला वॉटरप्रूफ़ मटीरियल और हैंडल या मज़बूत ज़िप। इस पेज के LUMONY पाउच में तीनों हैं।"], ["क्या मेकअप पाउच में टॉयलेटरी भी रख सकते हैं?", "डिवाइडर वाले बड़े ऑर्गनाइज़र में मेकअप के साथ टॉयलेटरी भी आ जाती है, जो सफ़र में काम आता है।"], ["भारत में मेकअप पाउच ऑनलाइन कहाँ से खरीदें?", "इस पेज के Amazon.in लिंक से।"]]
    },
    gu: {
      title: "મેકઅપ પાઉચ બેગ – મોટી ટ્રાવેલ કોસ્મેટિક અને ટોઇલેટરી ઓર્ગેનાઇઝર | બેસ્ટ ડીલ્સ",
      desc: "Amazon.in પર પસંદ કરેલી મેકઅપ પાઉચ બેગ: મોટી ક્ષમતાવાળી વોટરપ્રૂફ લેધર કોસ્મેટિક અને ટોઇલેટરી ઓર્ગેનાઇઝર, હેન્ડલ અને ડિવાઇડર સાથે. ₹1,000 રોકડા જીતો.",
      h1: "મેકઅપ પાઉચ અને ટ્રાવેલ કોસ્મેટિક બેગ",
      intro: "મેકઅપ, સ્કિનકેર અને ટોઇલેટરી ઘરે અને પ્રવાસમાં વ્યવસ્થિત રાખો. Amazon.in પર અમારી પસંદગી: ડિવાઇડર, હેન્ડલ અને વોટરપ્રૂફ ફિનિશવાળું મોટું લેધર મેકઅપ પાઉચ.",
      faq: [["ટ્રાવેલ મેકઅપ બેગમાં શું જોવું?", "ડિવાઇડર સાથે પૂરતી જગ્યા, સહેલાઈથી સાફ થાય તેવું વોટરપ્રૂફ મટીરિયલ અને હેન્ડલ કે મજબૂત ઝિપ. આ પેજ પરના LUMONY પાઉચમાં ત્રણેય છે."], ["શું મેકઅપ પાઉચમાં ટોઇલેટરી પણ રાખી શકાય?", "ડિવાઇડરવાળા મોટા ઓર્ગેનાઇઝરમાં મેકઅપ સાથે ટોઇલેટરી પણ આવી જાય, જે પ્રવાસમાં કામ આવે."], ["ભારતમાં મેકઅપ પાઉચ ઓનલાઇન ક્યાંથી ખરીદવું?", "આ પેજની Amazon.in લિંકથી."]]
    }
  }
];
