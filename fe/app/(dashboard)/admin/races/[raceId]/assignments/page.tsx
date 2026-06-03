"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ShieldCheck, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getRaceById } from "@/features/races/mock-races";

export default function AdminRaceAssignmentsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const raceId = typeof params.raceId === "string" ? params.raceId : "";
  const race = getRaceById(raceId);

  return (
    <main className="space-y-6">
      
      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5 sm:p-6">
          <ShieldCheck className="size-6 text-primary" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("pages.admin.raceAssignments.refereeAssignment")}
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase dark:text-white text-foreground">
            {race.referee.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {race.referee.license} · {race.referee.status}
          </p>
          <StatusBadge className="mt-4" label={t("pages.admin.raceAssignments.displayOnly")} tone="slate" />
        </div>
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("pages.admin.raceAssignments.jockeyLanes")}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {race.participants.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border dark:border-white/10 border-border dark:bg-black/20 bg-muted/20 p-4"
              >
                <div className="flex items-center gap-3">
                  <UserRound className="size-5 text-primary" />
                  <div>
                    <h3 className="font-black uppercase dark:text-white text-foreground">
                      {item.jockey}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.horse} · {t("pages.admin.raceAssignments.lane", { lane: item.lane })}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
