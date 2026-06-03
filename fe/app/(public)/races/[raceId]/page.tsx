"use client";

import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function PublicRaceDetailPage() {
  const { raceId } = useParams<{ raceId: string }>();
  const { t } = useTranslation();
  const p = "pages.public.raceDetail";

  return (
    <RoutePlaceholder
      eyebrow={t(`${p}.eyebrow`)}
      title={t(`${p}.title`, { id: raceId })}
      description={t(`${p}.description`)}
      cards={[
        { label: t(`${p}.cardUnit`), value: t(`${p}.cardIndependent`) },
        { label: t(`${p}.cardPrediction`), value: t(`${p}.cardLoginLater`) },
        { label: t(`${p}.cardMockId`), value: raceId },
      ]}
      ctaHref="/races"
      ctaLabel={t(`${p}.cta`)}
    />
  );
}
