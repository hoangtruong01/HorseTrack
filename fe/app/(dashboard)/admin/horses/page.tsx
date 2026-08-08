"use client";

/**
 * ====================================================================
 * CHỨC NĂNG: QUẢN LÝ CHIẾN MÃ TOÀN HỆ THỐNG (HORSES MANAGEMENT)
 * QUYỀN SỬ DỤNG: ADMIN
 * MÔ TẢ:
 * - Xem danh sách ngựa đua, cập nhật trạng thái sức khỏe, phê duyệt chiến mã mới đăng ký bởi chủ ngựa.
 * ====================================================================
 */

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Trash2, User, LayoutGrid, List, Search, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { formatHorseApprovalStatus } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { horsesApi, raceResultsApi, type HorseItem, type HorseVictoriesSummary } from "@/lib/api-client";


export default function AdminHorsesPage() {
  const { i18n } = useTranslation();
  const [horses, setHorses] = useState<HorseItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HorseItem | null>(null);

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [filterApproval, setFilterApproval] = useState("");
  const [filterHealth, setFilterHealth] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [selectedHorse, setSelectedHorse] = useState<HorseItem | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionInput, setRejectionInput] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Championship History States
  const [victoriesSummary, setVictoriesSummary] = useState<HorseVictoriesSummary | null>(null);
  const [loadingVictories, setLoadingVictories] = useState(false);
  const [champPage, setChampPage] = useState(1);

  const filteredHorses = horses.filter((h) => {
    if (filterApproval && (h.approvalStatus || "").toUpperCase() !== filterApproval.toUpperCase()) {
      return false;
    }
    if (filterHealth && (h.healthStatus || "").toUpperCase() !== filterHealth.toUpperCase()) {
      return false;
    }
    if (filterGender && (h.gender || "").toUpperCase() !== filterGender.toUpperCase()) {
      return false;
    }
    return true;
  });

  const hasActiveFilters = Boolean(search || filterApproval || filterHealth || filterGender);

  const resetFilters = () => {
    setSearch("");
    setFilterApproval("");
    setFilterHealth("");
    setFilterGender("");
    void fetchHorses(1, "");
  };

  const handleSelectHorse = (h: HorseItem | null) => {
    setSelectedHorse(h);
    setActiveImageIndex(0);
    setChampPage(1);
    setVictoriesSummary(null);
  };

  useEffect(() => {
    if (selectedHorse?._id) {
      setLoadingVictories(true);
      raceResultsApi
        .getByHorse(selectedHorse._id)
        .then((res) => {
          setVictoriesSummary(res);
        })
        .catch((err) => {
          console.error("Lỗi lấy lịch sử giải vô địch:", err);
          setVictoriesSummary(null);
        })
        .finally(() => {
          setLoadingVictories(false);
        });
    }
  }, [selectedHorse?._id]);

  const fetchHorses = useCallback(async (page = 1, currentSearch = search) => {
    setLoading(true);
    try {
      const res = await horsesApi.list({ page, limit: 15, search: currentSearch });
      setHorses(res.data);
      setMeta(res.meta);
    } catch (e) {
      toast.error((e as Error).message ?? "Lỗi tải dữ liệu");
    } finally { setLoading(false); }
  }, [search]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void fetchHorses(1); }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchHorses(1, search);
  };

  const handleDelete = (h: HorseItem) => {
    setDeleteTarget(h);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget._id);
    try {
      await horsesApi.delete(deleteTarget._id);
      toast.success(`Đã xóa ngựa ${deleteTarget.name}`);
      await fetchHorses(meta.page);
    } catch (e) { toast.error((e as Error).message); }
    finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await horsesApi.approve(id);
      toast.success("Phê duyệt chiến mã thành công!");
      handleSelectHorse(null);
      await fetchHorses(meta.page);
    } catch (e) {
      toast.error((e as Error).message ?? "Phê duyệt thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionInput.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    setActionLoading(id);
    try {
      await horsesApi.reject(id, rejectionInput);
      toast.success("Đã từ chối kiểm duyệt chiến mã.");
      handleSelectHorse(null);
      setShowRejectForm(false);
      setRejectionInput("");
      await fetchHorses(meta.page);
    } catch (e) {
      toast.error((e as Error).message ?? "Từ chối thất bại");
    } finally {
      setActionLoading(null);
    }
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
        description="Xem toàn bộ danh sách ngựa trong hệ thống. Admin kiểm duyệt hồ sơ và xử lý các chiến mã đăng ký mới."
      />

      {/* Search & Filters bar */}
      <div className="flex flex-col gap-4 bg-card/60 p-4 rounded-2xl border border-border backdrop-blur-md shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Tìm tên ngựa, giống ngựa, tên chủ sở hữu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background/80 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </form>

          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">
              Hiển thị: <strong className="text-foreground font-bold">{filteredHorses.length}</strong> / {meta.total} ngựa
            </div>
            <div className="flex items-center bg-background border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition ${viewMode === "grid" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground/70 hover:text-foreground/80"}`}
                title="Lưới"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition ${viewMode === "list" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground/70 hover:text-foreground/80"}`}
                title="Danh sách"
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Selects */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/40">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-1">Bộ lọc:</span>

          {/* Approval Filter */}
          <select
            value={filterApproval}
            onChange={(e) => setFilterApproval(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả xét duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="REJECTED">Bị từ chối</option>
          </select>

          {/* Health Filter */}
          <select
            value={filterHealth}
            onChange={(e) => setFilterHealth(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả sức khỏe</option>
            <option value="HEALTHY">Khỏe mạnh</option>
            <option value="INJURED">Chấn thương</option>
            <option value="RECOVERING">Hồi phục</option>
            <option value="RETIRED">Giải nghệ</option>
          </select>

          {/* Gender Filter */}
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
          >
            <option value="">Tất cả giới tính</option>
            <option value="MALE">Đực</option>
            <option value="FEMALE">Cái</option>
            <option value="GELDING">Hoạn</option>
          </select>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="h-8 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 text-xs font-semibold text-rose-700 dark:text-red-400 hover:bg-rose-500/20 transition"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-foreground/55">
            <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
            <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải...</p>
          </div>
        ) : filteredHorses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm space-y-2">
            <p>Không tìm thấy chiến mã nào phù hợp với bộ lọc.</p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-primary underline hover:text-primary/80 transition"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredHorses.map((h) => (
              <div
                key={`grid-${h._id}`}
                onClick={() => handleSelectHorse(h)}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 flex flex-col group shadow-lg cursor-pointer"
              >
                {/* Phần ảnh đầu Card */}
                <div className="relative aspect-video w-full bg-muted/80 overflow-hidden border-b border-border flex items-center justify-center">
                  {h.imageUrl || h.image ? (
                    <Image
                      src={h.imageUrl || h.image || ""}
                      alt={h.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-4xl">🐎</div>
                  )}

                  {/* Lớp phủ gradient tối ở chân ảnh */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent p-3 flex justify-between items-end">
                    {/* Badge Trạng thái duyệt */}
                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase backdrop-blur-[2px] ${h.approvalStatus === "APPROVED" ? "text-emerald-400 bg-emerald-400/20 border-emerald-400/30" :
                        h.approvalStatus === "REJECTED" ? "text-red-400 bg-red-400/20 border-red-400/30" :
                          "text-yellow-400 bg-yellow-400/20 border-yellow-400/30"
                      }`}>
                      {formatHorseApprovalStatus(h.approvalStatus, i18n.language)}
                    </span>

                    {/* Badge Trạng thái sức khỏe */}
                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase backdrop-blur-[2px] ${h.healthStatus === "HEALTHY" ? "text-emerald-400 bg-emerald-400/20 border-emerald-400/30" :
                        h.healthStatus === "SICK" ? "text-red-400 bg-red-400/20 border-red-400/30" :
                          h.healthStatus === "INJURED" ? "text-orange-400 bg-orange-400/20 border-orange-400/30" :
                            "text-gray-400 bg-gray-400/20 border-gray-400/30"
                      }`}>
                      {h.healthStatus === "HEALTHY" ? "Khỏe mạnh (Healthy)" :
                        h.healthStatus === "SICK" ? "Đang bệnh (Sick)" :
                          h.healthStatus === "INJURED" ? "Chấn thương (Injured)" : "Nghỉ hưu (Retired)"}
                    </span>
                  </div>
                </div>

                {/* Phần thân Card (Thông tin chi tiết) */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-[#E10600] transition-colors line-clamp-1">
                        {h.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {h.breed ?? "Giống chưa rõ"}
                      </p>
                    </div>

                    {/* Thông tin chủ sở hữu */}
                    <div className="flex items-center gap-1.5 text-xs text-foreground/70 bg-muted border border-border rounded-xl p-2.5">
                      <User className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">Chủ nuôi: <strong className="text-foreground font-medium">{getOwnerName(h.ownerId)}</strong></span>
                    </div>

                    {/* Thông tin phụ dạng mini-badge / text nhỏ */}
                    <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-[11px]">
                      <div className="text-center">
                        <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Tuổi</span>
                        <span className="text-foreground font-semibold">{h.age ?? "—"}</span>
                      </div>
                      <div className="text-center border-x border-border">
                        <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Cân nặng</span>
                        <span className="text-foreground font-semibold truncate block">{h.weightKg ? `${h.weightKg} kg` : "—"}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Tốc độ</span>
                        <span className="text-foreground font-semibold">{h.baseSpeed ? `${h.baseSpeed} km/h` : "—"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Phần Action (Nút bấm) */}
                  <div className="flex items-center gap-2 mt-5 pt-3 border-t border-border">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectHorse(h);
                      }}
                      className="flex-1 h-9 rounded-xl border border-border bg-muted text-foreground hover:bg-white/[0.08] text-xs font-bold transition flex items-center justify-center"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(h);
                      }}
                      disabled={actionLoading === h._id || h.status === "DELETED"}
                      className="size-9 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition flex items-center justify-center shrink-0 disabled:opacity-40"
                      title="Xóa ngựa"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredHorses.map((h) => (
              <div
                key={`list-${h._id}`}
                onClick={() => handleSelectHorse(h)}
                className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:scale-[1.01] transition-transform duration-300 shadow-lg group cursor-pointer"
              >
                {/* Ảnh ngựa dẹt */}
                <div className="relative h-24 w-32 shrink-0 bg-muted/80 overflow-hidden rounded-xl border border-border flex items-center justify-center">
                  {h.imageUrl || h.image ? (
                    <Image
                      src={h.imageUrl || h.image || ""}
                      alt={h.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-3xl">🐎</div>
                  )}
                </div>

                {/* Thông tin chính */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-[#E10600] transition-colors truncate">
                      {h.name}
                    </h3>
                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${h.approvalStatus === "APPROVED" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                        h.approvalStatus === "REJECTED" ? "text-red-400 bg-red-400/10 border-red-400/20" :
                          "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                      }`}>
                      {formatHorseApprovalStatus(h.approvalStatus, i18n.language)}
                    </span>
                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${h.healthStatus === "HEALTHY" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                        h.healthStatus === "SICK" ? "text-red-400 bg-red-400/10 border-red-400/20" :
                          h.healthStatus === "INJURED" ? "text-orange-400 bg-orange-400/10 border-orange-400/20" :
                            "text-gray-400 bg-gray-400/10 border-gray-400/20"
                      }`}>
                      {h.healthStatus === "HEALTHY" ? "Khỏe mạnh (Healthy)" :
                        h.healthStatus === "SICK" ? "Bệnh (Sick)" :
                          h.healthStatus === "INJURED" ? "Chấn thương (Injured)" : "Nghỉ hưu (Retired)"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {h.breed ?? "Giống chưa rõ"} · {h.gender === "MALE" ? "Đực" : h.gender === "FEMALE" ? "Cái" : h.gender === "GELDING" ? "Thiến" : "—"}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-muted border border-border rounded-lg px-2 py-1">
                      <User className="size-3" />
                      <span className="truncate max-w-[120px]">{getOwnerName(h.ownerId)}</span>
                    </div>
                    <span>Tuổi: <strong className="text-foreground">{h.age ?? "—"}</strong></span>
                    <span>Cân nặng: <strong className="text-foreground">{h.weightKg ? `${h.weightKg} kg` : "—"}</strong></span>
                    <span>Tốc độ: <strong className="text-foreground">{h.baseSpeed ? `${h.baseSpeed} km/h` : "—"}</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 sm:ml-4 w-full sm:w-auto mt-4 sm:mt-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectHorse(h);
                    }}
                    className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-border bg-muted text-foreground hover:bg-white/[0.08] text-xs font-bold transition flex items-center justify-center"
                  >
                    Xem chi tiết
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(h);
                    }}
                    disabled={actionLoading === h._id || h.status === "DELETED"}
                    className="size-10 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition flex items-center justify-center shrink-0 disabled:opacity-40"
                    title="Xóa ngựa"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => fetchHorses(meta.page - 1)} disabled={meta.page <= 1}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition">
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">Trang {meta.page} / {meta.totalPages}</span>
          <button onClick={() => fetchHorses(meta.page + 1)} disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition">
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa chiến mã</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa chiến mã <strong className="text-foreground">&quot;{deleteTarget?.name}&quot;</strong>. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Xóa chiến mã</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal chi tiết chiến mã */}
      {selectedHorse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 md:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh] animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-200">
            <button
              onClick={() => {
                handleSelectHorse(null);
                setShowRejectForm(false);
                setRejectionInput("");
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-xl transition"
            >
              ✕
            </button>

            <h3 className="text-xl font-black uppercase text-foreground tracking-tight border-b border-border pb-3 mb-5">
              Chi tiết chiến mã
            </h3>

            <div className="grid gap-6 md:grid-cols-12">
              {/* Image & Stats */}
              <div className="md:col-span-5 space-y-4">
                {(() => {
                  const horseImages = selectedHorse.images && selectedHorse.images.length > 0
                    ? selectedHorse.images
                    : (selectedHorse.image || selectedHorse.imageUrl ? [selectedHorse.image || selectedHorse.imageUrl] : []);
                  const activeImage = horseImages[activeImageIndex] || selectedHorse.image || selectedHorse.imageUrl || "";

                  return (
                    <>
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted/80 border border-border flex items-center justify-center">
                        {activeImage ? (
                          <Image
                            src={activeImage}
                            alt={selectedHorse.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="text-5xl">🐎</div>
                        )}
                      </div>

                      {horseImages.length > 1 && (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {horseImages.map((img, index) => (
                            <button
                              key={index}
                              onClick={() => setActiveImageIndex(index)}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                                activeImageIndex === index ? "border-primary" : "border-transparent opacity-75 hover:opacity-100"
                              }`}
                            >
                              <Image
                                src={img || ""}
                                alt={`${selectedHorse.name} thumb ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}

                <div className="rounded-xl border border-border bg-muted p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tốc độ nền:</span>
                    <span className="font-bold text-foreground">{selectedHorse.baseSpeed ?? 60} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thể lực:</span>
                    <span className="font-bold text-foreground">{selectedHorse.staminaScore ?? 70}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trạng thái:</span>
                    <span className="font-bold text-foreground uppercase">{selectedHorse.status}</span>
                  </div>
                </div>
              </div>

              {/* Information */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <h4 className="text-2xl font-black text-foreground uppercase tracking-tight">{selectedHorse.name}</h4>
                  <p className="text-xs text-muted-foreground/70 mt-0.5 uppercase tracking-wider font-bold">
                    {selectedHorse.breed ?? "Giống chưa rõ"} · {selectedHorse.color ?? "Màu chưa rõ"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-y border-border py-3 text-xs">
                  <div>
                    <span className="text-muted-foreground/70 block">Giới tính:</span>
                    <span className="font-bold text-foreground uppercase">{selectedHorse.gender === "MALE" ? "Đực" : selectedHorse.gender === "FEMALE" ? "Cái" : selectedHorse.gender === "GELDING" ? "Thiến" : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/70 block">Tuổi:</span>
                    <span className="font-bold text-foreground">{selectedHorse.age ?? "N/A"} tuổi</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/70 block">Cân nặng:</span>
                    <span className="font-bold text-foreground">{selectedHorse.weightKg ? `${selectedHorse.weightKg} kg` : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground/70 block">Chiều cao:</span>
                    <span className="font-bold text-foreground">{selectedHorse.heightCm ? `${selectedHorse.heightCm} cm` : "N/A"}</span>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="rounded-xl border border-border bg-muted p-4 space-y-1.5 text-xs">
                  <h5 className="font-bold text-[#E10600] uppercase tracking-wider text-[10px]">Chủ hiện tại</h5>
                  <p className="font-bold text-foreground text-sm">{typeof selectedHorse.ownerId === 'object' ? selectedHorse.ownerId?.fullName : selectedHorse.ownerId}</p>
                  {typeof selectedHorse.ownerId === 'object' && selectedHorse.ownerId?.email && (
                    <p className="text-muted-foreground">{selectedHorse.ownerId.email}</p>
                  )}
                </div>

                {/* Jockey Information */}
                {(() => {
                  const latestJockey = victoriesSummary?.allResults?.find(
                    (res) => typeof res.jockeyUserId === "object" && res.jockeyUserId?.fullName
                  )?.jockeyUserId as { fullName?: string; email?: string; avatar?: string } | undefined;

                  return (
                    <div className="rounded-xl border border-border bg-muted p-4 space-y-1.5 text-xs">
                      <h5 className="font-bold text-primary uppercase tracking-wider text-[10px]">Nài ngựa điều khiển</h5>
                      {latestJockey ? (
                        <div className="flex items-center gap-3 pt-0.5">
                          {latestJockey.avatar && (
                            <div className="relative size-8 rounded-full overflow-hidden border border-border shrink-0">
                              <Image src={latestJockey.avatar} alt={latestJockey.fullName || "Jockey"} fill className="object-cover" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-foreground text-sm">{latestJockey.fullName}</p>
                            {latestJockey.email && <p className="text-muted-foreground text-[11px]">{latestJockey.email}</p>}
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic text-[11px]">Chưa ghi nhận thông tin nài ngựa thi đấu</p>
                      )}
                    </div>
                  );
                })()}

                {/* Approval Status & Date */}
                <div className="rounded-xl border border-border bg-muted p-4 space-y-1 text-xs">
                  <h5 className="font-bold text-muted-foreground/70 uppercase tracking-widest text-[9px]">Tình trạng kiểm duyệt</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${selectedHorse.approvalStatus === "APPROVED" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                      selectedHorse.approvalStatus === "REJECTED" ? "text-red-400 bg-red-400/10 border-red-400/20" :
                        "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                      }`}>
                      {formatHorseApprovalStatus(selectedHorse.approvalStatus, i18n.language)}
                    </span>
                  </div>
                  {selectedHorse.approvalStatus === "APPROVED" && selectedHorse.approvedAt && (
                    <p className="text-muted-foreground text-[11px] mt-1.5">
                      <span className="text-muted-foreground/70 font-semibold">Ngày được duyệt:</span> {new Date(selectedHorse.approvedAt).toLocaleString("vi-VN")}
                    </p>
                  )}
                  {selectedHorse.approvalStatus === "REJECTED" && selectedHorse.rejectionReason && (
                    <div className="mt-2 text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg p-2.5">
                      <span className="font-bold block">Lý do không được duyệt:</span>
                      <span className="text-foreground/85 italic">{selectedHorse.rejectionReason}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedHorse.description && (
              <div className="mt-5 text-xs text-foreground/70 space-y-1">
                <span className="text-muted-foreground/70 block font-bold uppercase tracking-wider">Mô tả đặc điểm:</span>
                <p className="bg-white/[0.01] border border-border rounded-xl p-3.5 leading-relaxed italic">{selectedHorse.description}</p>
              </div>
            )}

            {/* Lịch sử giải vô địch (5 cái 1 trang) cho chiến mã đã được duyệt */}
            {selectedHorse.approvalStatus === "APPROVED" && (
              <div className="mt-6 border-t border-border pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="size-4 text-yellow-500" />
                    <h4 className="text-xs font-black uppercase text-foreground tracking-wider">
                      Lịch Sử Giải Vô Địch ({victoriesSummary?.championships?.length ?? 0})
                    </h4>
                  </div>
                  {victoriesSummary && (
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Tổng {victoriesSummary.totalRaces} trận · <strong className="text-yellow-400">{victoriesSummary.wins} Quán quân</strong>
                    </span>
                  )}
                </div>

                {loadingVictories ? (
                  <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
                    Đang tải lịch sử giải vô địch...
                  </div>
                ) : !victoriesSummary || victoriesSummary.championships.length === 0 ? (
                  <div className="rounded-xl border border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
                    Chiến mã chưa có giải vô địch nào được ghi nhận.
                  </div>
                ) : (
                  <>
                    {(() => {
                      const pageSize = 5;
                      const champs = victoriesSummary.championships;
                      const totalPages = Math.ceil(champs.length / pageSize) || 1;
                      const startIndex = (champPage - 1) * pageSize;
                      const currentChamps = champs.slice(startIndex, startIndex + pageSize);

                      return (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            {currentChamps.map((item, idx) => {
                              const raceObj = typeof item.raceId === "object" ? item.raceId : null;
                              const tourObj = raceObj && typeof raceObj.tournamentId === "object" ? raceObj.tournamentId : null;
                              const jockeyObj = typeof item.jockeyUserId === "object" ? item.jockeyUserId : null;

                              const formatTime = (ms?: number) => {
                                if (!ms) return "—";
                                const totalSec = ms / 1000;
                                const mins = Math.floor(totalSec / 60);
                                const secs = (totalSec % 60).toFixed(2);
                                return `${mins}:${secs.padStart(5, "0")}`;
                              };

                              return (
                                <div
                                  key={item._id || item.id || idx}
                                  className="flex items-center justify-between rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs"
                                >
                                  <div className="space-y-1 min-w-0 flex-1 pr-3">
                                    <div className="flex items-center gap-2">
                                      <span className="rounded-md bg-yellow-500/20 px-2 py-0.5 text-[9px] font-bold uppercase text-yellow-400 border border-yellow-500/30">
                                        🏆 QUÁN QUÂN (HẠNG 1)
                                      </span>
                                      {raceObj?.startTime && (
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                          {new Date(raceObj.startTime).toLocaleDateString("vi-VN")}
                                        </span>
                                      )}
                                    </div>
                                    <h5 className="font-bold text-foreground truncate">
                                      {tourObj?.name ? `${tourObj.name} - ` : ""}{raceObj?.name || "Giải đấu chính thức"}
                                    </h5>
                                    <p className="text-[11px] text-muted-foreground">
                                      Nài ngựa: <span className="font-medium text-foreground">{jockeyObj?.fullName || "—"}</span>
                                    </p>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="font-mono font-bold text-foreground block">
                                      {formatTime(item.finishTimeMs)}
                                    </span>
                                    <span className="text-[10px] font-bold text-teal-400 block mt-0.5">
                                      +{item.points || 0} điểm
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Pagination controls for 5 items per page */}
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-2 text-xs">
                              <span className="text-muted-foreground">
                                Trang {champPage} / {totalPages} (Tổng {champs.length} giải)
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setChampPage((p) => Math.max(1, p - 1))}
                                  disabled={champPage <= 1}
                                  className="rounded-lg border border-border bg-muted px-2.5 py-1 text-xs text-foreground hover:bg-white/[0.08] disabled:opacity-40 transition"
                                >
                                  Trước
                                </button>
                                <button
                                  onClick={() => setChampPage((p) => Math.min(totalPages, p + 1))}
                                  disabled={champPage >= totalPages}
                                  className="rounded-lg border border-border bg-muted px-2.5 py-1 text-xs text-foreground hover:bg-white/[0.08] disabled:opacity-40 transition"
                                >
                                  Sau
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

            {/* Admin actions (Approve/Reject) */}
            <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
              {selectedHorse.approvalStatus !== "APPROVED" && (
                <>
                  {!showRejectForm ? (
                    <>
                      <button
                        onClick={() => setShowRejectForm(true)}
                        className="rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-5 h-10 text-xs font-bold uppercase tracking-wider transition"
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => handleApprove(selectedHorse._id)}
                        disabled={actionLoading === selectedHorse._id}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-foreground px-5 h-10 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5"
                      >
                        Phê duyệt
                      </button>
                    </>
                  ) : (
                    <div className="w-full space-y-3">
                      <textarea
                        placeholder="Nhập lý do từ chối kiểm duyệt chiến mã này..."
                        value={rejectionInput}
                        onChange={(e) => setRejectionInput(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none transition focus:border-[#E10600] focus:ring-2 focus:ring-[#E10600]/20"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowRejectForm(false)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground/70 hover:bg-muted transition"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleReject(selectedHorse._id)}
                          disabled={actionLoading === selectedHorse._id || !rejectionInput.trim()}
                          className="rounded-lg bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs text-foreground font-bold transition disabled:opacity-40"
                        >
                          Gửi từ chối
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {!showRejectForm && (
                <button
                  onClick={() => {
                    handleSelectHorse(null);
                    setShowRejectForm(false);
                    setRejectionInput("");
                  }}
                  className="rounded-xl border border-border px-5 h-10 text-xs text-foreground/70 hover:bg-muted transition"
                >
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


