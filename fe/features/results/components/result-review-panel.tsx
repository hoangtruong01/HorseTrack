"use client";

import { CheckCircle2, Flag, RadioTower, Trophy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { PublishResultDialog } from "@/features/results/components/publish-result-dialog";
import { RaceRankingTable } from "@/features/results/components/race-ranking-table";
import type {
  RaceResultReview,
  ResultStatus,
} from "@/features/results/mock-results";

const meta: Record<
  ResultStatus,
  { label: string; tone: "slate" | "green" | "teal" }
> = {
  draft: { label: "Draft", tone: "slate" },
  referee_confirmed: { label: "Referee confirmed", tone: "green" },
  published: { label: "Published", tone: "teal" },
};

export type ResultReviewPanelProps = { result: RaceResultReview };

export function ResultReviewPanel({ result }: ResultReviewPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const canPublish = result.status === "referee_confirmed";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-6 lg:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(225,6,0,0.1),transparent_38%),radial-gradient(circle_at_82%_18%,rgba(6,126,106,0.08),transparent_26rem)] dark:bg-[linear-gradient(120deg,rgba(225,6,0,0.22),transparent_38%),radial-gradient(circle_at_82%_18%,rgba(6,126,106,0.2),transparent_26rem)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <StatusBadge
              label={meta[result.status].label}
              tone={meta[result.status].tone}
              pulse={canPublish}
            />
            <h1 className="mt-5 text-3xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-5xl">
              {result.race}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Admin race-result gate: review referee summary, inspect ranking,
              then publish only when referee-confirmed. Mock data only.
            </p>
          </div>
          <div className="grid gap-3 rounded-2xl border border-border bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <Flag className="size-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Track
                </p>
                <p className="font-black text-foreground">{result.track}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Trophy className="size-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Ranking rows
                </p>
                <p className="font-mono font-black text-foreground">
                  {result.rankings.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RadioTower className="size-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Referee
                </p>
                <p className="font-black text-foreground">{result.referee}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Race summary
          </p>
          <h2 className="mt-2 text-xl font-black uppercase text-foreground">
            {result.tournament}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {result.distance} · {result.track} · finished {result.finishedAt}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Referee summary
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {result.refereeSummary}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Publish state
          </p>
          <div className="mt-3">
            <StatusBadge
              label={
                result.status === "published"
                  ? "Published result"
                  : canPublish
                    ? "Ready to publish"
                    : "Awaiting referee"
              }
              tone={
                result.status === "published"
                  ? "teal"
                  : canPublish
                    ? "green"
                    : "yellow"
              }
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {result.publishState}
          </p>
        </div>
      </section>

      <RaceRankingTable rankings={result.rankings} raceName={result.race} />

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Publish confirmation
          </p>
          <h2 className="mt-2 text-xl font-black uppercase text-foreground">
            {result.status === "published"
              ? "Published state locked"
              : "Final admin gate"}
          </h2>
        </div>
        {result.status === "published" ? (
          <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#067E6A]/40 bg-teal-50 px-4 text-sm font-bold text-teal-900 dark:bg-[#067E6A]/20 dark:text-teal-100">
            <CheckCircle2 className="size-4" /> Result already published
          </div>
        ) : (
          <Button
            type="button"
            className="min-h-11 rounded-full"
            disabled={!canPublish}
            onClick={() => setDialogOpen(true)}
          >
            Publish result
          </Button>
        )}
      </section>

      <PublishResultDialog
        result={result}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
