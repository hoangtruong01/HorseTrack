"use client";

import { useTranslation } from "react-i18next";

import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function PublicRacesPage() {
  const { t } = useTranslation();
  const p = "pages.public.races";

  return (
    <RoutePlaceholder
      eyebrow={t(`${p}.eyebrow`)}
      title={t(`${p}.title`)}
      description={t(`${p}.description`)}
      cards={[
        { label: t(`${p}.cardUpcoming`), value: t(`${p}.cardUpcomingValue`) },
        { label: t(`${p}.cardLive`), value: t(`${p}.cardLiveValue`) },
        { label: t(`${p}.cardScope`), value: t(`${p}.cardPerRace`) },
      ]}
      ctaHref="/races/race-01"
      ctaLabel={t(`${p}.cta`)}
      emptyTitle={t("pages.public.tournaments.emptyTitle")}
      emptyDescription={t("pages.public.tournaments.emptyDesc")}
    />
  );
}
