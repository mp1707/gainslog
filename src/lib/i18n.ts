import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";

// Import translation files
import en from "../locales/en.json";
import de from "../locales/de.json";

// Get device locale (e.g., "en", "de", "es")
const deviceLocale = getLocales()[0]?.languageCode ?? "en";

// Initialize i18next
i18next
  .use(initReactI18next) // Connects i18next with React
  .init({
    // Translation resources
    resources: {
      en: { translation: en },
      de: { translation: de },
    },

    // Language settings
    lng: deviceLocale, // Current language based on device
    fallbackLng: "en", // Fallback to English if translation missing

    // Namespace settings (using single default namespace)
    defaultNS: "translation",
    ns: ["translation"],

    // React Native compatibility
    compatibilityJSON: "v4", // Use v4 format for pluralization

    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // React-specific settings
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
  });

export default i18next;
