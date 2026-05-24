import Link from "next/link";
import { CheckCircle2, Lock, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type { Race } from "@/features/races/mock-races";
import type {
  ResultEntryRow,
  ResultEntryStatus,
} from "@/features/referee-reports/mock-referee-data";

const statusMeta: Record<
  ResultEntryStatus,
  { label: string; tone: "slate" | "green" | "teal" }
> = {
  draft: { label: "Draft", tone: "slate" },
  referee_confirmed: { label: "Referee confirmed", tone: "green" },
  published: { label: "Published", tone: "teal" },
};

export type ResultEntryFormProps = {
  race: Race;
  rows: ResultEntryRow[];
};

export function ResultEntryForm({ race, rows }: ResultEntryFormProps) {
  const enabled = race.status === "finished";
  const published = race.status === "result_published";
  const stateLabel = published
    ? "Published · locked"
    : enabled
      ? "Finished · entry enabled"
      : "Locked until race finished";

  return (
    <section className="relative rounded-2xl border border-white/10 bg-[#15151E]/90 p-4 pb-28 sm:p-6 sm:pb-28">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Race result entry
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase text-white">
            {race.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enabled only for mock finished race. Confirmation is separate from
            published state.
          </p>
        </div>
        <StatusBadge
          label={stateLabel}
          tone={published ? "teal" : enabled ? "green" : "slate"}
        />
      </div>
      {!enabled ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-muted-foreground">
          <Lock className="mr-2 inline size-4 text-primary" /> Result entry
          disabled because this race is not in finished status.
        </div>
      ) : null}
      <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Horse</th>
              <th className="px-4 py-3">Jockey</th>
              <th className="px-4 py-3">Finish time</th>
              <th className="px-4 py-3">Penalty/note</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-black/10">
            {rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "transition hover:bg-white/[0.04]",
                  !enabled && "opacity-55",
                )}
              >
                <td className="px-4 py-4 font-mono text-2xl font-black text-white">
                  #{row.rank}
                </td>
                <td className="px-4 py-4">
                  <p className="font-black uppercase text-white">{row.horse}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {row.horseCode}
                  </p>
                </td>
                <td className="px-4 py-4 text-white/80">{row.jockey}</td>
                <td className="px-4 py-4">
                  <input
                    aria-label={`Finish time for ${row.horse}`}
                    disabled={!enabled}
                    defaultValue={row.finishTime}
                    className="h-11 w-32 rounded-lg border border-white/10 bg-black/35 px-3 font-mono font-black text-white outline-none focus:border-primary disabled:cursor-not-allowed disabled:text-white/40"
                  />
                </td>
                <td className="px-4 py-4">
                  <input
                    aria-label={`Penalty note for ${row.horse}`}
                    disabled={!enabled}
                    defaultValue={row.penaltyNote}
                    className="h-11 w-48 rounded-lg border border-white/10 bg-black/35 px-3 text-white outline-none focus:border-primary disabled:cursor-not-allowed disabled:text-white/40"
                  />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge
                    label={statusMeta[row.status].label}
                    tone={statusMeta[row.status].tone}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sticky bottom-3 z-10 mt-6 rounded-2xl border border-white/10 bg-[#1C1C25]/95 p-3 shadow-[0_18px_56px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-black uppercase text-white">Tablet action bar</p>
            <p className="text-sm text-muted-foreground">
              Draft save + referee confirm. Published state remains admin/public
              locked.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button asChild variant="outline" className="h-12 rounded-full">
              <Link href={`/referee/races/${race.id}`}>Checklist</Link>
            </Button>
            <Button
              disabled={!enabled}
              variant="outline"
              className="h-12 rounded-full"
            >
              <Save className="size-4" /> Save draft
            </Button>
            <Button disabled={!enabled} className="h-12 rounded-full">
              <CheckCircle2 className="size-4" /> Confirm result
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
