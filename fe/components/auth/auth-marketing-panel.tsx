"use client";

import {
  CalendarDays,
  Compass,
  Target,
  Trophy,
  UserCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const features = [
  { key: "scheduling", icon: CalendarDays },
  { key: "registration", icon: Compass },
  { key: "jockey", icon: UserCheck },
  { key: "results", icon: Trophy },
  { key: "predictions", icon: Target, wide: true },
] as const;

export function AuthMarketingPanel() {
  const { t } = useTranslation();

  return (
    <aside className="space-y-8">
      <div className="space-y-6">
        <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl uppercase">
          {t("auth.marketing.titleLine1")} <br />
          {t("auth.marketing.titleLine2")} <br />
          <span className="text-[#E10600]">{t("auth.marketing.titleHighlight")}</span>
        </h1>
        <p className="max-w-xl text-sm sm:text-base leading-7 text-muted-foreground">
          {t("auth.marketing.description")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
        {features.map((item) => {
          const Icon = item.icon;
          return (
          <div
            key={item.key}
            className={`group flex items-start gap-4 rounded-[1.25rem] border border-border bg-card/70 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:border-border hover:bg-muted transition-all duration-300 ${"wide" in item && item.wide ? "sm:col-span-2" : ""}`}
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E10600]/10 text-[#E10600] border border-[#E10600]/15 group-hover:scale-105 transition-transform">
              <Icon className="size-5.5" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase text-foreground tracking-wide">
                {t(`auth.marketing.features.${item.key}.title`)}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed font-medium">
                {t(`auth.marketing.features.${item.key}.description`)}
              </p>
            </div>
          </div>
        );})}
      </div>
    </aside>
  );
}
