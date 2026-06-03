"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

export function AuthLayoutHeader() {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between gap-4 py-4 border-b border-border">
      <Link
        href="/"
        className="group flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E10600]/70"
        aria-label="HorseTrack home"
      >
        <img
          src="/logo.png"
          alt="HorseTrack Logo"
          className="size-11 rounded-2xl object-cover border border-border shadow-[0_0_24px_rgba(225,6,0,0.22)] transition group-hover:scale-105"
        />
        <span>
          <span className="block text-lg font-black uppercase tracking-[0.2em] text-foreground leading-none">
            HorseTrack
          </span>
          <span className="block text-[0.66rem] font-bold uppercase tracking-[0.22em] text-muted-foreground mt-1">
            {t("auth.marketing.brandSubtitle")}
          </span>
        </span>
      </Link>
    </header>
  );
}
