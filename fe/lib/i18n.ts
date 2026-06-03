"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "@/i18n/en/translation.json";
import viTranslation from "@/i18n/vi/translation.json";
import {
  normalizeLanguage,
  readStoredLanguage,
} from "@/lib/i18n-language";

const resources = {
  en: {
    translation: enTranslation,
  },
  vi: {
    translation: viTranslation,
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: readStoredLanguage(),
    fallbackLng: "vi",
    supportedLngs: ["en", "vi"],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export async function syncI18nLanguage(lng?: string | null) {
  const next = lng ? normalizeLanguage(lng) : readStoredLanguage();
  if (normalizeLanguage(i18n.language) !== next) {
    await i18n.changeLanguage(next);
  }
  return next;
}

export default i18n;
