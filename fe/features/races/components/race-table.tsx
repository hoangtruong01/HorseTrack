import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Race, RaceStatus } from "@/features/races/mock-races";

const meta: Record<
  RaceStatus,
  {
    label: string;
    tone: "red" | "yellow" | "green" | "slate" | "teal";
    pulse?: boolean;
  }
> = {
  scheduled: { label: "Scheduled", tone: "yellow" },
  live: { label: "Live", tone: "red", pulse: true },
  finished: { label: "Finished", tone: "slate" },
  result_published: { label: "Published", tone: "teal" },
};

const DEMO_ROW_LIMIT = 6;

export type RaceTableProps = { races: Race[]; limit?: number };

export function RaceTable({ races, limit = DEMO_ROW_LIMIT }: RaceTableProps) {
  const visibleRaces = races.slice(0, limit);
  return (
    <section className="rounded-2xl border border-border/10 bg-[#15151E]/85 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Race list
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-foreground">
            Admin schedule board
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Mock data · showing {visibleRaces.length}/{races.length}
        </p>
      </div>
      <div className="mt-5 overflow-x-auto rounded-xl border border-border/10">
        <table className="min-w-[860px] w-full text-left text-sm">
          <thead className="bg-muted/[0.04] text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Race</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Schedule</th>
              <th className="px-4 py-3">Track</th>
              <th className="px-4 py-3">Participants</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-black/10">
            {visibleRaces.map((race) => (
              <tr key={race.id} className="transition hover:bg-muted/[0.04]">
                <td className="px-4 py-4">
                  <p className="font-black uppercase text-foreground">{race.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {race.tournament}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge
                    label={meta[race.status].label}
                    tone={meta[race.status].tone}
                    pulse={meta[race.status].pulse}
                  />
                </td>
                <td className="px-4 py-4 text-white/80">
                  {race.date}
                  <br />
                  <span className="text-muted-foreground">
                    {race.startTime} → {race.endTime}
                  </span>
                </td>
                <td className="px-4 py-4 text-white/80">
                  {race.track}
                  <br />
                  <span className="font-mono text-muted-foreground">
                    {race.distance}
                  </span>
                </td>
                <td className="px-4 py-4 font-mono font-bold text-foreground">
                  {race.participants.length}/{race.capacity}
                </td>
                <td className="px-4 py-4">
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href={`/admin/races/${race.id}`}>
                      Manage <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
