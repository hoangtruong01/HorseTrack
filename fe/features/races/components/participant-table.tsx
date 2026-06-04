import { Flag, UserRound } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";
import type {
  ParticipantStatus,
  RaceParticipant,
} from "@/features/races/mock-races";

export type ParticipantTableProps = {
  participants: RaceParticipant[];
};

const statusMeta: Record<
  ParticipantStatus,
  { label: string; tone: "green" | "yellow" | "slate" | "red" }
> = {
  confirmed: { label: "Confirmed", tone: "green" },
  checked_in: { label: "Checked in", tone: "teal" as "green" },
  pending_assignment: { label: "Pending", tone: "yellow" },
  scratched: { label: "Scratched", tone: "red" },
};

export function ParticipantTable({ participants }: ParticipantTableProps) {
  return (
    <section className="rounded-2xl border border-border/10 bg-[#15151E]/85 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Participants
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-foreground">
            Horse grid
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {participants.length} confirmed lanes
        </p>
      </div>
      <div className="mt-5 overflow-x-auto rounded-xl border border-border/10">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-muted/[0.04] text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Lane/order</th>
              <th className="px-4 py-3">Horse</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Jockey</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-black/10">
            {participants.map((item) => {
              const meta = statusMeta[item.status];
              return (
                <tr key={item.id} className="transition hover:bg-muted/[0.04]">
                  <td className="px-4 py-4 font-mono text-lg font-black text-foreground">
                    <Flag className="mr-2 inline size-4 text-primary" />L
                    {item.lane} · #{item.order}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-foreground">{item.horse}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.horseCode}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-white/80">{item.owner}</td>
                  <td className="px-4 py-4 text-white/80">
                    <UserRound className="mr-2 inline size-4 text-muted-foreground" />
                    {item.jockey}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge label={meta.label} tone={meta.tone} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
