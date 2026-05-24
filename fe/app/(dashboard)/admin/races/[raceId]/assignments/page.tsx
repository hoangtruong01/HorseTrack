import Link from "next/link";
import { ShieldCheck, UserRound } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getRaceById } from "@/features/races/mock-races";

export default async function AdminRaceAssignmentsPage({
  params,
}: {
  params: Promise<{ raceId: string }>;
}) {
  const { raceId } = await params;
  const race = getRaceById(raceId);

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Assignment overview"
        title={`${race.name} assignments`}
        description="Continuity placeholder for referee and jockey assignments. No accept/reject workflow, no backend, no realtime."
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/admin/races/${race.id}`}>Back to detail</Link>
          </Button>
        }
      />
      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-white/10 bg-[#15151E]/85 p-5 sm:p-6">
          <ShieldCheck className="size-6 text-primary" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Referee assignment
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase text-white">
            {race.referee.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {race.referee.license} · {race.referee.status}
          </p>
          <StatusBadge className="mt-4" label="Display only" tone="slate" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#15151E]/85 p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Jockey lanes
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {race.participants.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-center gap-3">
                  <UserRound className="size-5 text-primary" />
                  <div>
                    <h3 className="font-black uppercase text-white">
                      {item.jockey}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.horse} · Lane {item.lane}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
