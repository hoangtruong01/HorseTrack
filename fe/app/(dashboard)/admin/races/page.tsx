import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { RaceCard } from "@/features/races/components/race-card";
import { RaceTable } from "@/features/races/components/race-table";
import { mockRaces } from "@/features/races/mock-races";

export default function AdminRacesPage() {
  const liveRace =
    mockRaces.find((race) => race.status === "live") ?? mockRaces[0];

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Race management"
        title="Race control board"
        description="Core race-centric admin UI: status visibility, schedule board, participant routes, reusable race components. Mock data only."
        actions={
          <Button asChild className="rounded-full">
            <Link href="/admin/races/new">
              Create race <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <RaceCard race={liveRace} />
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Status stack
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase dark:text-white text-foreground">
            Scheduled · Live · Finished · Published
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Phase 4C keeps every race independent. No rounds, stage progression,
            brackets, qualification, betting, or backend calls.
          </p>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {mockRaces.map((race) => (
          <RaceCard key={race.id} race={race} />
        ))}
      </section>
      <RaceTable races={mockRaces} />
    </main>
  );
}
