"use client";

/**
 * ====================================================================
 * CHỨC NĂNG: QUẢN LÝ ĐẶT CƯỢC (BETTING MANAGEMENT)
 * QUYỀN SỬ DỤNG: ADMIN
 * MÔ TẢ:
 * - Giám sát tất cả vé cược của khán giả, thống kê doanh thu cược và quản lý tỷ lệ cược của từng trận.
 * ====================================================================
 */
import Image from "next/image";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { predictionsApi, type PredictionItem } from "@/lib/api-client";

const statusColors: Record<string, string> = {
  PENDING: "text-amber-700 dark:text-yellow-400 bg-amber-500/15 dark:bg-yellow-400/10 border-amber-500/30 dark:border-yellow-400/20",
  WON: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 dark:bg-emerald-400/10 border-emerald-500/30 dark:border-emerald-400/20",
  LOST: "text-rose-700 dark:text-red-400 bg-rose-500/15 dark:bg-red-400/10 border-rose-500/30 dark:border-red-400/20",
  CANCELLED: "text-slate-700 dark:text-slate-400 bg-slate-500/15 dark:bg-slate-400/10 border-slate-500/30 dark:border-slate-400/20",
};

export default function AdminBetsPage() {
  const [bets, setBets] = useState<PredictionItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchBets = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await predictionsApi.list({ page, limit: 100 });
      setBets(res.data);
      setMeta(res.meta);
    } catch (e) { toast.error((e as Error).message ?? "Lỗi tải dữ liệu"); }
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

  const filteredBets = bets.filter((b) => {
    if (statusFilter && (b.status || "").toUpperCase() !== statusFilter.toUpperCase()) {
      return false;
    }
    if (!search) return true;
    const q = search.toLowerCase();
    const userName = getName(b.userId).toLowerCase();
    const raceName = getName(b.raceId).toLowerCase();
    const horseName = getName(b.predictedHorseId).toLowerCase();
    return userName.includes(q) || raceName.includes(q) || horseName.includes(q);
  });

  const hasActiveFilters = Boolean(search || statusFilter);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Bet Management"
        title="Quản Lý Dự Đoán"
        description="Xem tất cả predictions/bets của user trong hệ thống. Kết quả được cập nhật tự động sau khi race publish."
      />

      {/* Stats cards - Clickable to filter */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {["PENDING", "WON", "LOST", "CANCELLED"].map(s => {
          const isActive = statusFilter === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(isActive ? "" : s)}
              className={`rounded-2xl border bg-card p-4 text-left transition duration-200 cursor-pointer ${
                isActive ? "border-primary ring-2 ring-primary/20 shadow-md" : "border-border hover:border-primary/40"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{s}</p>
              <p className="mt-2 font-mono text-3xl font-black text-foreground">{stats[s] ?? 0}</p>
              <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusColors[s]}`}>{s}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar bộ lọc */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo user, cuộc đua, ngựa cược..."
              className="w-full rounded-xl border border-border bg-muted/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">PENDING (Chờ kết quả)</option>
            <option value="WON">WON (Thắng cược)</option>
            <option value="LOST">LOST (Thua cược)</option>
            <option value="CANCELLED">CANCELLED (Đã hủy)</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted px-3.5 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted/80 hover:text-foreground transition"
          >
            <X className="size-3.5" />
            Xóa bộ lọc
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Hiển thị: <strong className="text-foreground font-semibold">{filteredBets.length}</strong> / {meta.total} predictions</div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-foreground/55">
            <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
            <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải...</p>
          </div>
        ) : filteredBets.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Không tìm thấy prediction phù hợp.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">User</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Race</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Ngựa đặt</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Reward</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Ngày đặt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBets.map((b) => (
                  <tr key={b._id} className="hover:bg-muted transition-colors">
                    <td className="px-5 py-4 text-sm text-foreground">{getName(b.userId)}</td>
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
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition">
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">Trang {meta.page} / {meta.totalPages}</span>
          <button onClick={() => fetchBets(meta.page + 1)} disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition">
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </main>
  );
}


