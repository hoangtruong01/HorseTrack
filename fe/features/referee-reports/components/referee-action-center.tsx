import Link from "next/link";
import { ArrowRight, ClipboardList, FileText, Flag, Siren } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type {
  assignedRaces,
  refereeProfile,
} from "@/features/referee-reports/mock-referee-data";

type Assignment = (typeof assignedRaces)[number];
type Profile = typeof refereeProfile;

const priorityTone: Record<
  Assignment["priority"],
  "red" | "yellow" | "green" | "teal"
> = {
  now: "red",
  next: "yellow",
  review: "green",
  closed: "teal",
};

export type RefereeActionCenterProps = {
  assignments: Assignment[];
  profile: Profile;
};

export function RefereeActionCenter({
  assignments,
  profile,
}: RefereeActionCenterProps) {
  const active =
    assignments.find((item) => item.priority === "now") ?? assignments[0];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#15151E] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.36)] sm:p-7 lg:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(225,6,0,0.28),transparent_34%),radial-gradient(circle_at_88%_20%,rgba(6,126,106,0.22),transparent_28rem)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <StatusBadge label="Tablet referee desk" tone="red" pulse />
            <h1 className="mt-5 text-4xl font-black uppercase leading-tight text-white sm:text-5xl">
              Race control action center
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Assigned races, checklist state, violation logging, and result
              entry stay race-centric. Mock data only.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Referee
            </p>
            <p className="mt-2 text-2xl font-black uppercase text-white">
              {profile.name}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.license} · {profile.station}
            </p>
          </div>
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <article className="rounded-2xl border border-primary/25 bg-[linear-gradient(135deg,rgba(225,6,0,0.16),rgba(21,21,30,0.94))] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Next required action
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase text-white">
            {active.race.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{active.callout}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Button asChild className="h-12 rounded-full">
              <Link href={`/referee/races/${active.race.id}`}>
                <ClipboardList className="size-4" /> Checklist
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full">
              <Link href={`/referee/races/${active.race.id}/violations`}>
                <Siren className="size-4" /> Violations
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full">
              <Link href={`/referee/races/${active.race.id}/result-entry`}>
                <Flag className="size-4" /> Result
              </Link>
            </Button>
          </div>
        </article>
        <article className="rounded-2xl border border-white/10 bg-[#15151E]/90 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Report queue
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase text-white">
            Confirmation ≠ published
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Referee confirm prepares Race result for admin publish. Published
            state is visually locked and separate.
          </p>
          <Button asChild variant="outline" className="mt-5 h-12 rounded-full">
            <Link href="/referee/reports">
              <FileText className="size-4" /> View reports{" "}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </article>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {assignments.map((assignment) => (
          <article
            key={assignment.race.id}
            className="rounded-2xl border border-white/10 bg-[#15151E]/85 p-5"
          >
            <StatusBadge
              label={assignment.priority}
              tone={priorityTone[assignment.priority]}
              pulse={assignment.priority === "now"}
            />
            <h3 className="mt-4 text-xl font-black uppercase text-white">
              {assignment.race.name}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {assignment.callout}
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-4 h-11 rounded-full"
            >
              <Link href={`/referee/races/${assignment.race.id}`}>
                Open race <ArrowRight className="size-4" />
              </Link>
            </Button>
          </article>
        ))}
      </section>
    </div>
  );
}
