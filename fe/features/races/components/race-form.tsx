"use client";

import { CalendarClock, Flag, MapPin, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

export function RaceForm() {
  const { t } = useTranslation();

  const primaryFields = [
    {
      key: "raceName",
      icon: Flag,
      placeholder: t("pages.admin.raceForm.placeholders.raceName"),
    },
    {
      key: "tournament",
      icon: ShieldCheck,
      placeholder: t("pages.admin.raceForm.placeholders.tournament"),
    },
    {
      key: "dateTime",
      icon: CalendarClock,
      placeholder: t("pages.admin.raceForm.placeholders.dateTime"),
    },
    {
      key: "location",
      icon: MapPin,
      placeholder: t("pages.admin.raceForm.placeholders.location"),
    },
  ] as const;

  const secondaryFields = [
    { key: "distance", placeholder: t("pages.admin.raceForm.placeholders.distance") },
    { key: "surface", placeholder: t("pages.admin.raceForm.placeholders.surface") },
    { key: "capacity", placeholder: t("pages.admin.raceForm.placeholders.capacity") },
  ] as const;

  return (
    <form className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5 shadow-[0_18px_56px_rgba(0,0,0,0.28)] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("pages.admin.raceForm.eyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight dark:text-white text-foreground">
            {t("pages.admin.raceForm.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("pages.admin.raceForm.subtitle")}
          </p>
        </div>
        <Button type="button" className="rounded-full">
          {t("pages.admin.raceForm.save")}
        </Button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {primaryFields.map((field) => {
          const Icon = field.icon;
          return (
            <label
              key={field.key}
              className="grid gap-2 text-sm font-bold dark:text-white text-foreground"
            >
              <span className="inline-flex items-center gap-2">
                <Icon className="size-4 text-primary" />
                {t(`pages.admin.raceForm.fields.${field.key}`)}
              </span>
              <input
                className="h-11 rounded-lg border dark:border-white/10 border-border dark:bg-black/25 bg-muted/20 px-3 text-sm dark:text-white text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder={field.placeholder}
              />
            </label>
          );
        })}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {secondaryFields.map((field) => (
          <label
            key={field.key}
            className="grid gap-2 text-sm font-bold dark:text-white text-foreground"
          >
            {t(`pages.admin.raceForm.fields.${field.key}`)}
            <input
              className="h-11 rounded-lg border dark:border-white/10 border-border dark:bg-black/25 bg-muted/20 px-3 text-sm dark:text-white text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder={field.placeholder}
            />
          </label>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm leading-6 dark:text-yellow-100 text-yellow-800">
        {t("pages.admin.raceForm.scopeNote")}
      </div>
    </form>
  );
}
