import Link from "next/link";
import { ArrowRight, ClipboardList, Gauge, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ParticipantTable } from "@/features/races/components/participant-table";
import { RaceScheduleCard } from "@/features/races/components/race-schedule-card";
import { RaceStatusTimeline } from "@/features/races/components/race-status-timeline";
import type { Race } from "@/features/races/mock-races";

export type RaceDetailPanelProps = { race: Race };

export function RaceDetailPanel({ race }: RaceDetailPanelProps) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border/10 bg-[#15151E] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.34)] sm:p-6 lg:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(225,6,0,0.24),transparent_36%),radial-gradient(circle_at_82%_16%,rgba(6,126,106,0.18),transparent_26rem)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <StatusBadge
              label={race.status.replace("_", " ")}
              tone={
                race.status === "live"
                  ? "red"
                  : race.status === "scheduled"
                    ? "yellow"
                    : race.status === "result_published"
                      ? "teal"
                      : "slate"
              }
              pulse={race.status === "live"}
            />
            <h1 className="mt-5 text-3xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-5xl">
              {race.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Race is the core business object: schedule, participants, referee,
              status timeline, and metadata are grouped in one admin control
              view.
            </p>
          </div>
          <div className="grid gap-3 rounded-2xl border border-border/10 bg-black/25 p-4">
            <div className="flex items-center gap-3">
              <Gauge className="size-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Distance
                </p>
                <p className="font-black text-foreground">{race.distance}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="size-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Participants
                </p>
                <p className="font-black text-foreground">
                  {race.participants.length}/{race.capacity}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ClipboardList className="size-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Tournament
                </p>
                <p className="font-black text-foreground">{race.tournament}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.82fr]">
        <RaceScheduleCard race={race} />
        <RaceStatusTimeline steps={race.timeline} />
      </div>

      <ParticipantTable participants={race.participants} />

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/10 bg-[#15151E]/85 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Referee summary
          </p>
          <h2 className="mt-2 text-xl font-black uppercase text-foreground">
            {race.referee.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {race.referee.license} · {race.referee.status}
          </p>
        </div>
        <div className="rounded-2xl border border-border/10 bg-[#15151E]/85 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Quick actions
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/admin/races/${race.id}/participants`}>
                View participants <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/admin/races/${race.id}/assignments`}>
                Assignments
              </Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Placeholders only. No approval/publish workflow.
          </p>
        </div>
        <div className="rounded-2xl border border-border/10 bg-[#15151E]/85 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Race metadata
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Created by</dt>
              <dd className="font-bold text-foreground">
                {race.metadata.createdBy}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created at</dt>
              <dd className="font-bold text-foreground">
                {race.metadata.createdAt}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Steward note</dt>
              <dd className="font-bold text-foreground">
                {race.metadata.stewardNote}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
