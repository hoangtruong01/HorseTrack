"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { normalizeLanguage } from "@/lib/i18n-language";
import { toast } from "sonner";

type RaceInfo = {
  _id: string;
  name: string;
  startTime: string;
  status: string;
};

type Assignment = {
  _id: string;
  status: string;
  raceId: RaceInfo;
};

export default function RefereeMonitoringWorkspacePage() {
  const { t, i18n } = useTranslation();
  const dateLocale = normalizeLanguage(i18n.language) === "en" ? "en-US" : "vi-VN";
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch("/api/referee/referee-assignments/my-assignments?limit=100");
        if (!res.ok) throw new Error(t("pages.referee.reports.fetchFailed"));
        const resData = await res.json();
        // Only accepted assignments
        const list = (resData.data?.data || []).filter(
          (a: any) => a.status === "accepted" && a.raceId
        );
        setAssignments(list);
      } catch (err: any) {
        toast.error(err.message || t("pages.referee.reports.fetchError"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return t("pages.referee.common.dateUnknown");
    const d = new Date(dateStr);
    return `${d.toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" })} ${t("pages.referee.common.dateAt")} ${d.toLocaleDateString(dateLocale)}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">

      {assignments.length === 0 ? (
        <section className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed dark:border-white/10 border-border dark:bg-[#15151E] bg-card max-w-lg mx-auto space-y-3">
          <div className="size-12 rounded-full border dark:border-white/10 border-border flex items-center justify-center dark:text-white/30 text-muted-foreground">
            <Activity className="size-6" />
          </div>
          <h4 className="font-bold dark:text-white text-foreground uppercase text-sm">{t("pages.referee.common.noRacesTitle")}</h4>
          <p className="text-xs dark:text-white/40 text-muted-foreground leading-relaxed">
            {t("pages.referee.monitoring.emptyDescription")}
          </p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {assignments.map((a) => {
            const isLive = a.raceId.status === "LIVE";
            const isReady = a.raceId.status === "READY";
            const isActive = isLive || isReady;
            
            return (
              <article
                key={a._id}
                className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 shadow transition ${
                  isLive
                    ? "border-red-500/20 dark:bg-[linear-gradient(135deg,rgba(225,6,0,0.06),rgba(21,21,30,0.95))] bg-card"
                    : isReady
                      ? "border-emerald-500/20 dark:bg-[linear-gradient(135deg,rgba(16,185,129,0.06),rgba(21,21,30,0.95))] bg-card"
                      : "dark:border-white/5 border-border dark:bg-[#15151E]/90 bg-card hover:dark:border-white/15 border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <StatusBadge
                    label={
                      a.raceId.status === "SCHEDULED" ? t("pages.referee.preRace.statusNotOpen") :
                      a.raceId.status === "CHECKING" ? t("pages.referee.preRace.statusInspecting") :
                      a.raceId.status === "READY" ? t("pages.referee.preRace.statusReady") :
                      a.raceId.status === "LIVE" ? t("pages.referee.common.running") : t("pages.referee.monitoring.statusFinished")
                    }
                    tone={
                      isLive ? "red" :
                      isReady ? "green" :
                      a.raceId.status === "CHECKING" ? "yellow" : "slate"
                    }
                    pulse={isLive || isReady}
                  />
                  <span className="text-[10px] dark:text-white/40 text-muted-foreground font-bold uppercase">
                    Giám sát trực tiếp
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase dark:text-white text-foreground leading-tight">
                    {a.raceId.name}
                  </h3>
                  <p className="text-[10px] dark:text-white/50 text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3 text-primary shrink-0" />
                    Giờ xuất phát: {formatDateTime(a.raceId.startTime)}
                  </p>
                </div>

                <div className="pt-2 border-t dark:border-white/5 border-border flex justify-end">
                  <Button
                    asChild
                    className={`h-9 px-4 rounded-full text-xs font-black uppercase ${
                      isActive
                        ? "bg-primary hover:bg-primary-dark text-white"
                        : "dark:bg-white/5 bg-muted/50 border dark:border-white/10 border-border hover:dark:bg-white/10 bg-muted/50 text-white"
                    }`}
                  >
                    <Link href={`/referee/races/${a.raceId._id}`}>
                      {isLive ? t("pages.referee.monitoring.openMonitoringRoom") : isReady ? t("pages.referee.monitoring.activateStart") : t("pages.referee.common.viewDetails")}
                      <ArrowRight className="size-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
