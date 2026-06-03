"use client";

import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function PublicTournamentDetailPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const { t } = useTranslation();
  const p = "pages.public.tournamentDetail";

  return (
    <RoutePlaceholder
      eyebrow={t(`${p}.eyebrow`)}
      title={t(`${p}.title`, { id: tournamentId })}
      description={t(`${p}.description`)}
      cards={[
        { label: t(`${p}.cardRole`), value: t(`${p}.cardRoleValue`) },
        { label: t(`${p}.cardRaceList`), value: t(`${p}.cardDeferred`) },
        { label: t(`${p}.cardMockId`), value: tournamentId },
      ]}
      ctaHref="/tournaments"
      ctaLabel={t(`${p}.cta`)}
    />
  );
}
