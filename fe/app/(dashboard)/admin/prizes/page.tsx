"use client";

/**
 * ====================================================================
 * CHỨC NĂNG: CẤU HÌNH GIẢI THƯỞNG (PRIZES CONFIGURATION)
 * QUYỀN SỬ DỤNG: ADMIN
 * MÔ TẢ:
 * - Cấu hình cơ cấu giải thưởng cho các vị trí Top 1, Top 2, Top 3 trong từng trận đấu và giải đấu.
 * ====================================================================
 */
import Image from "next/image";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { prizesApi, type PrizeItem } from "@/lib/api-client";

const statusColors: Record<string, string> = {
  PENDING: "text-amber-700 dark:text-yellow-400 bg-amber-500/15 dark:bg-yellow-400/10 border-amber-500/30 dark:border-yellow-400/20",
  PAID: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 dark:bg-emerald-400/10 border-emerald-500/30 dark:border-emerald-400/20",
};

export default function AdminPrizesPage() {
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPrizes = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await prizesApi.list({ page, limit: 100 });
      setPrizes(res.data);
      setMeta(res.meta);
    } catch (e) { toast.error((e as Error).message ?? "Lỗi tải dữ liệu"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchPrizes(1); }, [fetchPrizes]);

  const handleStatusChange = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await prizesApi.updateStatus(id, status);
      toast.success(`Cập nhật status → ${status}`);
      await fetchPrizes(meta.page);
    } catch (e) { toast.error((e as Error).message); }
    finally { setActionLoading(null); }
  };

  const getName = (field: PrizeItem["ownerId"] | PrizeItem["raceId"] | PrizeItem["horseId"] | PrizeItem["tournamentId"]) => {
    if (!field) return "—";
    if (typeof field === "object") {
      if ("fullName" in field) return field.fullName;
      if ("name" in field) return field.name;
    }
    return String(field);
  };

  const filteredPrizes = prizes.filter((p) => {
    if (statusFilter && (p.status || "").toUpperCase() !== statusFilter.toUpperCase()) {
      return false;
    }
    if (rankFilter && String(p.rank) !== rankFilter) {
      return false;
    }
    if (!search) return true;
    const q = search.toLowerCase();
    const ownerName = getName(p.ownerId).toLowerCase();
    const raceName = getName(p.raceId).toLowerCase();
    const horseName = getName(p.horseId).toLowerCase();
    return ownerName.includes(q) || raceName.includes(q) || horseName.includes(q);
  });

  const hasActiveFilters = Boolean(search || statusFilter || rankFilter);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setRankFilter("");
  };

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Prize Management"
        title="Quản Lý Giải Thưởng"
        description="Xem tất cả prizes được tạo tự động (70% owner / 30% jockey) sau khi race kết thúc. Admin có thể cập nhật trạng thái thanh toán."
      />

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
              placeholder="Tìm theo người nhận, trận đua, ngựa..."
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
            className="w-full sm:w-44 rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">PENDING (Chờ chi)</option>
            <option value="PAID">PAID (Đã thanh toán)</option>
          </select>

          {/* Rank Dropdown */}
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className="w-full sm:w-40 rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          >
            <option value="">Tất cả thứ hạng</option>
            <option value="1">🥇 Hạng 1</option>
            <option value="2">🥈 Hạng 2</option>
            <option value="3">🥉 Hạng 3</option>
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
        <div>Hiển thị: <strong className="text-foreground font-semibold">{filteredPrizes.length}</strong> / {meta.total} giải thưởng</div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-foreground/55">
  <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
  <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải...</p>
</div>
        ) : filteredPrizes.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Không tìm thấy giải thưởng phù hợp.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Người nhận</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Race</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Ngựa</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Số điểm</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPrizes.map((p) => (
                  <tr key={p._id} className="hover:bg-muted transition-colors">
                    <td className="px-5 py-4 text-sm text-foreground">{getName(p.ownerId)}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{getName(p.raceId)}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{getName(p.horseId)}</td>
                    <td className="px-5 py-4 text-center font-mono font-black text-primary">{p.amount.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${statusColors[p.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {p.status === "PENDING" && (
                        <button
                          onClick={() => handleStatusChange(p._id, "PAID")}
                          disabled={actionLoading === p._id}
                          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-40"
                        >
                          Đánh dấu PAID
                        </button>
                      )}
                      {p.status === "PAID" && (
                        <span className="text-xs text-muted-foreground">Đã thanh toán {p.paidAt ? new Date(p.paidAt).toLocaleDateString("vi-VN") : ""}</span>
                      )}
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
          <button onClick={() => fetchPrizes(meta.page - 1)} disabled={meta.page <= 1}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition">
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">Trang {meta.page} / {meta.totalPages}</span>
          <button onClick={() => fetchPrizes(meta.page + 1)} disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition">
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </main>
  );
}


