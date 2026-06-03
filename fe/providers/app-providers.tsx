"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { I18nextProvider } from "react-i18next";

import i18n, { syncI18nLanguage } from "@/lib/i18n";
import {
  LANGUAGE_STORAGE_KEY,
  normalizeLanguage,
  persistLanguage,
  readStoredLanguage,
} from "@/lib/i18n-language";

export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    const boot = async () => {
      const stored = readStoredLanguage();
      persistLanguage(stored);
      await syncI18nLanguage(stored);
      setI18nReady(true);
    };

    void boot();

    const handleLanguageChanged = (lng: string) => {
      const normalized = normalizeLanguage(lng);
      persistLanguage(normalized);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LANGUAGE_STORAGE_KEY || !event.newValue) return;
      void syncI18nLanguage(event.newValue);
    };

    i18n.on("languageChanged", handleLanguageChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  if (!i18nReady) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <div className="min-h-screen bg-background" aria-hidden="true" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </ThemeProvider>
  );
}
