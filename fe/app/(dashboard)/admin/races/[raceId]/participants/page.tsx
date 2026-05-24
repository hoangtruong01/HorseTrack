import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ParticipantTable } from "@/features/races/components/participant-table";
import { RaceScheduleCard } from "@/features/races/components/race-schedule-card";
import { getRaceById } from "@/features/races/mock-races";

export default async function AdminRaceParticipantsPage({
  params,
}: {
  params: Promise<{ raceId: string }>;
}) {
  const { raceId } = await params;
  const race = getRaceById(raceId);

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Race participants"
        title={`${race.name} grid`}
        description="Participant organization by horse, owner, jockey, lane/order, and status. Display-only mock data."
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/admin/races/${race.id}`}>Back to detail</Link>
          </Button>
        }
      />
      <RaceScheduleCard race={race} />
      <ParticipantTable participants={race.participants} />
    </main>
  );
}
