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
import { ChevronLeft, ChevronRight, Eye, Plus, Trash2, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const TOURNAMENT_STATUS_FLOW: Record<string, string[]> = {
  DRAFT: ["OPEN_REGISTRATION", "CANCELLED"],
  OPEN_REGISTRATION: ["CLOSED_REGISTRATION", "CANCELLED"],
  CLOSED_REGISTRATION: ["ONGOING", "CANCELLED"],
  ONGOING: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};
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
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TournamentItem | null>(null);

  const fetchTournaments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await tournamentsApi.list({ page, limit: 10 });
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
      toast.success(`Đã cập nhật trạng thái → ${status}`);
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

      <div className="text-sm text-muted-foreground">
        Tổng:{" "}
        <strong className="text-foreground font-semibold">{meta.total}</strong>{" "}
        giải đấu
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-border bg-card p-5 h-40"
              />
            ))
          : tournaments.map((t) => (
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
                      {t.status}
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
                        {(t.prizePool || t.prize || 0).toLocaleString()} pts
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={t.status} disabled>
                        {t.status}
                      </SelectItem>
                      {(TOURNAMENT_STATUS_FLOW[t.status] ?? []).map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
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
