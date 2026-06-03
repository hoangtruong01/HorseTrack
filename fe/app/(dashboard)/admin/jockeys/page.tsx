"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TransHtml } from "@/components/i18n/trans-html";
import { jockeysApi, type JockeyItem } from "@/lib/api-client";

const STATUSES = ["ACTIVE", "UNAVAILABLE", "SUSPENDED"];
const statusColors: Record<string, string> = {
  ACTIVE: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  UNAVAILABLE: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  SUSPENDED: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function AdminJockeysPage() {
  const { t } = useTranslation();
  const [jockeys, setJockeys] = useState<JockeyItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchJockeys = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await jockeysApi.listAdmin({ page, limit: 15, status: filterStatus || undefined });
      setJockeys(res.data);
      setMeta(res.meta);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : t("pages.admin.common.loadError"), "err");
    } finally { setLoading(false); }
  }, [filterStatus, t]);

  useEffect(() => { void fetchJockeys(1); }, [fetchJockeys]);

  const handleChangeStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await jockeysApi.changeStatus(id, status);
      showToast(t("pages.admin.jockeys.toastStatus", { status }));
      await fetchJockeys(meta.page);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : t("pages.admin.common.loadError"), "err");
    }
    finally { setActionLoading(null); }
  };

  const getUserName = (userId: JockeyItem["userId"]) => {
    if (!userId) return t("pages.admin.common.dash");
    if (typeof userId === "object") return userId.fullName;
    return userId;
  };
  const getUserEmail = (userId: JockeyItem["userId"]) => {
    if (!userId || typeof userId !== "object") return "";
    return userId.email;
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
          className="rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50 px-4 py-2.5 text-sm dark:text-white text-foreground focus:border-primary/50 focus:outline-none"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">{t("pages.admin.jockeys.allStatus")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`pages.admin.jockeys.status.${s}`)}
            </option>
          ))}
        </select>
        <TransHtml
          className="text-sm text-muted-foreground flex items-center"
          i18nKey="pages.admin.jockeys.total"
          values={{ count: meta.total }}
        />
      </div>

      <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">{t("pages.admin.common.loading")}</div>
        ) : jockeys.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">{t("pages.admin.jockeys.empty")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-white/10 border-border">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.jockeys.colJockey")}</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.jockeys.colLicense")}</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.jockeys.colExperience")}</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.jockeys.colRacesWins")}</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.common.status")}</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("pages.admin.jockeys.colChange")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jockeys.map((j) => (
                  <tr key={j._id} className="hover:dark:bg-white/[0.02] bg-muted/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold dark:text-white text-foreground">{getUserName(j.userId)}</p>
                      <p className="text-xs text-muted-foreground">{getUserEmail(j.userId)}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{j.licenseNumber ?? t("pages.admin.common.dash")}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {t("pages.admin.jockeys.experience", {
                        years: j.experienceYears ?? t("pages.admin.common.dash"),
                        weight: j.weight ?? "?",
                      })}
                    </td>
                    <td className="px-5 py-4 text-sm dark:text-white text-foreground">{j.totalRaces ?? 0} / {j.wins ?? 0}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${statusColors[j.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                        {t(`pages.admin.jockeys.status.${j.status}`, { defaultValue: j.status })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <select
                        value={j.status}
                        disabled={actionLoading === j._id}
                        onChange={(e) => handleChangeStatus(j._id, e.target.value)}
                        className="rounded-lg border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50 px-3 py-1.5 text-xs dark:text-white text-foreground focus:border-primary/50 focus:outline-none disabled:opacity-50 cursor-pointer"
                      >
                        {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`pages.admin.jockeys.status.${s}`)}
            </option>
          ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => fetchJockeys(meta.page - 1)} disabled={meta.page <= 1}
            className="flex items-center gap-1.5 rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50 px-4 py-2 text-sm dark:text-white text-foreground hover:dark:bg-white/[0.06] bg-muted/50 disabled:opacity-40 transition">
            <ChevronLeft className="size-4" /> {t("pages.admin.common.prev")}
          </button>
          <span className="text-sm text-muted-foreground">
            {t("pages.admin.common.pageOf", { page: meta.page, total: meta.totalPages })}
          </span>
          <button onClick={() => fetchJockeys(meta.page + 1)} disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50 px-4 py-2 text-sm dark:text-white text-foreground hover:dark:bg-white/[0.06] bg-muted/50 disabled:opacity-40 transition">
            {t("pages.admin.common.next")} <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </main>
  );
}
