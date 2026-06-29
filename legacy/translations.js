/* ===================================================================
   زمانەکان (i18n) — کوردی سۆرانی / English / عربی عێراقی
   هەموو دەقەکانی ناوبەری ماڵپەڕ لێرە کۆکراونەتەوە. بۆ گۆڕینی زمان
   تەنها دوگمەکانی ناوبار بەکاربهێنە. ئەم فایلە لە index.html و
   login.html هەردووکیان بەکاردێت.
   =================================================================== */

const I18N = {
  /* ---------- کوردی سۆرانی (بنەڕەت) ---------- */
  ckb: {
    dir: "rtl",
    label: "کوردی",

    /* navbar */
    nav_weather: "کەشوهەوا ▾",
    nav_map: "نەخشە ▾",
    nav_lang: "🌐 زمان ▾",
    weather_wait: "چاوەڕێ بکە...",
    logout: "چوونەدەرەوە",

    /* hero / header */
    hero_title: "🏨 هۆتێلەکانی کوردستان",
    hero_sub: "باشترین هۆتێلەکان لە کوردستان",
    hero_cta: "هۆتێل بدۆزەرەوە",
    darkmode: "🌙 دۆخی تاریک",
    darkmode_light: "☀️ دۆخی ڕووناک",

    /* search */
    search_ph: "🔍 گەڕان بەدوای هۆتێل...",
    search_btn: "گەڕان",

    /* city filter */
    city_all: "هەموو",
    city_sulaymaniyah: "سلێمانی",
    city_erbil: "هەولێر",
    city_duhok: "دهۆک",
    city_halabja: "هەڵەبجە",
    city_kirkuk: "کەرکوک",

    /* price + sort + count */
    price_label: "نرخی زۆرترین:",
    sort_price: "💰 ڕیزکردن بە نرخ (هەرزان → گران)",
    hotels_found: "هۆتێل دۆزرایەوە",
    no_results: "هیچ هۆتێلێک نەدۆزرایەوە 😔",

    /* hotel card */
    per_night: "شەو",
    available_rooms: "ژووری بەردەست",
    book: "حیجزکردن",
    more_info: "زانیاری زیاتر",

    /* contact form */
    contact_title: "پەیوەندیمان پێوە بکە",
    contact_name: "ناوت",
    contact_email: "ئیمەیلت",
    contact_message: "نامەکەت",
    contact_send: "ناردن",
    contact_required: "تکایە هەموو خانەکان پڕبکەرەوە",
    contact_ok: "سوپاس! نامەکەت نێردرا ✅",
    contact_err: "هەڵەیەك ڕوویدا، تکایە دووبارە هەوڵبدەرەوە",

    /* footer */
    footer_about_title: "🏨 هۆتێلەکانی کوردستان",
    footer_about_text: "باشترین پلاتفۆڕم بۆ دۆزینەوەی هۆتێل لە کوردستان",
    footer_contact_title: "📞 پەیوەندی",
    footer_social_title: "🌐 سۆشیاڵ میدیا",
    footer_bottom: "© 2026 - دروستکراوە لەلایەن محەممەد ⚡",

    /* booking modal */
    modal_title: "حیجزکردنی ژوور",
    modal_name: "ناوی تەواو",
    modal_phone: "ژمارەی تەلەفۆن",
    modal_checkin: "بەرواری چوونەژوورەوە:",
    modal_nights: "ژمارەی شەوەکان",
    modal_roomtype: "جۆری ژوور:",
    modal_select_room: "-- جۆری ژوور هەڵبژێرە --",
    modal_confirm: "پشتڕاستکردنەوەی حیجز",
    modal_hotel_prefix: "هۆتێل:",
    price_for_night: "نرخ: {p}$ بۆ شەوێک",
    booking_required: "تکایە هەموو خانەکان پڕبکەرەوە",
    booking_ok: "حیجزکرا! ژووری ماوە:",
    booking_full: "ببورە، هیچ ژوورێك نەماوە",
    booking_err: "هەڵەیەك ڕوویدا:",

    /* login */
    login_brand: "هۆتێلەکانی کوردستان",
    login_welcome: "بەخێربێیتەوە 👋",
    login_subtitle: "بچۆ ژوورەوە بۆ بینینی هۆتێلەکان",
    login_user: "ناوی بەکارهێنەر",
    login_pass: "وشەی نهێنی",
    login_btn: "چوونەژوورەوە",
    login_hint: "تاقیکردنەوە — ناو: admin | وشەی نهێنی: 1234",
    login_error: "ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە ❌",
    back_to_top: "بڕۆ سەرەوە"
  },

  /* ---------- English ---------- */
  en: {
    dir: "ltr",
    label: "English",

    nav_weather: "Weather ▾",
    nav_map: "Map ▾",
    nav_lang: "🌐 Language ▾",
    weather_wait: "Please wait...",
    logout: "Log out",

    hero_title: "🏨 Kurdistan Hotels",
    hero_sub: "The best hotels in Kurdistan",
    hero_cta: "Find a hotel",
    darkmode: "🌙 Dark Mode",
    darkmode_light: "☀️ Light Mode",

    search_ph: "🔍 Search for a hotel...",
    search_btn: "Search",

    city_all: "All",
    city_sulaymaniyah: "Sulaymaniyah",
    city_erbil: "Erbil",
    city_duhok: "Duhok",
    city_halabja: "Halabja",
    city_kirkuk: "Kirkuk",

    price_label: "Max price:",
    sort_price: "💰 Sort by price (low → high)",
    hotels_found: "hotels found",
    no_results: "No hotels found 😔",

    per_night: "night",
    available_rooms: "Available rooms",
    book: "Book now",
    more_info: "More info",

    contact_title: "Contact us",
    contact_name: "Your name",
    contact_email: "Your email",
    contact_message: "Your message",
    contact_send: "Send",
    contact_required: "Please fill in all fields",
    contact_ok: "Thank you! Your message was sent ✅",
    contact_err: "Something went wrong, please try again",

    footer_about_title: "🏨 Kurdistan Hotels",
    footer_about_text: "The best platform to find hotels in Kurdistan",
    footer_contact_title: "📞 Contact",
    footer_social_title: "🌐 Social media",
    footer_bottom: "© 2026 - Made by Muhammad ⚡",

    modal_title: "Book a room",
    modal_name: "Full name",
    modal_phone: "Phone number",
    modal_checkin: "Check-in date:",
    modal_nights: "Number of nights",
    modal_roomtype: "Room type:",
    modal_select_room: "-- Choose a room type --",
    modal_confirm: "Confirm booking",
    modal_hotel_prefix: "Hotel:",
    price_for_night: "Price: ${p} per night",
    booking_required: "Please fill in all fields",
    booking_ok: "Booked! Rooms left:",
    booking_full: "Sorry, no rooms left",
    booking_err: "An error occurred:",

    login_brand: "Kurdistan Hotels",
    login_welcome: "Welcome back 👋",
    login_subtitle: "Log in to explore the hotels",
    login_user: "Username",
    login_pass: "Password",
    login_btn: "Log in",
    login_hint: "Test — user: admin | password: 1234",
    login_error: "Wrong username or password ❌",
    back_to_top: "Back to top"
  },

  /* ---------- عربی عێراقی (Iraqi Arabic) ---------- */
  ar: {
    dir: "rtl",
    label: "العراقي",

    nav_weather: "الطقس ▾",
    nav_map: "الخريطة ▾",
    nav_lang: "🌐 اللغة ▾",
    weather_wait: "انتظر شوية...",
    logout: "خروج",

    hero_title: "🏨 فنادق كردستان",
    hero_sub: "أحسن الفنادق بكردستان",
    hero_cta: "دوّر على فندق",
    darkmode: "🌙 الوضع الليلي",
    darkmode_light: "☀️ الوضع النهاري",

    search_ph: "🔍 دوّر على فندق...",
    search_btn: "دوّر",

    city_all: "الكل",
    city_sulaymaniyah: "السليمانية",
    city_erbil: "أربيل",
    city_duhok: "دهوك",
    city_halabja: "حلبجة",
    city_kirkuk: "كركوك",

    price_label: "أعلى سعر:",
    sort_price: "💰 رتّب حسب السعر (أرخص → أغلى)",
    hotels_found: "فندق متوفر",
    no_results: "ماكو ولا فندق 😔",

    per_night: "ليلة",
    available_rooms: "غرف متوفرة",
    book: "احجز",
    more_info: "تفاصيل أكثر",

    contact_title: "تواصل ويانا",
    contact_name: "اسمك",
    contact_email: "إيميلك",
    contact_message: "رسالتك",
    contact_send: "إرسال",
    contact_required: "رجاءً عبّي كل الخانات",
    contact_ok: "شكراً! وصلت رسالتك ✅",
    contact_err: "صار خطأ، جرّب مرة لخ",

    footer_about_title: "🏨 فنادق كردستان",
    footer_about_text: "أحسن منصة للقاء الفنادق بكردستان",
    footer_contact_title: "📞 تواصل",
    footer_social_title: "🌐 السوشيال ميديا",
    footer_bottom: "© 2026 - سوّاها محمد ⚡",

    modal_title: "حجز غرفة",
    modal_name: "الاسم الكامل",
    modal_phone: "رقم التلفون",
    modal_checkin: "تاريخ الدخول:",
    modal_nights: "عدد الليالي",
    modal_roomtype: "نوع الغرفة:",
    modal_select_room: "-- اختر نوع الغرفة --",
    modal_confirm: "أكّد الحجز",
    modal_hotel_prefix: "الفندق:",
    price_for_night: "السعر: {p}$ لليلة",
    booking_required: "رجاءً عبّي كل الخانات",
    booking_ok: "تم الحجز! الغرف الباقية:",
    booking_full: "آسفين، ماكو غرف باقية",
    booking_err: "صار خطأ:",

    login_brand: "فنادق كردستان",
    login_welcome: "أهلاً بيك 👋",
    login_subtitle: "سجّل دخول حتى تشوف الفنادق",
    login_user: "اسم المستخدم",
    login_pass: "كلمة السر",
    login_btn: "دخول",
    login_hint: "تجربة — المستخدم: admin | كلمة السر: 1234",
    login_error: "اسم المستخدم أو كلمة السر غلط ❌",
    back_to_top: "ارجع فوق"
  }
};

/* ===================================================================
   ئەنجن — currentLang، t()، و applyLanguage()
   =================================================================== */
let currentLang = localStorage.getItem("lang") || "ckb";
if (!I18N[currentLang]) currentLang = "ckb";

/* وەرگێڕانی یەک کلیل بۆ زمانی ئێستا (پاشەکەوت بۆ کوردی ئەگەر نەدۆزرایەوە) */
function t(key) {
  const pack = I18N[currentLang] || I18N.ckb;
  if (pack[key] != null) return pack[key];
  if (I18N.ckb[key] != null) return I18N.ckb[key];
  return key;
}

/* جێبەجێکردنی زمان لەسەر تەواوی پەڕە */
function applyLanguage(lang) {
  if (!I18N[lang]) lang = "ckb";
  currentLang = lang;
  localStorage.setItem("lang", lang);

  const meta = I18N[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = meta.dir;
  document.body && (document.body.dir = meta.dir);

  /* دەقی ناو ئێلێمێنتەکان */
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    el.textContent = t(el.getAttribute("data-i18n"));
  });

  /* placeholderی input و textarea */
  document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
  });

  /* title attribute (بۆ tooltip) */
  document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
    el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
  });

  /* دیارکردنی دوگمەی زمانی هەڵبژێردراو */
  document.querySelectorAll("[data-lang]").forEach(function (btn) {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
  });

  /* ئاگادارکردنەوەی ئەو بەشانەی بە JavaScript دروستدەبن (کارتی هۆتێل و...) */
  window.dispatchEvent(new CustomEvent("languagechange", { detail: { lang: lang } }));
}

/* بەردەستکردن بۆ هەموو فایلەکان */
window.t = t;
window.applyLanguage = applyLanguage;
window.getLang = function () { return currentLang; };

/* جێبەجێکردن کاتی بارکردنی پەڕە */
document.addEventListener("DOMContentLoaded", function () {
  applyLanguage(currentLang);
});
