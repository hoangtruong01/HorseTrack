"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
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
    } catch (e: any) { showToast(e.message ?? "Lỗi tải dữ liệu", "err"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchTournaments(1); }, [fetchTournaments]);

  const handleStatusChange = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await tournamentsApi.updateStatus(id, status);
      showToast(`Đã cập nhật status → ${status}`);
      await fetchTournaments(meta.page);
    } catch (e: any) { showToast(e.message, "err"); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (t: TournamentItem) => {
    if (!confirm(`Xóa giải "${t.name}"?`)) return;
    setActionLoading(t._id);
    try {
      await tournamentsApi.delete(t._id);
      showToast("Đã xóa giải đấu");
      await fetchTournaments(meta.page);
    } catch (e: any) { showToast(e.message, "err"); }
    finally { setActionLoading(null); }
  };

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Tournament Management"
        title="Quản Lý Giải Đấu"
        description="Tạo, cập nhật trạng thái và xóa giải đấu. Mỗi giải chứa nhiều races độc lập."
        actions={
          <Link
            href="/admin/tournaments/new"
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 transition"
          >
            <Plus className="size-4" /> Tạo giải mới
          </Link>
        }
      />

      {toast && (
        <div className={`fixed top-6 right-6 z-50 rounded-xl border px-5 py-3 text-sm font-semibold shadow-2xl ${toast.type === "ok" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
          {toast.msg}
        </div>
      )}

      <div className="text-sm text-muted-foreground">Tổng: <strong className="text-white">{meta.total}</strong> giải đấu</div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-white/10 bg-[#15151E]/85 p-5 h-40" />
          ))
        ) : tournaments.map((t) => (
          <div key={t._id} className="rounded-2xl border border-white/10 bg-[#15151E]/85 p-5 space-y-3 hover:border-white/20 transition">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-black uppercase text-white leading-tight">{t.name}</h3>
              <span className={`shrink-0 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${statusColors[t.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                {t.status}
              </span>
            </div>
            {t.description && <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>}
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>🏆 Prize: <strong className="text-white">{t.prize?.toLocaleString() ?? "?"} pts</strong></span>
              <span>🐴 Max: <strong className="text-white">{t.maxHorses ?? "?"} ngựa</strong></span>
              {t.startDate && <span>📅 {new Date(t.startDate).toLocaleDateString("vi-VN")}</span>}
              {t.endDate && <span>🏁 {new Date(t.endDate).toLocaleDateString("vi-VN")}</span>}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <select
                value={t.status}
                disabled={actionLoading === t._id}
                onChange={(e) => handleStatusChange(t._id, e.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-white focus:border-primary/50 focus:outline-none disabled:opacity-50"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <Link
                href={`/admin/tournaments/${t._id}`}
                className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 text-xs text-white transition flex items-center gap-1 font-semibold"
              >
                Vòng đua
              </Link>
              <button
                onClick={() => handleDelete(t)}
                disabled={actionLoading === t._id}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition disabled:opacity-40"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => fetchTournaments(meta.page - 1)} disabled={meta.page <= 1}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white hover:bg-white/[0.06] disabled:opacity-40 transition">
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">Trang {meta.page} / {meta.totalPages}</span>
          <button onClick={() => fetchTournaments(meta.page + 1)} disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white hover:bg-white/[0.06] disabled:opacity-40 transition">
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </main>
  );
}
