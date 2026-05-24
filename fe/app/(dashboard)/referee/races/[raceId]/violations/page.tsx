import Link from "next/link";
import { ArrowLeft, Flag } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ViolationList } from "@/features/referee-reports/components/violation-list";
import { ViolationQuickAdd } from "@/features/referee-reports/components/violation-quick-add";
import { getRaceById } from "@/features/races/mock-races";
import { getViolationsByRaceId } from "@/features/referee-reports/mock-referee-data";

export default async function RefereeViolationsPage({
  params,
}: {
  params: Promise<{ raceId: string }>;
}) {
  const { raceId } = await params;
  const race = getRaceById(raceId);

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Violation log"
        title={race.name}
        description="Mock referee violation logging. Clear severity, horse/jockey, timing, and notes. No realtime/socket/API."
        actions={
          <>
            <Button asChild variant="outline" className="h-11 rounded-full">
              <Link href={`/referee/races/${race.id}`}>
                <ArrowLeft className="size-4" /> Checklist
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
      <ViolationQuickAdd />
      <ViolationList violations={getViolationsByRaceId(race.id)} />
    </main>
  );
}
