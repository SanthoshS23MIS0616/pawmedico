export type AppLanguage = "en" | "ta" | "hi";
export type AppTheme = "light" | "dark";

export const languageLabels: Record<AppLanguage, string> = {
  en: "English",
  ta: "Tamil",
  hi: "Hindi"
};

export const translations = {
  en: {
    navTagline: "Your AI-powered veterinary companion",
    navLogin: "Login",
    navTheme: "Theme",
    navLanguage: "Language",
    navInstall: "Install app",
    navDemo: "Demo mode",
    homeBadge: "React + FastAPI product upgrade",
    homeTitle: "Modern veterinary care software built around AI triage, pet records, prescriptions, and owner confidence.",
    homeBody:
      "PawMedic Pro upgrades the original vet-care idea into a structured FastAPI and React product with room for auth, reminders, analytics, multilingual support, and deployment.",
    homePrimary: "Open Dashboard",
    homeSecondary: "Check Setup",
    homeInstallHint: "Installable PWA, multilingual UI, and dark mode are now wired into the frontend.",
    dashboardTitle: "Pet health command center",
    dashboardBody: "Track pets, records, weight trends, vaccinations, and appointment follow-ups from one place.",
    pawbotTitle: "PawBot",
    pawbotBody: "Ask quick pet-care questions. Streaming replies use the FastAPI event stream when available.",
    loginTitle: "Supabase auth readiness",
    loginBody: "Add the final Supabase keys when you are ready. Until then, the project stays usable in local demo mode.",
    vaccinationsTitle: "Vaccines and appointments",
    vaccinationsBody: "Plan preventive care, upcoming doses, and clinic visits from a single reminder hub.",
    nearbyTitle: "Nearby veterinary clinics",
    nearbyBody: "Use GPS or coordinates to find nearby clinics with OpenStreetMap-powered lookup.",
    nearbySearch: "Search clinics",
    nearbyCurrent: "Use current location",
    vaccinesEmpty: "No vaccinations scheduled yet.",
    appointmentsEmpty: "No appointment requests yet.",
    themeLight: "Light",
    themeDark: "Dark"
  },
  ta: {
    navTagline: "உங்கள் AI விலங்கு சுகாதார துணை",
    navLogin: "உள்நுழை",
    navTheme: "தீம்",
    navLanguage: "மொழி",
    navInstall: "ஆப் நிறுவு",
    navDemo: "டெமோ நிலை",
    homeBadge: "React + FastAPI மேம்பாடு",
    homeTitle: "AI பரிசோதனை, செல்லப்பிராணி பதிவுகள், மருந்து திட்டங்கள் மற்றும் உரிமையாளர் நம்பிக்கையை மையமாகக் கொண்ட நவீன விலங்கு பராமரிப்பு மென்பொருள்.",
    homeBody:
      "PawMedic Pro, பழைய vet-care திட்டத்தை FastAPI மற்றும் React அடிப்படையிலான முழுமையான தயாரிப்பாக மேம்படுத்துகிறது.",
    homePrimary: "டாஷ்போர்டை திற",
    homeSecondary: "அமைப்பை பார்க்க",
    homeInstallHint: "PWA நிறுவல், பல்மொழி UI மற்றும் டார்க் மோடு இணைக்கப்பட்டுள்ளன.",
    dashboardTitle: "செல்லப்பிராணி சுகாதார கட்டுப்பாட்டு மையம்",
    dashboardBody: "ஒரே இடத்தில் செல்லப்பிராணிகள், பதிவுகள், எடை நிலை, தடுப்பூசிகள் மற்றும் சந்திப்பு தொடர்வுகளை கண்காணிக்கவும்.",
    pawbotTitle: "PawBot",
    pawbotBody: "செல்லப்பிராணி பராமரிப்பு கேள்விகளை கேளுங்கள். கிடைக்கும்போது நேரடி பதில்கள் வருகிறது.",
    loginTitle: "Supabase உள்நுழைவு தயார்நிலை",
    loginBody: "இறுதி Supabase கீகளை சேர்த்தவுடன் உண்மையான உள்நுழைவை இயக்கலாம்.",
    vaccinationsTitle: "தடுப்பூசிகள் மற்றும் சந்திப்புகள்",
    vaccinationsBody: "தடுப்பு பராமரிப்பு, அடுத்த டோஸ், மற்றும் கிளினிக் வருகைகளை ஒரே நினைவூட்டல் மையத்தில் நிர்வகிக்கவும்.",
    nearbyTitle: "அருகிலுள்ள விலங்கு மருத்துவ நிலையங்கள்",
    nearbyBody: "GPS அல்லது கோஆர்டினேட் மூலம் அருகிலுள்ள கிளினிக்குகளை கண்டுபிடிக்கவும்.",
    nearbySearch: "கிளினிக்குகள் தேடு",
    nearbyCurrent: "தற்போதைய இடம்",
    vaccinesEmpty: "இன்னும் தடுப்பூசி பதிவுகள் இல்லை.",
    appointmentsEmpty: "இன்னும் சந்திப்பு கோரிக்கைகள் இல்லை.",
    themeLight: "ஒளி",
    themeDark: "இருள்"
  },
  hi: {
    navTagline: "आपका AI-संचालित पशु स्वास्थ्य साथी",
    navLogin: "लॉगिन",
    navTheme: "थीम",
    navLanguage: "भाषा",
    navInstall: "ऐप इंस्टॉल करें",
    navDemo: "डेमो मोड",
    homeBadge: "React + FastAPI अपग्रेड",
    homeTitle: "AI ट्रायाज, पालतू रिकॉर्ड, प्रिस्क्रिप्शन और मालिक के भरोसे पर आधारित आधुनिक पशु देखभाल सॉफ्टवेयर।",
    homeBody:
      "PawMedic Pro पुराने vet-care विचार को FastAPI और React आधारित संरचित प्रोडक्ट में बदलता है, जिसमें auth, reminders, analytics और multilingual support की जगह है।",
    homePrimary: "डैशबोर्ड खोलें",
    homeSecondary: "सेटअप देखें",
    homeInstallHint: "अब PWA इंस्टॉल, बहुभाषी UI और डार्क मोड फ्रंटएंड में जुड़े हुए हैं।",
    dashboardTitle: "पालतू स्वास्थ्य कमांड सेंटर",
    dashboardBody: "एक ही जगह से पालतू, रिकॉर्ड, वजन ट्रेंड, वैक्सीन और अपॉइंटमेंट फॉलो-अप देखें।",
    pawbotTitle: "PawBot",
    pawbotBody: "त्वरित pet-care सवाल पूछें। उपलब्ध होने पर streaming replies दिखाई देंगी।",
    loginTitle: "Supabase auth readiness",
    loginBody: "जब आप final Supabase keys देंगे तब real login flow enable किया जा सकता है।",
    vaccinationsTitle: "वैक्सीन और अपॉइंटमेंट",
    vaccinationsBody: "प्रिवेंटिव केयर, अगली डोज और क्लिनिक विजिट एक ही reminder hub से प्लान करें।",
    nearbyTitle: "नज़दीकी veterinary clinics",
    nearbyBody: "GPS या coordinates से आसपास के clinics खोजें।",
    nearbySearch: "क्लिनिक खोजें",
    nearbyCurrent: "वर्तमान लोकेशन",
    vaccinesEmpty: "अभी कोई vaccine schedule नहीं है।",
    appointmentsEmpty: "अभी कोई appointment request नहीं है।",
    themeLight: "लाइट",
    themeDark: "डार्क"
  }
} as const;

export function t(language: AppLanguage) {
  return translations[language];
}
