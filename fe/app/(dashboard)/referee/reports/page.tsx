"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  Flag,
  Home,
  PlusCircle,
  ShieldCheck,
  Siren,
  Sparkles,
  User,
  CheckCircle2,
  Trash2,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { normalizeLanguage } from "@/lib/i18n-language";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

// Types
type RaceInfo = {
  _id: string;
  name: string;
  startTime: string;
  status: string;
};

type Assignment = {
  _id: string;
  raceId: RaceInfo;
};

type RefereeReport = {
  _id: string;
  raceId: {
    _id: string;
    name: string;
  };
  refereeId: {
    _id: string;
    fullName: string;
  };
  horseId?: {
    _id: string;
    name: string;
  };
  type: "PRE_RACE" | "POST_RACE";
  description: string;
  violation?: string;
  penalty?: string;
  createdAt: string;
};

type RaceCheck = {
  _id: string;
  horseId: {
    _id: string;
    name: string;
  };
};

export default function RefereeReportsPage() {
  const { t, i18n } = useTranslation();
  const f = "pages.referee.reports.form";
  const dateLocale = normalizeLanguage(i18n.language) === "en" ? "en-US" : "vi-VN";
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [reports, setReports] = useState<Record<string, RefereeReport[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expanded race IDs for viewing reports
  const [expandedRaces, setExpandedRaces] = useState<Record<string, boolean>>({});

  // Form states
  const [selectedRaceId, setSelectedRaceId] = useState("");
  const [horsesForSelectedRace, setHorsesForSelectedRace] = useState<RaceCheck[]>([]);
  const [selectedHorseId, setSelectedHorseId] = useState("");
  const [reportType, setReportType] = useState<"PRE_RACE" | "POST_RACE">("POST_RACE");
  const [description, setDescription] = useState("");
  const [violation, setViolation] = useState("");
  const [penalty, setPenalty] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all accepted assignments for this referee
      const res = await fetch("/api/referee/referee-assignments/my-assignments?limit=100");
      if (!res.ok) throw new Error(t("pages.referee.reports.fetchFailed"));
      const resData = await res.json();
      const myAssignments = (resData.data?.data || []).filter(
        (a: any) => a.status === "accepted" && a.raceId
      );
      setAssignments(myAssignments);

      // 2. Fetch reports for each race in parallel
      const reportsMap: Record<string, RefereeReport[]> = {};
      await Promise.all(
        myAssignments.map(async (a: any) => {
          const rId = a.raceId._id;
          const repRes = await fetch(`/api/referee/referee-reports/race/${rId}`);
          if (repRes.ok) {
            const repData = await repRes.json();
            reportsMap[rId] = repData.data || [];
          }
        })
      );
      setReports(reportsMap);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t("pages.referee.reports.fetchError"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch horses when selected race changes in create report form
  useEffect(() => {
    if (!selectedRaceId) {
      setHorsesForSelectedRace([]);
      return;
    }

    const fetchHorses = async () => {
      try {
        const res = await fetch(`/api/referee/race-checks/race/${selectedRaceId}`);
        if (res.ok) {
          const resData = await res.json();
          setHorsesForSelectedRace(resData.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHorses();
  }, [selectedRaceId]);

  const toggleExpand = (raceId: string) => {
    setExpandedRaces((prev) => ({
      ...prev,
      [raceId]: !prev[raceId],
    }));
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRaceId) {
      toast.error(t("pages.referee.reports.selectRaceRequired"));
      return;
    }
    if (!description.trim()) {
      toast.error(t("pages.referee.reports.descriptionRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        raceId: selectedRaceId,
        horseId: selectedHorseId || undefined,
        type: reportType,
        description,
        violation: violation || undefined,
        penalty: penalty || undefined,
      };

      const res = await fetch("/api/referee/referee-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || t("pages.referee.reports.submitFailed"));
      }

      toast.success(t("pages.referee.reports.submitSuccess"));
      // Reset form
      setSelectedRaceId("");
      setSelectedHorseId("");
      setReportType("POST_RACE");
      setDescription("");
      setViolation("");
      setPenalty("");

      // Reload
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || t("pages.referee.reports.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
        {/* Reports Create Form */}
        <section className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E] bg-card p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider dark:text-white text-foreground flex items-center gap-1.5">
            <PlusCircle className="size-4 text-primary" />
            {t(`${f}.createTitle`)}
          </h3>

          <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold uppercase dark:text-white/50 text-muted-foreground">{t(`${f}.selectRace`)}</label>
                <select
                  value={selectedRaceId}
                  onChange={(e) => setSelectedRaceId(e.target.value)}
                  className="w-full rounded-lg border dark:border-white/10 border-border dark:bg-white/5 bg-muted/50 px-3 py-2 text-xs dark:text-white text-foreground focus:border-primary focus:outline-none"
                  required
                >
                  <option value="" className="dark:bg-[#15151E] bg-card">{t(`${f}.selectRacePlaceholder`)}</option>
                  {assignments.map((a) => (
                    <option key={a.raceId?._id} value={a.raceId?._id} className="dark:bg-[#15151E] bg-card">
                      {a.raceId?.name} ({a.raceId?.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase dark:text-white/50 text-muted-foreground">{t(`${f}.reportType`)}</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full rounded-lg border dark:border-white/10 border-border dark:bg-white/5 bg-muted/50 px-3 py-2 text-xs dark:text-white text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="POST_RACE" className="dark:bg-[#15151E] bg-card">{t(`${f}.typePostRace`)}</option>
                  <option value="PRE_RACE" className="dark:bg-[#15151E] bg-card">{t(`${f}.typePreRace`)}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase dark:text-white/50 text-muted-foreground">{t(`${f}.horseOptional`)}</label>
                <select
                  value={selectedHorseId}
                  onChange={(e) => setSelectedHorseId(e.target.value)}
                  className="w-full rounded-lg border dark:border-white/10 border-border dark:bg-white/5 bg-muted/50 px-3 py-2 text-xs dark:text-white text-foreground focus:border-primary focus:outline-none"
                  disabled={!selectedRaceId}
                >
                  <option value="" className="dark:bg-[#15151E] bg-card">{t(`${f}.horsePlaceholder`)}</option>
                  {horsesForSelectedRace.map((h) => (
                    <option key={h.horseId?._id} value={h.horseId?._id} className="dark:bg-[#15151E] bg-card">
                      {h.horseId?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase dark:text-white/50 text-muted-foreground">{t(`${f}.violationOptional`)}</label>
                <input
                  type="text"
                  value={violation}
                  onChange={(e) => setViolation(e.target.value)}
                  placeholder={t(`${f}.violationPlaceholder`)}
                  className="w-full rounded-lg border dark:border-white/10 border-border dark:bg-white/5 bg-muted/50 px-3 py-2 text-xs dark:text-white text-foreground placeholder-white/20 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase dark:text-white/50 text-muted-foreground">{t(`${f}.penaltyOptional`)}</label>
                <input
                  type="text"
                  value={penalty}
                  onChange={(e) => setPenalty(e.target.value)}
                  placeholder={t(`${f}.penaltyPlaceholder`)}
                  className="w-full rounded-lg border dark:border-white/10 border-border dark:bg-white/5 bg-muted/50 px-3 py-2 text-xs dark:text-white text-foreground placeholder-white/20 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase dark:text-white/50 text-muted-foreground">{t(`${f}.description`)}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t(`${f}.descriptionPlaceholder`)}
                rows={4}
                className="w-full rounded-lg border dark:border-white/10 border-border dark:bg-white/5 bg-muted/50 px-3 py-2 text-xs dark:text-white text-foreground placeholder-white/20 focus:border-primary focus:outline-none resize-none"
                required
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || !selectedRaceId}
                className="rounded-full bg-primary hover:bg-primary-dark font-black uppercase text-xs h-10 px-6 text-white"
              >
                {isSubmitting ? t(`${f}.submitting`) : t(`${f}.submit`)}
              </Button>
            </div>
          </form>
        </section>

        {/* Reports Queue List */}
        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider dark:text-white text-foreground">
            {t(`${f}.archiveTitle`, { count: assignments.length })}
          </h3>

          {assignments.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed dark:border-white/10 border-border dark:bg-[#15151E]/40 bg-card dark:text-white/40 text-muted-foreground text-xs">
              {t(`${f}.archiveEmpty`)}
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => {
                if (!assignment.raceId) return null;
                const raceId = assignment.raceId._id;
                const raceReports = reports[raceId] || [];
                const isExpanded = expandedRaces[raceId] || false;

                return (
                  <article
                    key={raceId}
                    className="rounded-xl border dark:border-white/5 border-border dark:bg-[#15151E]/95 bg-card shadow overflow-hidden"
                  >
                    {/* Header bar click to toggle expansion */}
                    <div
                      onClick={() => toggleExpand(raceId)}
                      className="p-4 flex items-center justify-between cursor-pointer dark:bg-black/25 bg-muted/20 hover:dark:bg-black/40 bg-muted/20 transition select-none"
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black uppercase dark:text-white text-foreground leading-tight">
                          {assignment.raceId.name}
                        </h4>
                        <p className="text-[10px] dark:text-white/40 text-muted-foreground font-bold uppercase">
                          Biên bản lưu vết: <strong className="text-teal-400">{raceReports.length} bản</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] dark:text-white/40 text-muted-foreground uppercase font-black">
                          {assignment.raceId.status}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="size-4 dark:text-white/50 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="size-4 dark:text-white/50 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Reports List for this race */}
                    {isExpanded && (
                      <div className="p-4 border-t dark:border-white/5 border-border space-y-4 dark:bg-black/10 bg-muted/20">
                        {raceReports.length === 0 ? (
                          <p className="text-xs dark:text-white/45 text-muted-foreground italic py-2">
                            Cuộc đua này chưa có biên bản nào được lập.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {raceReports.map((rep) => (
                              <div
                                key={rep._id}
                                className="p-3.5 rounded-lg border dark:border-white/5 border-border dark:bg-[#15151E] bg-card space-y-2 text-xs"
                              >
                                <div className="flex justify-between items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                    rep.type === "PRE_RACE" 
                                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" 
                                      : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                                  }`}>
                                    {rep.type === "PRE_RACE" ? "TRƯỚC TRẬN" : "SAU TRẬN"}
                                  </span>
                                  <span className="text-[9px] dark:text-white/45 text-muted-foreground">
                                    {new Date(rep.createdAt).toLocaleString("vi-VN")}
                                  </span>
                                </div>

                                {rep.horseId && (
                                  <p className="text-[10px] font-bold dark:text-white/80 text-muted-foreground">
                                    Chiến mã liên quan: <span className="text-teal-400 font-bold uppercase">{rep.horseId.name}</span>
                                  </p>
                                )}

                                <p className="dark:text-white/80 text-muted-foreground leading-relaxed font-medium">
                                  {rep.description}
                                </p>

                                {(rep.violation || rep.penalty) && (
                                  <div className="mt-2 grid grid-cols-2 gap-2 p-2 rounded dark:bg-black/25 bg-muted/20 text-[10px]">
                                    {rep.violation && (
                                      <p className="dark:text-white/60 text-muted-foreground">
                                        Lỗi vi phạm: <strong className="text-yellow-400 font-bold">{rep.violation}</strong>
                                      </p>
                                    )}
                                    {rep.penalty && (
                                      <p className="dark:text-white/60 text-muted-foreground">
                                        Hình phạt: <strong className="text-red-400 font-bold">{rep.penalty}</strong>
                                      </p>
                                    )}
                                  </div>
                                )}

                                <p className="text-[9px] dark:text-white/40 text-muted-foreground pt-1.5 border-t dark:border-white/5 border-border text-right uppercase font-bold">
                                  Ký tên: {rep.refereeId?.fullName}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="pt-2 flex justify-end">
                          <Button asChild variant="outline" className="h-9 px-4 rounded-full text-xs font-bold uppercase dark:border-white/10 border-border hover:dark:bg-white/5 bg-muted/50 dark:text-white text-foreground hover:dark:text-white text-foreground">
                            <Link href={`/referee/races/${assignment.raceId._id}`}>
                              Đi tới Cuộc Đua <ArrowRight className="size-3.5 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
