import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Flag,
  Gauge,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

const raceStatuses = [
  {
    label: "Live",
    className: "f1-status-live",
    title: "Saigon Sprint — Race 03",
    meta: "8 horses • Referee confirmed • Lap timing active",
  },
  {
    label: "Upcoming",
    className: "f1-status-upcoming",
    title: "Delta Derby — Race 01",
    meta: "Registration approved • Jockey assignment pending",
  },
  {
    label: "Finished",
    className: "f1-status-finished",
    title: "Capital Cup — Race 02",
    meta: "Race result ready • Ranking per race only",
  },
];

const upcomingRaces = [
  {
    time: "09:30",
    race: "Morning Heat",
    tournament: "Spring Velocity Cup",
    slots: "12 slots",
  },
  {
    time: "13:00",
    race: "Coastal Dash",
    tournament: "Heritage Track Open",
    slots: "10 slots",
  },
  {
    time: "18:45",
    race: "Night Circuit",
    tournament: "Redline Invitational",
    slots: "8 slots",
  },
];

const roleHighlights = [
  {
    icon: Trophy,
    role: "Admin",
    text: "Create tournaments, schedule races, publish race results.",
  },
  {
    icon: Users,
    role: "Owner",
    text: "Manage horses, register into races, coordinate jockey assignment.",
  },
  {
    icon: Gauge,
    role: "Jockey",
    text: "Track assigned race schedule and accept invitations.",
  },
  {
    icon: ShieldCheck,
    role: "Referee",
    text: "Confirm participants, violations, race result, ranking.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <AppHeader />

      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,rgba(225,6,0,0.22),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.12),transparent_22rem)]" />
        <div className="f1-container grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white">
              Race-centric tournament operations
            </p>
            <h1 className="f1-title max-w-4xl">
              Horse racing control room for every independent race.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#E0DEDC] sm:text-lg">
              HorseTrack keeps tournaments as clean containers while every race
              owns its own participants, jockey assignment, referee workflow,
              result, and ranking.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-11 rounded-full bg-primary px-6 font-bold hover:bg-[#B80500]"
              >
                <Link href="/races">
                  Explore races{" "}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-white/70 bg-transparent px-6 font-bold text-white hover:bg-white/10"
              >
                <Link href="/tournaments">View tournaments</Link>
              </Button>
            </div>
          </div>

          <div className="f1-card f1-gradient relative overflow-hidden p-5 sm:p-6">
            <div className="absolute right-0 top-0 h-24 w-32 bg-primary/30 blur-3xl" />
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Live feed
                </p>
                <h2 className="mt-2 text-2xl font-black uppercase text-white">
                  Race status board
                </h2>
              </div>
              <Flag className="size-8 text-primary" aria-hidden="true" />
            </div>
            <div className="mt-5 space-y-4">
              {raceStatuses.map((race) => (
                <article
                  key={race.title}
                  className="rounded-lg border border-white/10 bg-[#15151E]/80 p-4"
                >
                  <span className={race.className}>{race.label}</span>
                  <h3 className="mt-3 text-lg font-black uppercase text-white">
                    {race.title}
                  </h3>
                  <p className="mt-2 text-sm leading-5 text-muted-foreground">
                    {race.meta}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="f1-section">
        <div className="f1-container">
          <PageHeader
            eyebrow="Race schedule preview"
            title="Upcoming races"
            description="Mock data only. Foundation validates responsive cards, hierarchy, status labels, and race-first wording."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {upcomingRaces.map((race) => (
              <article key={race.race} className="f1-card">
                <div className="flex items-start justify-between gap-4">
                  <CalendarClock
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />
                  <span className="font-mono text-sm font-bold text-white">
                    {race.time}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-black uppercase text-white">
                  {race.race}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {race.tournament}
                </p>
                <p className="mt-5 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#E0DEDC]">
                  {race.slots}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="f1-section border-y border-white/10 bg-[#1C1C25]/70">
        <div className="f1-container grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Role highlights
            </p>
            <h2 className="mt-3 text-3xl font-black uppercase text-white sm:text-4xl">
              Built for the MVP race flow.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
              No rounds, stages, brackets, playoffs, qualification paths, season
              points, or betting flow. The foundation stays reusable for later
              feature screens.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {roleHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.role} className="f1-card">
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-black uppercase text-white">
                    {item.role}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="f1-section">
        <div className="f1-container">
          <div className="f1-card flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Foundation ready
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase text-white">
                Generate feature screens next.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Layout primitives, navigation constants, design tokens, and
                landing validation are in place.
              </p>
            </div>
            <CheckCircle2 className="size-10 text-primary" aria-hidden="true" />
          </div>
        </div>
      </section>
    </main>
  );
}
