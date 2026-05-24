import Link from "next/link";
import { Flag, Siren } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { RaceDetailPanel } from "@/features/races/components/race-detail-panel";
import { RaceChecklist } from "@/features/referee-reports/components/race-checklist";
import { RefereeReportSummary } from "@/features/referee-reports/components/referee-report-summary";
import { getRaceById } from "@/features/races/mock-races";
import {
  getChecklistByRaceId,
  getReportByRaceId,
} from "@/features/referee-reports/mock-referee-data";

export default async function RefereeRaceDetailPage({
  params,
}: {
  params: Promise<{ raceId: string }>;
}) {
  const { raceId } = await params;
  const race = getRaceById(raceId);

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Race checklist"
        title={race.name}
        description="Referee detail view with reused race detail panel, checklist structure, and report confirmation summary."
        actions={
          <>
            <Button asChild variant="outline" className="h-11 rounded-full">
              <Link href={`/referee/races/${race.id}/violations`}>
                <Siren className="size-4" /> Violations
              </Link>
            </Button>
            <Button asChild className="h-11 rounded-full">
              <Link href={`/referee/races/${race.id}/result-entry`}>
                <Flag className="size-4" /> Result entry
              </Link>
            </Button>
          </>
        }
      />
      <RaceChecklist items={getChecklistByRaceId(race.id)} />
      <RaceDetailPanel race={race} />
      <RefereeReportSummary report={getReportByRaceId(race.id)} />
    </main>
  );
}
