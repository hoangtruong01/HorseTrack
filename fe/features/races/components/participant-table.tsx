"use client";

import { Flag, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";

import { StatusBadge } from "@/components/ui/status-badge";
import type {
  ParticipantStatus,
  RaceParticipant,
} from "@/features/races/mock-races";

export type ParticipantTableProps = {
  participants: RaceParticipant[];
};

const statusTone: Record<
  ParticipantStatus,
  "green" | "yellow" | "slate" | "red"
> = {
  confirmed: "green",
  checked_in: "green",
  pending_assignment: "yellow",
  scratched: "red",
};

export function ParticipantTable({ participants }: ParticipantTableProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("pages.admin.mockRaces.participantsEyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight dark:text-white text-foreground">
            {t("pages.admin.mockRaces.horseGrid")}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("pages.admin.mockRaces.lanesCount", { count: participants.length })}
        </p>
      </div>
      <div className="mt-5 overflow-x-auto rounded-xl border dark:border-white/10 border-border">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="dark:bg-white/[0.04] bg-muted/50 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">{t("pages.admin.mockRaces.colLane")}</th>
              <th className="px-4 py-3">{t("pages.admin.mockRaces.colHorse")}</th>
              <th className="px-4 py-3">{t("pages.admin.mockRaces.colOwner")}</th>
              <th className="px-4 py-3">{t("pages.admin.mockRaces.colJockey")}</th>
              <th className="px-4 py-3">{t("pages.admin.mockRaces.colStatus")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 dark:bg-black/10 bg-muted/20">
            {participants.map((item) => (
              <tr key={item.id} className="transition hover:dark:bg-white/[0.04] bg-muted/50">
                <td className="px-4 py-4 font-mono text-lg font-black dark:text-white text-foreground">
                  <Flag className="mr-2 inline size-4 text-primary" />L
                  {item.lane} · #{item.order}
                </td>
                <td className="px-4 py-4">
                  <p className="font-bold dark:text-white text-foreground">{item.horse}</p>
                  <p className="text-xs text-muted-foreground">{item.horseCode}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="inline-flex items-center gap-2 font-semibold dark:text-white/90 text-muted-foreground">
                    <UserRound className="size-4 text-primary" />
                    {item.owner}
                  </p>
                </td>
                <td className="px-4 py-4 dark:text-white/90 text-muted-foreground">{item.jockey}</td>
                <td className="px-4 py-4">
                  <StatusBadge
                    label={t(`pages.admin.mockRaces.participantStatus.${item.status}`)}
                    tone={statusTone[item.status]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
