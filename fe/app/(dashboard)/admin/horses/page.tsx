"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { horsesApi, type HorseItem } from "@/lib/api-client";

const healthColors: Record<string, string> = {
  HEALTHY: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  SICK: "text-red-400 bg-red-400/10 border-red-400/20",
  INJURED: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  RETIRED: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};
const statusColors: Record<string, string> = {
  ACTIVE: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  INACTIVE: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  DELETED: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

export default function AdminHorsesPage() {
  const [horses, setHorses] = useState<HorseItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchHorses = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await horsesApi.list({ page, limit: 15 });
      setHorses(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      showToast(e.message ?? "Lỗi tải dữ liệu", "err");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchHorses(1); }, [fetchHorses]);

  const handleDelete = async (h: HorseItem) => {
    if (!confirm(`Xóa ngựa "${h.name}"?`)) return;
    setActionLoading(h._id);
    try {
      await horsesApi.delete(h._id);
      showToast(`Đã xóa ngựa ${h.name}`);
      await fetchHorses(meta.page);
    } catch (e: any) { showToast(e.message, "err"); }
    finally { setActionLoading(null); }
  };

  const getOwnerName = (ownerId: HorseItem["ownerId"]) => {
    if (!ownerId) return "—";
    if (typeof ownerId === "object") return ownerId.fullName;
    return ownerId;
  };

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Horse Management"
        title="Quản Lý Ngựa"
        description="Xem toàn bộ danh sách ngựa trong hệ thống. Admin có thể xóa ngựa vi phạm."
      />

      {toast && (
        <div className={`fixed top-6 right-6 z-50 rounded-xl border px-5 py-3 text-sm font-semibold shadow-2xl ${toast.type === "ok" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
          {toast.msg}
        </div>
      )}

      <div className="text-sm text-muted-foreground">Tổng: <strong className="text-white">{meta.total}</strong> ngựa</div>

      <div className="rounded-2xl border border-white/10 bg-[#15151E]/85 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Đang tải...</div>
        ) : horses.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Chưa có ngựa nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Ngựa</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Chủ ngựa</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Sức khoẻ</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {horses.map((h) => (
                  <tr key={h._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {h.imageUrl ? (
                          <img src={h.imageUrl} alt={h.name} className="size-10 rounded-xl object-cover border border-white/10" />
                        ) : (
                          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-sm">🐎</div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-white">{h.name}</p>
                          <p className="text-xs text-muted-foreground">{h.breed ?? "—"} · {h.gender ?? "—"} · {h.age ?? "?"}t</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-white">{getOwnerName(h.ownerId)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${healthColors[h.healthStatus] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                        {h.healthStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${statusColors[h.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDelete(h)}
                        disabled={actionLoading === h._id || h.status === "DELETED"}
                        className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-40 ml-auto"
                      >
                        <Trash2 className="size-3" /> Xóa
                      </button>
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
          <button onClick={() => fetchHorses(meta.page - 1)} disabled={meta.page <= 1}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white hover:bg-white/[0.06] disabled:opacity-40 transition">
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">Trang {meta.page} / {meta.totalPages}</span>
          <button onClick={() => fetchHorses(meta.page + 1)} disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white hover:bg-white/[0.06] disabled:opacity-40 transition">
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </main>
  );
}
