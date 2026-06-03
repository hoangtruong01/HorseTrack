"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { refereeAssignmentsApi, apiFetch, type AssignmentItem } from "@/lib/api-client";

interface RaceItem { _id: string; name: string; startTime?: string; status: string; tournamentId?: string | { _id: string } }

const statusColors: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  ACCEPTED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  DECLINED: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function AdminRefereeAssignmentsPage() {
  const { t } = useTranslation();
  const [races, setRaces] = useState<RaceItem[]>([]);
  const [selectedRace, setSelectedRace] = useState<string>("");
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function fetchRaces() {
      try {
        const res = await apiFetch<{ data: RaceItem[] }>("/races?limit=100");
        setRaces(res.data ?? []);
      } catch {
        /* ignore */
      }
    }
    void fetchRaces();
  }, []);

  const fetchAssignments = useCallback(async (raceId: string) => {
    if (!raceId) return;
    setLoading(true);
    try {
      const res = await refereeAssignmentsApi.listByRace(raceId);
      setAssignments(res.data);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : t("pages.admin.common.loadError"), "err");
    }
    finally { setLoading(false); }
  }, [t]);

  useEffect(() => {
    if (selectedRace) void fetchAssignments(selectedRace);
    else setAssignments([]);
  }, [selectedRace, fetchAssignments]);

  const handleRemove = async (id: string) => {
    try {
      await refereeAssignmentsApi.remove(id);
      showToast(t("pages.admin.refereeAssignments.toastRemoved"));
      if (selectedRace) await fetchAssignments(selectedRace);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : t("pages.admin.common.loadError"), "err");
    }
  };

  const getRefereeName = (r: AssignmentItem["refereeUserId"]) => {
    if (!r) return t("pages.admin.common.dash");
    if (typeof r === "object") return r.fullName;
    return r;
  };

  return (
    <main className="space-y-6">

      {toast && (
        <div className={`fixed top-6 right-6 z-50 rounded-xl border px-5 py-3 text-sm font-semibold shadow-2xl ${toast.type === "ok" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex gap-3">
        <select
          className="flex-1 max-w-md rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50 px-4 py-2.5 text-sm dark:text-white text-foreground focus:border-primary/50 focus:outline-none"
          value={selectedRace}
          onChange={(e) => setSelectedRace(e.target.value)}
        >
          <option value="">{t("pages.admin.refereeAssignments.selectRace")}</option>
          {races.map(r => (
            <option key={r._id} value={r._id}>{r.name} ({r.status})</option>
          ))}
        </select>
      </div>

      {selectedRace && (
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">{t("pages.admin.common.loading")}</div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <p className="text-muted-foreground text-sm">{t("pages.admin.refereeAssignments.empty")}</p>
              <p className="text-xs text-muted-foreground">{t("pages.admin.refereeAssignments.emptyHint")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-white/10 border-border">
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.refereeAssignments.colReferee")}</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.common.status")}</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.refereeAssignments.colNote")}</th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.common.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {assignments.map((a) => (
                    <tr key={a._id} className="hover:dark:bg-white/[0.02] bg-muted/50 transition-colors">
                      <td className="px-5 py-4 text-sm dark:text-white text-foreground">{getRefereeName(a.refereeUserId)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${statusColors[a.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">{a.note ?? t("pages.admin.common.dash")}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleRemove(a._id)}
                          className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 ml-auto"
                        >
                          <Trash2 className="size-3" /> {t("pages.admin.common.delete")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
