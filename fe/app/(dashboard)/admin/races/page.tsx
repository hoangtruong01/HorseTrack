"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Flag, Loader2, RefreshCw, Plus, Trash2, Search, Trophy
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { racesApi, type RaceItem } from "@/lib/api-client";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  SCHEDULED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  CHECKING: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  READY: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  LIVE: "text-rose-400 bg-rose-400/10 border-rose-400/20 animate-pulse",
  FINISHED: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  RESULT_PUBLISHED: "text-teal-400 bg-teal-400/10 border-teal-400/20",
  CANCELLED: "text-red-400 bg-red-400/10 border-red-400/20",
};

const STATUS_OPTIONS = [
  "SCHEDULED", "CHECKING", "READY", "LIVE", "FINISHED", "RESULT_PUBLISHED", "CANCELLED",
];

const STATUS_FILTERS = ["ALL", "SCHEDULED", "CHECKING", "READY", "LIVE", "FINISHED", "RESULT_PUBLISHED", "CANCELLED"];

export default function AdminRacesPage() {
  const [races, setRaces] = useState<RaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchRaces = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await racesApi.list({ page: p, limit: 20 });
      setRaces(res.data || []);
      setMeta({ total: res.meta?.total || 0, page: res.meta?.page || 1, totalPages: res.meta?.totalPages || 1 });
    } catch (e: any) {
      toast.error(e.message || "Không thể lấy danh sách trận đua");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRaces(page);
  }, [page, fetchRaces]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      await racesApi.updateStatus(id, newStatus);
      toast.success(`Đã cập nhật trạng thái: ${newStatus}`);
      void fetchRaces(page);
    } catch (e: any) {
      toast.error(e.message || "Cập nhật trạng thái thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa trận đua "${name}"?`)) return;
    setActionLoading(id);
    try {
      await racesApi.delete(id);
      toast.success("Đã xóa trận đua thành công");
      void fetchRaces(page);
    } catch (e: any) {
      toast.error(e.message || "Không thể xóa trận đua");
    } finally {
      setActionLoading(null);
    }
  };

  // Client-side filtering
  const filteredRaces = races.filter((r) => {
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getTournamentName = (r: RaceItem): string => {
    if (typeof r.tournamentId === "object" && r.tournamentId?.name) return r.tournamentId.name;
    return "—";
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        eyebrow="Quản lý trận đua"
        title="Bảng Điều Khiển Trận Đua"
        description="Xem danh sách toàn bộ trận đua đã tạo trong hệ thống, thay đổi trạng thái và quản lý trực tiếp."
        actions={
          <Button asChild className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-white font-bold uppercase tracking-wider text-xs px-5">
            <Link href="/admin/races/new">
              <Plus className="size-4 mr-1" /> Tạo trận đua
            </Link>
          </Button>
        }
      />

      {/* Toolbar: Search + Status Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center rounded-2xl border border-white/5 bg-[#13131A] p-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm tên trận đua..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-primary transition"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                statusFilter === s
                  ? "bg-primary text-white border border-primary"
                  : "bg-white/[0.02] border border-white/5 text-muted-foreground hover:text-white"
              }`}
            >
              {s === "ALL" ? "Tất cả" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Race Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/55">
          <Loader2 className="size-8 animate-spin text-[#E10600]" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải danh sách trận đua...</p>
        </div>
      ) : filteredRaces.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#15151E]/60 p-12 text-center shadow-xl">
          <Flag className="size-12 text-white/10 mx-auto mb-3 stroke-[1.5]" />
          <h4 className="text-base font-bold text-white uppercase tracking-wider mb-1">Không có trận đua nào</h4>
          <p className="text-xs text-white/55 max-w-sm mx-auto">
            {search || statusFilter !== "ALL"
              ? "Không tìm thấy trận đua nào phù hợp bộ lọc hiện tại."
              : "Hệ thống chưa có trận đua nào. Hãy tạo mới tại trang chi tiết giải đấu."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#15151E]/85 overflow-hidden shadow-2xl">
          <div className="flex justify-between items-center px-5 pt-4 pb-2">
            <span className="text-xs text-white/50">
              Hiển thị <strong className="text-white">{filteredRaces.length}</strong> / {meta.total} trận đua
            </span>
            <Button onClick={() => fetchRaces(page)} variant="ghost" className="size-8 p-0 rounded-full hover:bg-white/5 text-white/60 hover:text-white">
              <RefreshCw className="size-4" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-y border-white/10 bg-white/[0.02] text-white/50 font-black uppercase tracking-wider">
                  <th className="p-4 w-12">#</th>
                  <th className="p-4">Tên trận đua</th>
                  <th className="p-4">Giải đấu</th>
                  <th className="p-4">Cự ly</th>
                  <th className="p-4">Thời gian</th>
                  <th className="p-4">Số ngựa</th>
                  <th className="p-4">Giải thưởng</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {filteredRaces.map((race, index) => {
                  const isLocked = ["LIVE", "FINISHED", "RESULT_PUBLISHED"].includes(race.status);
                  return (
                    <tr key={race._id} className="hover:bg-white/[0.01] transition duration-200">
                      <td className="p-4 font-mono font-bold text-white/40">{(meta.page - 1) * 20 + index + 1}</td>
                      <td className="p-4">
                        <span className="font-bold text-white block">{race.name}</span>
                        {race.description && <span className="text-[10px] text-white/40 font-normal line-clamp-1">{race.description}</span>}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary">
                          <Trophy className="size-3" /> {getTournamentName(race)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="block font-bold">{race.distanceMeters}m</span>
                        <span className="text-[10px] text-white/40">{race.trackCondition || "—"}</span>
                      </td>
                      <td className="p-4 font-mono font-bold">
                        {new Date(race.startTime).toLocaleString("vi-VN", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4 font-mono font-bold">
                        {race.participantsCount || 0}/{race.maxParticipants || 8}
                      </td>
                      <td className="p-4 font-mono font-bold text-teal-400">
                        {(race.prize || 0).toLocaleString()} pts
                      </td>
                      <td className="p-4">
                        <select
                          value={race.status}
                          disabled={actionLoading === race._id}
                          onChange={(e) => handleStatusChange(race._id, e.target.value)}
                          className={`rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-black/45 focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50 cursor-pointer ${statusColors[race.status] || "text-white/60 border-white/10"}`}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt} className="bg-[#15151E] text-white">{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/races/${race._id}/participants`}
                          className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 text-[10px] text-white transition font-bold"
                        >
                          Ngựa
                        </Link>
                        <button
                          onClick={() => handleDelete(race._id, race.name)}
                          disabled={actionLoading === race._id || isLocked}
                          className="rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/20 px-2.5 py-1.5 text-red-400 hover:text-white transition disabled:opacity-30"
                          title={isLocked ? "Trận đấu đang diễn ra hoặc đã kết thúc" : "Xóa trận đua"}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 p-4 border-t border-white/5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white disabled:opacity-30"
              >
                ← Trang trước
              </button>
              <span className="text-xs text-white/50">
                Trang <strong className="text-white">{meta.page}</strong> / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white disabled:opacity-30"
              >
                Trang sau →
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
