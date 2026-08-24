export type LanguageCode = 'en' | 'hi' | 'mr'

export interface LanguageInfo {
  code: LanguageCode
  name: string
  nativeName: string
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
]

export const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Navigation
    nav_home: 'Home',
    nav_plants: 'Plants',
    nav_seeds: 'Seeds',
    nav_flowers: 'Flowers',
    nav_fertilizers: 'Fertilizers',
    nav_pots: 'Pots',
    nav_kits: 'Customized Kits',
    nav_services: 'Services',
    nav_cart: 'Cart',
    nav_profile: 'Profile',
    nav_green_index: 'PHYTO GREEN INDEX',
    nav_language: 'Language',
    nav_location: 'Location',
    nav_logout: 'Sign Out',
    nav_login: 'Sign In',

    // Ecosystem
    ecosystem_title: 'Join the Plant Ecosystem',
    ecosystem_subtitle: 'Connecting Customers, Local Nurseries, Gardeners & Delivery Fleets',
    role_customer: 'Customer',
    role_nursery: 'Nursery Partner',
    role_gardener: 'Plant Doctor / Gardener',
    role_delivery: 'Delivery Partner',

    // Search & Filter
    search_placeholder: 'Search plants, seeds, flowers, care guides, pots...',
    search_button: 'Search',
    quick_filter_title: 'Filter by Need:',
    filter_space: 'Available Space',
    filter_light: 'Sunlight Exposure',
    filter_water: 'Water Requirement',
    filter_maintenance: 'Maintenance Effort',
    filter_purpose: 'Plant Purpose',
    filter_budget: 'Budget / Price Range',
    filter_pet_friendly: 'Pet-Friendly Only',
    filter_beginner: 'Beginner-Friendly Only',
    filter_clear: 'Clear Filters',
    filter_view_matches: 'View Matching Plants',

    // Categories
    cat_all: 'All Categories',
    cat_plants: 'Living Plants',
    cat_seeds: 'Seeds',
    cat_flowers: 'Flowers',
    cat_fertilizers: 'Fertilizers & Soil',
    cat_pots: 'Pots & Planters',

    // Recommendations
    rec_title: 'Personalized Botanical Recommendations',
    rec_subtitle: 'Multi-factor evaluation tailored to your space, lighting & preferences.',
    rec_best_match: 'Best Match for You',
    rec_match_score: 'Match',
    rec_low_maintenance: 'Low Maintenance',
    rec_low_light: 'Low Light',
    rec_indoor: 'Indoor Space',
    rec_budget_match: 'Budget Match',

    // PHYTO GREEN INDEX
    gi_title: 'PHYTO GREEN INDEX',
    gi_badge: 'Sustainability Score',
    gi_progress_label: 'to Green Champion',
    gi_points_earned: 'Points Earned',
    gi_rewards_unlocked: 'Milestone Rewards Unlocked',
    gi_claim_certificate: 'Download Green Certificate',
    gi_claim_voucher: 'Apply 25% Off Voucher',
    gi_claim_seed: 'Claim Free Heirloom Seeds',

    // Quotes
    quote_1: 'A greener home begins with a single plant.',
    quote_2: 'Grow where you are planted.',
    quote_3: 'Small plants, big impact on our planet.',
    quote_4: 'Sustainability starts right at home.',
    quote_5: 'To plant a garden is to believe in tomorrow.',
    quote_6: 'Plants give us oxygen for the lungs and for the soul.',

    // Buttons & Actions
    btn_add_to_cart: 'Add to Cart',
    btn_added: 'Added to Cart',
    btn_details: 'View Details',
    btn_build_kit: 'Build Custom Kit',
    btn_book_doctor: 'Book Plant Doctor',
    btn_checkout: 'Proceed to Checkout',
    btn_continue_shopping: 'Continue Shopping',
  },

  hi: {
    // Navigation
    nav_home: 'होम',
    nav_plants: 'पौधे (Plants)',
    nav_seeds: 'बीज (Seeds)',
    nav_flowers: 'फूल (Flowers)',
    nav_fertilizers: 'खाद (Fertilizers)',
    nav_pots: 'गमले (Pots)',
    nav_kits: 'कस्टमाइज्ड किट',
    nav_services: 'सेवाएं (Services)',
    nav_cart: 'कार्ट',
    nav_profile: 'प्रोफाइल',
    nav_green_index: 'फाइटो ग्रीन इंडेक्स',
    nav_language: 'भाषा (Language)',
    nav_location: 'स्थान (Location)',
    nav_logout: 'लॉग आउट',
    nav_login: 'साइन इन',

    // Ecosystem
    ecosystem_title: 'पादप पारिस्थितिकी तंत्र (Ecosystem) से जुड़ें',
    ecosystem_subtitle: 'ग्राहक, स्थानीय नर्सरी, माली और डिलीवरी पार्टनर्स का संगम',
    role_customer: 'ग्राहक (Customer)',
    role_nursery: 'नर्सरी पार्टनर',
    role_gardener: 'प्लांट डॉक्टर / माली',
    role_delivery: 'डिलीवरी पार्टनर',

    // Search & Filter
    search_placeholder: 'पौधे, बीज, फूल, देखभाल गाइड और गमले खोजें...',
    search_button: 'खोजें',
    quick_filter_title: 'अपनी आवश्यकता अनुसार चुनें:',
    filter_space: 'घर में स्थान (Space)',
    filter_light: 'धूप का स्तर (Sunlight)',
    filter_water: 'पानी की आवश्यकता (Water)',
    filter_maintenance: 'देखभाल का स्तर (Maintenance)',
    filter_purpose: 'पौधे का उद्देश्य',
    filter_budget: 'बजट / मूल्य सीमा',
    filter_pet_friendly: 'पालतू जानवरों के लिए सुरक्षित (Pet-Safe)',
    filter_beginner: 'शुरुआती लोगों के लिए आसान',
    filter_clear: 'फिल्टर हटाएं',
    filter_view_matches: 'अनुरूप पौधे देखें',

    // Categories
    cat_all: 'सभी श्रेणियां',
    cat_plants: 'पौधे',
    cat_seeds: 'बीज',
    cat_flowers: 'फूल',
    cat_fertilizers: 'जैविक खाद',
    cat_pots: 'गमले और प्लांटर्स',

    // Recommendations
    rec_title: 'आपके लिए व्यक्तिगत सुझाव (Recommendations)',
    rec_subtitle: 'आपके स्थान, धूप और प्राथमिकताओं के आधार पर बहु-कारक मूल्यांकन।',
    rec_best_match: 'आपके लिए सर्वश्रेष्ठ मेल',
    rec_match_score: 'मेल (Match)',
    rec_low_maintenance: 'कम देखभाल',
    rec_low_light: 'कम धूप में सक्षम',
    rec_indoor: 'घर के भीतर',
    rec_budget_match: 'बजट अनुकूल',

    // PHYTO GREEN INDEX
    gi_title: 'फाइटो ग्रीन इंडेक्स',
    gi_badge: 'पर्यावरण स्कोर',
    gi_progress_label: 'ग्रीन चैंपियन बनने की प्रगति',
    gi_points_earned: 'अर्जित अंक (Green Points)',
    gi_rewards_unlocked: 'उपलब्धि पुरस्कार अनलॉक',
    gi_claim_certificate: 'ग्रीन चैंपियन प्रमाण पत्र डाउनलोड करें',
    gi_claim_voucher: '25% छूट वाउचर लागू करें',
    gi_claim_seed: 'मुफ्त दुर्लभ बीज प्राप्त करें',

    // Quotes
    quote_1: 'एक हरियाली भरा घर एक पौधे से शुरू होता है।',
    quote_2: 'जहां आप हैं, वहीं विकसित हों और खिलें।',
    quote_3: 'छोटे पौधे, हमारी पृथ्वी पर बड़ा प्रभाव।',
    quote_4: 'स्थिरता और पर्यावरण सुरक्षा घर से ही शुरू होती है।',
    quote_5: 'बगीचा लगाना कल के बेहतर भविष्य में विश्वास रखना है।',
    quote_6: 'पौधे हमें फेफड़ों के लिए ऑक्सीजन और आत्मा के लिए शांति देते हैं।',

    // Buttons & Actions
    btn_add_to_cart: 'कार्ट में जोड़ें',
    btn_added: 'जोड़ दिया गया',
    btn_details: 'विवरण देखें',
    btn_build_kit: 'कस्टम किट बनाएं',
    btn_book_doctor: 'प्लांट डॉक्टर बुक करें',
    btn_checkout: 'चेकआउट करें',
    btn_continue_shopping: 'खरीदारी जारी रखें',
  },

  mr: {
    // Navigation
    nav_home: 'मुख्यपृष्ठ (Home)',
    nav_plants: 'झाडे व रोपे (Plants)',
    nav_seeds: 'बियाणे (Seeds)',
    nav_flowers: 'फुले (Flowers)',
    nav_fertilizers: 'सेंद्रिय खते (Fertilizers)',
    nav_pots: 'कुंड्या (Pots)',
    nav_kits: 'कस्टमाइज्ड किट्स',
    nav_services: 'सेवा (Services)',
    nav_cart: 'कार्ट (Cart)',
    nav_profile: 'माझे प्रोफाइल',
    nav_green_index: 'फायटो ग्रीन इंडेक्स',
    nav_language: 'भाषा निवडा',
    nav_location: 'स्थान (Location)',
    nav_logout: 'लॉग आउट',
    nav_login: 'साइन इन करा',

    // Ecosystem
    ecosystem_title: 'हरित परिसंस्थेत (Plant Ecosystem) सहभागी व्हा',
    ecosystem_subtitle: 'ग्राहक, स्थानिक रोपवाटिका (Nurseries), माळी व वितरण भागीदार',
    role_customer: 'ग्राहक (Customer)',
    role_nursery: 'रोपवाटिका भागीदार (Nursery)',
    role_gardener: 'प्लांट डॉक्टर / माळी (Gardener)',
    role_delivery: 'वितरण भागीदार (Delivery)',

    // Search & Filter
    search_placeholder: 'रोपे, बियाणे, फुले, सेंद्रिय खते व कुंड्या शोधा...',
    search_button: 'शोधा',
    quick_filter_title: 'गरजेनुसार झटपट फिल्टर:',
    filter_space: 'घरातील जागा (Space)',
    filter_light: 'सूर्यप्रकाशाची गरज (Sunlight)',
    filter_water: 'पाण्याची आवश्यकता',
    filter_maintenance: 'देखभालीचा स्तर',
    filter_purpose: 'झाडाचा उद्देश',
    filter_budget: 'बजेट / किंमत',
    filter_pet_friendly: 'प्राण्यांसाठी सुरक्षित (Pet-Friendly)',
    filter_beginner: 'सुरुवातीसाठी सोपे',
    filter_clear: 'फिल्टर काढा',
    filter_view_matches: 'अनुरूप रोपे पहा',

    // Categories
    cat_all: 'सर्व प्रकार',
    cat_plants: 'झाडे व रोपे',
    cat_seeds: 'सेंद्रिय बियाणे',
    cat_flowers: 'सुगंधी फुले',
    cat_fertilizers: 'सेंद्रिय खते',
    cat_pots: 'सुंदर कुंड्या',

    // Recommendations
    rec_title: 'तुमच्या जागेसाठी योग्य शिफारसी (Recommendations)',
    rec_subtitle: 'जागा, सूर्यप्रकाश व आवडीनुसार बहु-घटक मूल्यांकन.',
    rec_best_match: 'तुमच्यासाठी सर्वोत्कृष्ट निवड',
    rec_match_score: 'जुळणी (Match)',
    rec_low_maintenance: 'कमी देखभाल',
    rec_low_light: 'कमी प्रकाशात सक्षम',
    rec_indoor: 'घराच्या आत',
    rec_budget_match: 'बजेट अनुकूल',

    // PHYTO GREEN INDEX
    gi_title: 'फायटो ग्रीन इंडेक्स',
    gi_badge: 'पर्यावरण गुण (Green Points)',
    gi_progress_label: 'ग्रीन चॅम्पियन होण्याकडे प्रगती',
    gi_points_earned: 'कमावलेले गुण (Points)',
    gi_rewards_unlocked: 'विशेषाधिकार पुरस्कार अनलॉक',
    gi_claim_certificate: 'डिजिटल हरित प्रमाणपत्र डाउनलोड करा',
    gi_claim_voucher: '25% सवलत व्हाउचर वापरा',
    gi_claim_seed: 'मोफत दुर्मिळ बियाणे मिळवा',

    // Quotes
    quote_1: 'एक छोटे रोपटे तुमच्या घरात मोठा आनंद आणते.',
    quote_2: 'निसर्गाच्या सान्निध्यात घर अधिक सुंदर बनते.',
    quote_3: 'प्रत्येक रोपटे एका सुंदर व हिरव्या उद्यानाची सुरुवात असते.',
    quote_4: 'शाश्वत जीवनशैलीची सुरुवात स्वतःच्या घरापासून होते.',
    quote_5: 'झाड लावणे म्हणजे उद्याच्या सुंदर भविष्यावर विश्वास ठेवणे.',
    quote_6: 'झाडे शरीराला ऑक्सिजन आणि मनाला शांतता देतात.',

    // Buttons & Actions
    btn_add_to_cart: 'कार्टमध्ये टाका',
    btn_added: 'जोडले गेले',
    btn_details: 'तपशील पहा',
    btn_build_kit: 'कस्टम किट बनवा',
    btn_book_doctor: 'तज्ज्ञ माळी बुक करा',
    btn_checkout: 'ऑर्डर पूर्ण करा',
    btn_continue_shopping: 'खरेदी सुरू ठेवा',
  },
}
