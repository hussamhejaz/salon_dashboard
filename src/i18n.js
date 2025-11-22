import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en/translation.json";
import ar from "./locales/ar/translation.json";

// Initialize with local resources to avoid async load issues
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "htmlTag", "querystring", "cookie", "navigator"],
      caches: ["localStorage"],
    },
  });

// Apply dir/lang on load & on language change
const applyDir = (lng) => {
  const dir = lng === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", lng);
};
applyDir(i18n.resolvedLanguage);
i18n.on("languageChanged", applyDir);

export default i18n;
