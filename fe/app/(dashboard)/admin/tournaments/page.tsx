"use client";

import { PageHeader } from "@/components/layout/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tournamentsApi, type TournamentItem } from "@/lib/api-client";
import { ChevronLeft, ChevronRight, Eye, Plus, Search, Trash2, Trophy, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { formatTournamentStatus } from "@/lib/utils";

const TOURNAMENT_STATUS_FLOW: Record<string, string[]> = {
  DRAFT: ["OPEN_REGISTRATION", "CANCELLED"],
  OPEN_REGISTRATION: ["CLOSED_REGISTRATION", "CANCELLED"],
  CLOSED_REGISTRATION: ["ONGOING", "CANCELLED"],
  ONGOING: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};
const statusColors: Record<string, string> = {
  DRAFT: "text-slate-800 dark:text-slate-400 bg-slate-500/20 dark:bg-slate-400/10 border-slate-500/40 dark:border-slate-400/20 font-bold",
  UPCOMING: "text-blue-800 dark:text-blue-400 bg-blue-500/20 dark:bg-blue-400/10 border-blue-500/40 dark:border-blue-400/20 font-bold",
  OPEN_REGISTRATION: "text-emerald-800 dark:text-emerald-400 bg-emerald-500/20 dark:bg-emerald-400/10 border-emerald-500/40 dark:border-emerald-400/20 font-bold",
  CLOSED_REGISTRATION: "text-amber-900 dark:text-yellow-400 bg-amber-500/20 dark:bg-yellow-400/10 border-amber-500/40 dark:border-yellow-400/20 font-bold",
  REGISTRATION_CLOSED: "text-amber-900 dark:text-yellow-400 bg-amber-500/20 dark:bg-yellow-400/10 border-amber-500/40 dark:border-yellow-400/20 font-bold",
  ONGOING: "text-red-700 dark:text-primary bg-red-500/20 dark:bg-primary/10 border-red-500/40 dark:border-primary/20 font-bold",
  COMPLETED: "text-purple-800 dark:text-purple-400 bg-purple-500/20 dark:bg-purple-400/10 border-purple-500/40 dark:border-purple-400/20 font-bold",
  FINISHED: "text-purple-800 dark:text-purple-400 bg-purple-500/20 dark:bg-purple-400/10 border-purple-500/40 dark:border-purple-400/20 font-bold",
  CANCELLED: "text-rose-800 dark:text-red-400 bg-rose-500/20 dark:bg-red-400/10 border-rose-500/40 dark:border-red-400/20 font-bold",
};

export default function AdminTournamentsPage() {
  const { i18n } = useTranslation();
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TournamentItem | null>(null);

  const filteredTournaments = tournaments.filter((t) => {
    if (filterStatus && (t.status || "").toUpperCase() !== filterStatus.toUpperCase()) {
      return false;
    }
    if (!search) return true;
    const q = search.toLowerCase();
    const nameMatch = (t.name || "").toLowerCase().includes(q);
    const locMatch = (t.location || "").toLowerCase().includes(q);
    const descMatch = (t.description || "").toLowerCase().includes(q);
    return nameMatch || locMatch || descMatch;
  });

  const hasActiveFilters = Boolean(search || filterStatus);

  const resetFilters = () => {
    setSearch("");
    setFilterStatus("");
  };

  const fetchTournaments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await tournamentsApi.list({ page, limit: 100 });
      setTournaments(res.data);
      setMeta(res.meta);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTournaments(1);
  }, [fetchTournaments]);

  const handleStatusChange = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await tournamentsApi.updateStatus(id, status);
      toast.success(`Đã cập nhật trạng thái giải đấu thành: ${formatTournamentStatus(status, i18n.language)}`);
      await fetchTournaments(meta.page);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Lỗi cập nhật trạng thái giải đấu",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = (t: TournamentItem) => {
    setDeleteTarget(t);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget._id);
    try {
      await tournamentsApi.delete(deleteTarget._id);
      toast.success("Đã xóa giải đấu thành công.");
      await fetchTournaments(meta.page);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi xóa giải đấu");
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
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
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-foreground hover:bg-primary/90 transition"
          >
            <Plus className="size-4" /> Tạo giải mới
          </Link>
        }
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
              placeholder="Tìm theo tên giải đấu, địa điểm..."
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">DRAFT (Bản nháp)</option>
            <option value="OPEN_REGISTRATION">OPEN REGISTRATION (Mở đăng ký)</option>
            <option value="CLOSED_REGISTRATION">CLOSED REGISTRATION (Đóng đăng ký)</option>
            <option value="ONGOING">ONGOING (Đang diễn ra)</option>
            <option value="COMPLETED">COMPLETED (Hoàn thành)</option>
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
        <div>
          Hiển thị: <strong className="text-foreground font-semibold">{filteredTournaments.length}</strong> / {meta.total} giải đấu
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-border bg-card p-5 h-40"
              />
            ))
          : filteredTournaments.map((t) => (
              <div
                key={t._id}
                className="relative rounded-2xl border border-border bg-card p-5 flex flex-col justify-between space-y-3 hover:border-primary/30 hover:bg-muted/80 transition duration-200 shadow-lg group"
              >
                <Link
                  href={`/admin/tournaments/${t._id}`}
                  className="block space-y-3 cursor-pointer group/card flex-1"
                >
                  {t.imageUrl ? (
                    <div className="relative h-36 w-full overflow-hidden rounded-xl border border-border bg-muted">
                      <Image
                        src={t.imageUrl}
                        alt={t.name}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  ) : (
                    <div className="relative h-36 w-full flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
                      <Trophy className="size-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-black uppercase text-foreground leading-tight group-hover:text-primary transition">
                      {t.name}
                    </h3>
                    <span
                      className={`shrink-0 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${statusColors[t.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}
                    >
                      {formatTournamentStatus(t.status, i18n.language)}
                    </span>
                  </div>
                  {t.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {t.description}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-t border-border pt-2">
                    <span>
                      🏆 Prize:{" "}
                      <strong className="text-foreground font-semibold">
                        {(t.prizePool || t.prize || 0).toLocaleString()} điểm
                      </strong>
                    </span>
                    <span>
                      🐴 Max:{" "}
                      <strong className="text-foreground font-semibold">
                        {t.maxHorses ?? "?"} ngựa
                      </strong>
                    </span>
                    {t.startDate && (
                      <span>
                        📅 {new Date(t.startDate).toLocaleDateString("vi-VN")}
                      </span>
                    )}
                    {t.endDate && (
                      <span>
                        🏁 {new Date(t.endDate).toLocaleDateString("vi-VN")}
                      </span>
                    )}
                  </div>
                </Link>
                <div
                  className="flex items-center gap-2 pt-2 border-t border-border relative z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Select
                    value={t.status}
                    onValueChange={(val) => handleStatusChange(t._id, val)}
                    disabled={
                      actionLoading === t._id ||
                      (TOURNAMENT_STATUS_FLOW[t.status]?.length ?? 0) === 0
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue>{formatTournamentStatus(t.status, i18n.language)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={t.status} disabled>
                        {formatTournamentStatus(t.status, i18n.language)}
                      </SelectItem>
                      {(TOURNAMENT_STATUS_FLOW[t.status] ?? []).map((s) => (
                        <SelectItem key={s} value={s}>
                          {formatTournamentStatus(s, i18n.language)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Link
                    href={`/admin/tournaments/${t._id}`}
                    className="rounded-lg border border-border bg-muted hover:bg-muted/80 p-1.5 text-foreground transition flex items-center justify-center"
                    title="Xem vòng đua"
                  >
                    <Eye className="size-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(t)}
                    disabled={actionLoading === t._id}
                    className="rounded-lg border border-red-500/30 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition disabled:opacity-40 flex items-center justify-center"
                    title="Xóa giải đấu"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => fetchTournaments(meta.page - 1)}
            disabled={meta.page <= 1}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-muted/80 disabled:opacity-40 transition"
          >
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">
            Trang {meta.page} / {meta.totalPages}
          </span>
          <button
            onClick={() => fetchTournaments(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-muted/80 disabled:opacity-40 transition"
          >
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa giải đấu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa giải{" "}
              <strong className="text-foreground">
                &ldquo;{deleteTarget?.name}&rdquo;
              </strong>
              . Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Xóa giải đấu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
