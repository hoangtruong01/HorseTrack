import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { RaceDetailPanel } from "@/features/races/components/race-detail-panel";
import { getRaceById } from "@/features/races/mock-races";

export default async function AdminRaceDetailPage({
  params,
}: {
  params: Promise<{ raceId: string }>;
}) {
  const { raceId } = await params;
  const race = getRaceById(raceId);

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Race detail"
        title={race.name}
        description="Race info, schedule/location, participants, referee summary, status timeline, quick actions placeholder, and metadata."
        actions={
          <>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/admin/races">All races</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href={`/admin/races/${race.id}/participants`}>
                Participants
              </Link>
            </Button>
          </>
        }
      />
      <RaceDetailPanel race={race} />
    </main>
  );
}
