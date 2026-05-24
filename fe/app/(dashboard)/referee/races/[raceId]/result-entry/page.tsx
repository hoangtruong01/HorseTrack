import Link from "next/link";
import { ArrowLeft, Siren } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { RaceRankingTable } from "@/features/results/components/race-ranking-table";
import { ResultEntryForm } from "@/features/referee-reports/components/result-entry-form";
import { RefereeReportSummary } from "@/features/referee-reports/components/referee-report-summary";
import { getRaceById } from "@/features/races/mock-races";
import { getRaceResultById } from "@/features/results/mock-results";
import {
  getReportByRaceId,
  getResultRowsByRaceId,
} from "@/features/referee-reports/mock-referee-data";

export default async function RefereeResultEntryPage({
  params,
}: {
  params: Promise<{ raceId: string }>;
}) {
  const { raceId } = await params;
  const race = getRaceById(raceId);
  const result = getRaceResultById(race.id);

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Result entry"
        title={race.name}
        description="Tablet-first result form. Enabled only for mock finished races. Referee confirmed state stays distinct from published state."
        actions={
          <>
            <Button asChild variant="outline" className="h-11 rounded-full">
              <Link href={`/referee/races/${race.id}`}>
                <ArrowLeft className="size-4" /> Checklist
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-full">
              <Link href={`/referee/races/${race.id}/violations`}>
                <Siren className="size-4" /> Violations
              </Link>
            </Button>
          </>
        }
      />
      <ResultEntryForm race={race} rows={getResultRowsByRaceId(race.id)} />
      <RaceRankingTable
        rankings={result.rankings}
        raceName={`${race.name} · reference ranking`}
      />
      <RefereeReportSummary report={getReportByRaceId(race.id)} />
    </main>
  );
}
