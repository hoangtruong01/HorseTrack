"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { TransHtml } from "@/components/i18n/trans-html";
import { tournamentsApi, type TournamentItem } from "@/lib/api-client";

const STATUS_OPTIONS = [
  "DRAFT", "UPCOMING", "OPEN_REGISTRATION", "REGISTRATION_CLOSED",
  "ONGOING", "COMPLETED", "CANCELLED"
];
const statusColors: Record<string, string> = {
  DRAFT: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  UPCOMING: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  OPEN_REGISTRATION: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  REGISTRATION_CLOSED: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  ONGOING: "text-primary bg-primary/10 border-primary/20",
  COMPLETED: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  CANCELLED: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function AdminTournamentsPage() {
  const { t } = useTranslation();
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTournaments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await tournamentsApi.list({ page, limit: 10 });
      setTournaments(res.data);
      setMeta(res.meta);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : t("pages.admin.common.loadError"), "err");
    }
    finally { setLoading(false); }
  }, [t]);

  useEffect(() => { void fetchTournaments(1); }, [fetchTournaments]);

  const handleStatusChange = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await tournamentsApi.updateStatus(id, status);
      showToast(t("pages.admin.tournaments.toastStatus", { status }));
      await fetchTournaments(meta.page);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : t("pages.admin.common.loadError"), "err");
    }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (item: TournamentItem) => {
    if (!confirm(t("pages.admin.tournaments.confirmDelete", { name: item.name }))) return;
    setActionLoading(item._id);
    try {
      await tournamentsApi.delete(item._id);
      showToast(t("pages.admin.tournaments.toastDeleted"));
      await fetchTournaments(meta.page);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : t("pages.admin.common.loadError"), "err");
    }
    finally { setActionLoading(null); }
  };

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow={t("pages.admin.tournaments.eyebrow")}
        title={t("pages.admin.tournaments.title")}
        description={t("pages.admin.tournaments.description")}
        actions={
          <Link
            href="/admin/tournaments/new"
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition"
          >
            <Plus className="size-4" /> {t("pages.admin.tournaments.createNew")}
          </Link>
        }
      />

      {toast && (
        <div className={`fixed top-6 right-6 z-50 rounded-xl border px-5 py-3 text-sm font-semibold shadow-2xl ${toast.type === "ok" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
          {toast.msg}
        </div>
      )}

      <TransHtml
        className="text-sm text-muted-foreground"
        i18nKey="pages.admin.tournaments.total"
        values={{ count: meta.total }}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5 h-40" />
          ))
        ) : tournaments.map((item) => (
          <div key={item._id} className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5 space-y-3 hover:dark:border-white/20 border-border transition">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-black uppercase dark:text-white text-foreground leading-tight">{item.name}</h3>
              <span className={`shrink-0 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${statusColors[item.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                {item.status}
              </span>
            </div>
            {item.description && <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>}
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>🏆 {t("pages.admin.tournaments.prize")}: <strong className="dark:text-white text-foreground">{item.prize?.toLocaleString() ?? "?"} {t("pages.admin.tournaments.pts")}</strong></span>
              <span>🐴 {t("pages.admin.tournaments.maxHorses")}: <strong className="dark:text-white text-foreground">{item.maxHorses ?? "?"} {t("pages.admin.tournaments.horsesUnit")}</strong></span>
              {item.startDate && <span>📅 {new Date(item.startDate).toLocaleDateString("vi-VN")}</span>}
              {item.endDate && <span>🏁 {new Date(item.endDate).toLocaleDateString("vi-VN")}</span>}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <select
                value={item.status}
                disabled={actionLoading === item._id}
                onChange={(e) => handleStatusChange(item._id, e.target.value)}
                className="flex-1 rounded-lg border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50 px-2 py-1.5 text-xs dark:text-white text-foreground focus:border-primary/50 focus:outline-none disabled:opacity-50"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button
                onClick={() => handleDelete(item)}
                disabled={actionLoading === item._id}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition disabled:opacity-40"
              >
                {t("pages.admin.common.delete")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => fetchTournaments(meta.page - 1)} disabled={meta.page <= 1}
            className="flex items-center gap-1.5 rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50 px-4 py-2 text-sm dark:text-white text-foreground hover:dark:bg-white/[0.06] bg-muted/50 disabled:opacity-40 transition">
            <ChevronLeft className="size-4" /> {t("pages.admin.common.prev")}
          </button>
          <span className="text-sm text-muted-foreground">
            {t("pages.admin.common.pageOf", { page: meta.page, total: meta.totalPages })}
          </span>
          <button onClick={() => fetchTournaments(meta.page + 1)} disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50 px-4 py-2 text-sm dark:text-white text-foreground hover:dark:bg-white/[0.06] bg-muted/50 disabled:opacity-40 transition">
            {t("pages.admin.common.next")} <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </main>
  );
}
