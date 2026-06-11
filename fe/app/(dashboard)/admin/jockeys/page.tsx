"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { jockeysApi, type JockeyItem } from "@/lib/api-client";

const STATUSES = ["ACTIVE", "UNAVAILABLE", "SUSPENDED"];
const statusColors: Record<string, string> = {
  ACTIVE: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  UNAVAILABLE: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  SUSPENDED: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function AdminJockeysPage() {
  const [jockeys, setJockeys] = useState<JockeyItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchJockeys = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await jockeysApi.listAdmin({ page, limit: 15, status: filterStatus || undefined });
      setJockeys(res.data);
      setMeta(res.meta);
    } catch (e) {
      toast.error((e as Error).message ?? "Lỗi tải dữ liệu");
    } finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { void fetchJockeys(1); }, [fetchJockeys]);

  const handleChangeStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await jockeysApi.changeStatus(id, status);
      toast.success(`Đã cập nhật status → ${status}`);
      await fetchJockeys(meta.page);
    } catch (e) { toast.error((e as Error).message); }
    finally { setActionLoading(null); }
  };

  const getUserName = (userId: JockeyItem["userId"]) => {
    if (!userId) return "—";
    if (typeof userId === "object") return userId.fullName;
    return userId;
  };
  const getUserEmail = (userId: JockeyItem["userId"]) => {
    if (!userId || typeof userId !== "object") return "";
    return userId.email;
  };

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Jockey Management"
        title="Quản Lý Jockey"
        description="Xem toàn bộ jockey profiles bao gồm cả inactive/suspended. Thay đổi trạng thái ngay tại đây."
      />

      <div className="flex gap-3">
        <select
          className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="" className="bg-card text-foreground">Tất cả Status</option>
          {STATUSES.map(s => <option key={s} value={s} className="bg-card text-foreground">{s}</option>)}
        </select>
        <div className="text-sm text-muted-foreground flex items-center">
          Tổng: <strong className="text-foreground ml-1">{meta.total}</strong>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Đang tải...</div>
        ) : jockeys.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Không có jockey nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Jockey</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">License</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Kinh nghiệm</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Races / Wins</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Thay đổi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jockeys.map((j) => (
                  <tr key={j._id} className="hover:bg-muted transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-foreground">{getUserName(j.userId)}</p>
                      <p className="text-xs text-muted-foreground">{getUserEmail(j.userId)}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{j.licenseNumber ?? "—"}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{j.experienceYears ?? "—"} năm · {j.weightKg ?? "?"}kg</td>
                    <td className="px-5 py-4 text-sm text-foreground">{j.totalRaces ?? 0} / {j.wins ?? 0}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${statusColors[j.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <select
                        value={j.status}
                        disabled={actionLoading === j._id}
                        onChange={(e) => handleChangeStatus(j._id, e.target.value)}
                        className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-foreground focus:border-primary/50 focus:outline-none disabled:opacity-50 cursor-pointer"
                      >
                        {STATUSES.map(s => <option key={s} value={s} className="bg-card text-foreground">{s}</option>)}
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
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition">
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">Trang {meta.page} / {meta.totalPages}</span>
          <button onClick={() => fetchJockeys(meta.page + 1)} disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition">
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </main>
  );
}


