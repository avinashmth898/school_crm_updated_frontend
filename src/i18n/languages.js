// Supported interface languages. `native` is what's shown in the language
// switcher itself (so a Tamil-only reader can find "தமிழ்" without
// needing to already read English), `english` is kept for search/labels
// in dev tools and for anyone scanning the list who reads English.
export const LANGUAGES = [
  { code: "en", native: "English", english: "English" },
  { code: "hi", native: "हिन्दी", english: "Hindi" },
  { code: "fr", native: "Français", english: "French" },
  { code: "es", native: "Español", english: "Spanish" },
  { code: "te", native: "తెలుగు", english: "Telugu" },
  { code: "bn", native: "বাংলা", english: "Bengali" },
  { code: "ta", native: "தமிழ்", english: "Tamil" },
  { code: "ml", native: "മലയാളം", english: "Malayalam" },
  { code: "mr", native: "मराठी", english: "Marathi" },
  { code: "gu", native: "ગુજરાતી", english: "Gujarati" },
  { code: "pa", native: "ਪੰਜਾਬੀ", english: "Punjabi" },
  { code: "as", native: "অসমীয়া", english: "Assamese" },
  { code: "kn", native: "ಕನ್ನಡ", english: "Kannada" },
];

export const DEFAULT_LANGUAGE = "en";
