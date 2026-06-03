"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { RaceDetailPanel } from "@/features/races/components/race-detail-panel";
import { getRaceById } from "@/features/races/mock-races";

export default function AdminRaceDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const raceId = typeof params.raceId === "string" ? params.raceId : "";
  const race = getRaceById(raceId);

  return (
    <main className="space-y-6">
      
      <RaceDetailPanel race={race} />
    </main>
  );
}
