"use client";

import Link from "next/link";
import { ArrowUpRight, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockRaceResults } from "@/features/results/mock-results";

export default function AdminResultsPage() {
  const { t } = useTranslation();
  const counts = mockRaceResults.reduce(
    (acc, result) => {
      acc[result.status] += 1;
      return acc;
    },
    { draft: 0, published: 0, referee_confirmed: 0 },
  );

  return (
    <main className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5">
          <Trophy className="size-5 text-primary" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("pages.admin.results.ready")}
          </p>
          <p className="mt-2 font-mono text-4xl font-black dark:text-white text-foreground">
            {counts.referee_confirmed}
          </p>
          <StatusBadge
            className="mt-3"
            label={t("pages.admin.results.refereeConfirmed")}
            tone="green"
            pulse
          />
        </div>
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("pages.admin.results.published")}
          </p>
          <p className="mt-2 font-mono text-4xl font-black dark:text-white text-foreground">
            {counts.published}
          </p>
          <StatusBadge className="mt-3" label={t("pages.admin.results.publicState")} tone="teal" />
        </div>
      </section>
      <section className="grid gap-4">
        {mockRaceResults.map((result) => (
          <article
            key={result.raceId}
            className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5 transition hover:border-primary/40"
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
                <h2 className="mt-3 text-2xl font-black uppercase dark:text-white text-foreground">
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
                  {t("pages.admin.results.reviewResult")} <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
