"use client";

import { useTranslation } from "react-i18next";

import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function PublicTournamentsPage() {
  const { t } = useTranslation();
  const p = "pages.public.tournaments";

  return (
    <RoutePlaceholder
      eyebrow={t(`${p}.eyebrow`)}
      title={t(`${p}.title`)}
      description={t(`${p}.description`)}
      cards={[
        { label: t(`${p}.cardContainers`), value: "3" },
        { label: t(`${p}.cardLinks`), value: t(`${p}.cardReady`) },
        { label: t(`${p}.cardBackend`), value: t(`${p}.cardOff`) },
      ]}
      ctaHref="/races"
      ctaLabel={t(`${p}.cta`)}
      emptyTitle={t(`${p}.emptyTitle`)}
      emptyDescription={t(`${p}.emptyDesc`)}
    />
  );
}
