"use client";

import { useTranslation } from "react-i18next";

export function AuthLayoutFooter() {
  const { t } = useTranslation();

  return (
    <footer className="py-6 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-[0.16em]">
      <span className="flex items-center gap-1.5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5 text-[#067E6A]"
          aria-hidden
        >
          <rect width="20" height="11" x="2" y="9" rx="2" ry="2" />
          <path d="M5 9V7a7 7 0 0 1 14 0v2" />
        </svg>
        {t("auth.marketing.footerSecure")}
      </span>
      <span className="hidden sm:inline">•</span>
      <span>{t("auth.marketing.footerJwt")}</span>
      <span className="hidden sm:inline">•</span>
      <span>{t("auth.marketing.footerSafe")}</span>
    </footer>
  );
}
