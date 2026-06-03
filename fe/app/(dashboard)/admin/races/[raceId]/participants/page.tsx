"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { ParticipantTable } from "@/features/races/components/participant-table";
import { RaceScheduleCard } from "@/features/races/components/race-schedule-card";
import { getRaceById } from "@/features/races/mock-races";

export default function AdminRaceParticipantsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const raceId = typeof params.raceId === "string" ? params.raceId : "";
  const race = getRaceById(raceId);

  return (
    <main className="space-y-6">
      
      <RaceScheduleCard race={race} />
      <ParticipantTable participants={race.participants} />
    </main>
  );
}
