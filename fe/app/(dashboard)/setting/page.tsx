"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { normalizeLanguage, persistLanguage } from "@/lib/i18n-language";
import i18n from "@/lib/i18n";

const languageOptions = [
  { value: "vi", labelKey: "settings.languageVietnamese" },
  { value: "en", labelKey: "settings.languageEnglish" },
];

export default function SettingPage() {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const currentTheme = theme === "light" ? "light" : "dark";
  const currentLanguage = normalizeLanguage(i18n.language);

  const themeActions = useMemo(
    () => [
      {
        value: "light",
        label: t("settings.themeLight"),
      },
      {
        value: "dark",
        label: t("settings.themeDark"),
      },
    ],
    [t],
  );

  return (
    <main className="space-y-8 max-w-4xl mx-auto">

      <section className="rounded-[2rem] border border-border bg-card/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary">
            {t("settings.themeTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("settings.themeHint")}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {themeActions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={currentTheme === option.value ? "default" : "outline"}
              onClick={() => setTheme(option.value)}
              className="rounded-xl"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-card/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary">
            {t("settings.languageTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("settings.languageHint")}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {languageOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={currentLanguage === option.value ? "default" : "outline"}
              onClick={() => {
                const lng = option.value as "en" | "vi";
                persistLanguage(lng);
                void i18n.changeLanguage(lng);
              }}
              className="rounded-xl"
            >
              {t(option.labelKey)}
            </Button>
          ))}
        </div>
      </section>
    </main>
  );
}
