"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { predictionsApi, type PredictionItem } from "@/lib/api-client";

const statusColors: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  WON: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  LOST: "text-red-400 bg-red-400/10 border-red-400/20",
  CANCELLED: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

export default function AdminBetsPage() {
  const [bets, setBets] = useState<PredictionItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBets = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await predictionsApi.list({ page, limit: 20 });
      setBets(res.data);
      setMeta(res.meta);
    } catch (e: any) { showToast(e.message ?? "Lỗi tải dữ liệu", "err"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchBets(1); }, [fetchBets]);

  const getName = (field: PredictionItem["userId"] | PredictionItem["raceId"] | PredictionItem["predictedHorseId"]) => {
    if (!field) return "—";
    if (typeof field === "object") {
      if ("fullName" in field) return field.fullName;
      if ("name" in field) return field.name;
    }
    return String(field);
  };

  const stats = bets.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Bet Management"
        title="Quản Lý Dự Đoán"
        description="Xem tất cả predictions/bets của user trong hệ thống. Kết quả được cập nhật tự động sau khi race publish."
      />

      {toast && (
        <div className={`fixed top-6 right-6 z-50 rounded-xl border px-5 py-3 text-sm font-semibold shadow-2xl ${toast.type === "ok" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
          {toast.msg}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {["PENDING", "WON", "LOST", "CANCELLED"].map(s => (
          <div key={s} className="rounded-2xl border border-white/10 bg-[#15151E]/85 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{s}</p>
            <p className="mt-2 font-mono text-3xl font-black text-white">{stats[s] ?? 0}</p>
            <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusColors[s]}`}>{s}</span>
          </div>
        ))}
      </div>

      <div className="text-sm text-muted-foreground">Tổng: <strong className="text-white">{meta.total}</strong> predictions</div>

      <div className="rounded-2xl border border-white/10 bg-[#15151E]/85 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Đang tải...</div>
        ) : bets.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Chưa có prediction nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">User</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Race</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Ngựa đặt</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Reward</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Ngày đặt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bets.map((b) => (
                  <tr key={b._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 text-sm text-white">{getName(b.userId)}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{getName(b.raceId)}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{getName(b.predictedHorseId)}</td>
                    <td className="px-5 py-4 text-center font-mono font-black text-primary">{b.rewardPoints ?? 0}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${statusColors[b.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString("vi-VN") : "—"}
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
          <button onClick={() => fetchBets(meta.page - 1)} disabled={meta.page <= 1}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white hover:bg-white/[0.06] disabled:opacity-40 transition">
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">Trang {meta.page} / {meta.totalPages}</span>
          <button onClick={() => fetchBets(meta.page + 1)} disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white hover:bg-white/[0.06] disabled:opacity-40 transition">
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </main>
  );
}
