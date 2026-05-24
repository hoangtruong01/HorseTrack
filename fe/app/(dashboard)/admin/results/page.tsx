import Link from "next/link";
import { ArrowUpRight, Trophy } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockRaceResults } from "@/features/results/mock-results";

export default function AdminResultsPage() {
  const ready = mockRaceResults.filter(
    (result) => result.status === "referee_confirmed",
  ).length;
  const published = mockRaceResults.filter(
    (result) => result.status === "published",
  ).length;

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Result publish"
        title="Race result review"
        description="Review per-race rankings, referee summary, draft/confirmed/published states, then publish confirmed results. Mock data only."
      />
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#15151E]/85 p-5">
          <Trophy className="size-5 text-primary" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Ready
          </p>
          <p className="mt-2 font-mono text-4xl font-black text-white">
            {ready}
          </p>
          <StatusBadge
            className="mt-3"
            label="Referee confirmed"
            tone="green"
            pulse
          />
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#15151E]/85 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Published
          </p>
          <p className="mt-2 font-mono text-4xl font-black text-white">
            {published}
          </p>
          <StatusBadge className="mt-3" label="Public state" tone="teal" />
        </div>
      </section>
      <section className="grid gap-4">
        {mockRaceResults.map((result) => (
          <article
            key={result.raceId}
            className="rounded-2xl border border-white/10 bg-[#15151E]/85 p-5 transition hover:border-primary/40"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <StatusBadge
                  label={result.status.replace("_", " ")}
                  tone={
                    result.status === "published"
                      ? "teal"
                      : result.status === "referee_confirmed"
                        ? "green"
                        : "slate"
                  }
                  pulse={result.status === "referee_confirmed"}
                />
                <h2 className="mt-3 text-2xl font-black uppercase text-white">
                  {result.race}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {result.tournament} · {result.distance} · {result.finishedAt}
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="min-h-11 rounded-full"
              >
                <Link href={`/admin/results/${result.raceId}`}>
                  Review result <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
