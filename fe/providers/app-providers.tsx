"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { I18nextProvider } from "react-i18next";

import i18n from "@/lib/i18n";

export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const storedLanguage = localStorage.getItem("language");

    if (storedLanguage && storedLanguage !== i18n.language) {
      i18n.changeLanguage(storedLanguage);
    }

    const handleLanguageChange = (language: string) => {
      localStorage.setItem("language", language);
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </ThemeProvider>
  );
}
