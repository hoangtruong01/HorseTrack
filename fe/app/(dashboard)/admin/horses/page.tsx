"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Trash2, ShieldAlert, User, LayoutGrid, List, Search } from "lucide-react";
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

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Search & Detail States
  const [search, setSearch] = useState("");
  const [selectedHorse, setSelectedHorse] = useState<HorseItem | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionInput, setRejectionInput] = useState("");

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchHorses = useCallback(async (page = 1, currentSearch = search) => {
    setLoading(true);
    try {
      const res = await horsesApi.list({ page, limit: 15, search: currentSearch });
      setHorses(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      showToast(e.message ?? "Lỗi tải dữ liệu", "err");
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { void fetchHorses(1); }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void fetchHorses(1, search);
  };

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

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await horsesApi.approve(id);
      showToast("Phê duyệt chiến mã thành công!");
      setSelectedHorse(null);
      await fetchHorses(meta.page);
    } catch (e: any) {
      showToast(e.message ?? "Phê duyệt thất bại", "err");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionInput.trim()) {
      showToast("Vui lòng nhập lý do từ chối", "err");
      return;
    }
    setActionLoading(id);
    try {
      await horsesApi.reject(id, rejectionInput);
      showToast("Đã từ chối kiểm duyệt chiến mã.");
      setSelectedHorse(null);
      setShowRejectForm(false);
      setRejectionInput("");
      await fetchHorses(meta.page);
    } catch (e: any) {
      showToast(e.message ?? "Từ chối thất bại", "err");
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

      {toast && (
        <div className={`fixed top-6 right-6 z-50 rounded-xl border px-5 py-3 text-sm font-semibold shadow-2xl transition duration-200 ${toast.type === "ok" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
          {toast.msg}
        </div>
      )}

      {/* Search and Metadata grid */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40 group-focus-within:text-[#E10600] transition-colors" />
          <input
            type="text"
            placeholder="Tìm tên ngựa, giống ngựa, tên chủ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-[#15151E]/60 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#E10600] focus:ring-4 focus:ring-[#E10600]/15"
          />
        </form>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground self-center">
            Tổng: <strong className="text-white">{meta.total}</strong> ngựa
          </div>
          <div className="flex items-center bg-[#15151E]/80 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition ${viewMode === "grid" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/80"}`}
              title="Lưới"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition ${viewMode === "list" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/80"}`}
              title="Danh sách"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Đang tải...</div>
        ) : horses.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Chưa có ngựa nào.</div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {horses.map((h) => (
              <div
                key={`grid-${h._id}`}
                className="bg-[#0B0B0F] border border-white/5 rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 flex flex-col group shadow-lg"
              >
                {/* Phần ảnh đầu Card */}
                <div className="relative aspect-video w-full bg-black/40 overflow-hidden border-b border-white/5 flex items-center justify-center">
                  {h.imageUrl || h.image ? (
                    <img
                      src={h.imageUrl || h.image}
                      alt={h.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                      {h.approvalStatus === "APPROVED" ? "Đã duyệt" :
                        h.approvalStatus === "REJECTED" ? "Bị từ chối" : "Chờ duyệt"}
                    </span>

                    {/* Badge Trạng thái sức khỏe */}
                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase backdrop-blur-[2px] ${h.healthStatus === "HEALTHY" ? "text-emerald-400 bg-emerald-400/20 border-emerald-400/30" :
                        h.healthStatus === "SICK" ? "text-red-400 bg-red-400/20 border-red-400/30" :
                          h.healthStatus === "INJURED" ? "text-orange-400 bg-orange-400/20 border-orange-400/30" :
                            "text-gray-400 bg-gray-400/20 border-gray-400/30"
                      }`}>
                      {h.healthStatus === "HEALTHY" ? "Khỏe mạnh" :
                        h.healthStatus === "SICK" ? "Đang bệnh" :
                          h.healthStatus === "INJURED" ? "Chấn thương" : "Nghỉ hưu"}
                    </span>
                  </div>
                </div>

                {/* Phần thân Card (Thông tin chi tiết) */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#E10600] transition-colors line-clamp-1">
                        {h.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {h.breed ?? "Giống chưa rõ"}
                      </p>
                    </div>

                    {/* Thông tin chủ sở hữu */}
                    <div className="flex items-center gap-1.5 text-xs text-white/70 bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
                      <User className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">Chủ nuôi: <strong className="text-white font-medium">{getOwnerName(h.ownerId)}</strong></span>
                    </div>

                    {/* Thông tin phụ dạng mini-badge / text nhỏ */}
                    <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-[11px]">
                      <div className="text-center">
                        <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Tuổi</span>
                        <span className="text-white font-semibold">{h.age ?? "—"}</span>
                      </div>
                      <div className="text-center border-x border-white/5">
                        <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Cân nặng</span>
                        <span className="text-white font-semibold truncate block">{h.weightKg ? `${h.weightKg} kg` : "—"}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Tốc độ</span>
                        <span className="text-white font-semibold">{h.baseSpeed ? `${h.baseSpeed} km/h` : "—"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Phần Action (Nút bấm) */}
                  <div className="flex items-center gap-2 mt-5 pt-3 border-t border-white/5">
                    <button
                      onClick={() => setSelectedHorse(h)}
                      className="flex-1 h-9 rounded-xl border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] text-xs font-bold transition flex items-center justify-center"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => handleDelete(h)}
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
            {horses.map((h) => (
              <div
                key={`list-${h._id}`}
                className="bg-[#0B0B0F] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:scale-[1.01] transition-transform duration-300 shadow-lg group"
              >
                {/* Ảnh ngựa dẹt */}
                <div className="relative h-24 w-32 shrink-0 bg-black/40 overflow-hidden rounded-xl border border-white/5 flex items-center justify-center">
                  {h.imageUrl || h.image ? (
                    <img
                      src={h.imageUrl || h.image}
                      alt={h.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-3xl">🐎</div>
                  )}
                </div>

                {/* Thông tin chính */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#E10600] transition-colors truncate">
                      {h.name}
                    </h3>
                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${h.approvalStatus === "APPROVED" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                        h.approvalStatus === "REJECTED" ? "text-red-400 bg-red-400/10 border-red-400/20" :
                          "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                      }`}>
                      {h.approvalStatus === "APPROVED" ? "Đã duyệt" :
                        h.approvalStatus === "REJECTED" ? "Từ chối" : "Chờ duyệt"}
                    </span>
                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${h.healthStatus === "HEALTHY" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                        h.healthStatus === "SICK" ? "text-red-400 bg-red-400/10 border-red-400/20" :
                          h.healthStatus === "INJURED" ? "text-orange-400 bg-orange-400/10 border-orange-400/20" :
                            "text-gray-400 bg-gray-400/10 border-gray-400/20"
                      }`}>
                      {h.healthStatus === "HEALTHY" ? "Khỏe" :
                        h.healthStatus === "SICK" ? "Bệnh" :
                          h.healthStatus === "INJURED" ? "Đau" : "Nghỉ"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {h.breed ?? "Giống chưa rõ"} · {h.gender === "MALE" ? "Đực" : h.gender === "FEMALE" ? "Cái" : h.gender === "GELDING" ? "Thiến" : "—"}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-white/60">
                    <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 rounded-lg px-2 py-1">
                      <User className="size-3" />
                      <span className="truncate max-w-[120px]">{getOwnerName(h.ownerId)}</span>
                    </div>
                    <span>Tuổi: <strong className="text-white">{h.age ?? "—"}</strong></span>
                    <span>Cân nặng: <strong className="text-white">{h.weightKg ? `${h.weightKg} kg` : "—"}</strong></span>
                    <span>Tốc độ: <strong className="text-white">{h.baseSpeed ? `${h.baseSpeed} km/h` : "—"}</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 sm:ml-4 w-full sm:w-auto mt-4 sm:mt-0">
                  <button
                    onClick={() => setSelectedHorse(h)}
                    className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] text-xs font-bold transition flex items-center justify-center"
                  >
                    Xem chi tiết
                  </button>
                  <button
                    onClick={() => handleDelete(h)}
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

      {/* Modal chi tiết chiến mã */}
      {selectedHorse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#15151E] p-6 md:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh] animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-200">
            <button
              onClick={() => {
                setSelectedHorse(null);
                setShowRejectForm(false);
                setRejectionInput("");
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white text-xl transition"
            >
              ✕
            </button>

            <h3 className="text-xl font-black uppercase text-white tracking-tight border-b border-white/10 pb-3 mb-5">
              Chi tiết chiến mã
            </h3>

            <div className="grid gap-6 md:grid-cols-12">
              {/* Image & Stats */}
              <div className="md:col-span-5 space-y-4">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center">
                  {selectedHorse.image || selectedHorse.imageUrl ? (
                    <img
                      src={selectedHorse.image || selectedHorse.imageUrl}
                      alt={selectedHorse.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-5xl">🐎</div>
                  )}
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/50">Tốc độ nền:</span>
                    <span className="font-bold text-white">{selectedHorse.baseSpeed ?? 60} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Thể lực:</span>
                    <span className="font-bold text-white">{selectedHorse.staminaScore ?? 70}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Trạng thái:</span>
                    <span className="font-bold text-white uppercase">{selectedHorse.status}</span>
                  </div>
                </div>
              </div>

              {/* Information */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <h4 className="text-2xl font-black text-white uppercase tracking-tight">{selectedHorse.name}</h4>
                  <p className="text-xs text-white/40 mt-0.5 uppercase tracking-wider font-bold">
                    {selectedHorse.breed ?? "Giống chưa rõ"} · {selectedHorse.color ?? "Màu chưa rõ"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-y border-white/5 py-3 text-xs">
                  <div>
                    <span className="text-white/40 block">Giới tính:</span>
                    <span className="font-bold text-white uppercase">{selectedHorse.gender === "MALE" ? "Đực" : selectedHorse.gender === "FEMALE" ? "Cái" : selectedHorse.gender === "GELDING" ? "Thiến" : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Tuổi:</span>
                    <span className="font-bold text-white">{selectedHorse.age ?? "N/A"} tuổi</span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Cân nặng:</span>
                    <span className="font-bold text-white">{selectedHorse.weightKg ? `${selectedHorse.weightKg} kg` : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Chiều cao:</span>
                    <span className="font-bold text-white">{selectedHorse.heightCm ? `${selectedHorse.heightCm} cm` : "N/A"}</span>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-1.5 text-xs">
                  <h5 className="font-bold text-[#E10600] uppercase tracking-wider text-[10px]">Chủ hiện tại</h5>
                  <p className="font-bold text-white text-sm">{typeof selectedHorse.ownerId === 'object' ? selectedHorse.ownerId?.fullName : selectedHorse.ownerId}</p>
                  {typeof selectedHorse.ownerId === 'object' && selectedHorse.ownerId?.email && (
                    <p className="text-white/60">{selectedHorse.ownerId.email}</p>
                  )}
                </div>

                {/* Approval Status & Date */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-1 text-xs">
                  <h5 className="font-bold text-white/40 uppercase tracking-widest text-[9px]">Tình trạng kiểm duyệt</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${selectedHorse.approvalStatus === "APPROVED" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                      selectedHorse.approvalStatus === "REJECTED" ? "text-red-400 bg-red-400/10 border-red-400/20" :
                        "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                      }`}>
                      {selectedHorse.approvalStatus === "APPROVED" ? "Đã duyệt" :
                        selectedHorse.approvalStatus === "REJECTED" ? "Từ chối" : "Chờ kiểm duyệt"}
                    </span>
                  </div>
                  {selectedHorse.approvalStatus === "APPROVED" && selectedHorse.approvedAt && (
                    <p className="text-white/60 text-[11px] mt-1.5">
                      <span className="text-white/40 font-semibold">Ngày được duyệt:</span> {new Date(selectedHorse.approvedAt).toLocaleString("vi-VN")}
                    </p>
                  )}
                  {selectedHorse.approvalStatus === "REJECTED" && selectedHorse.rejectionReason && (
                    <div className="mt-2 text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg p-2.5">
                      <span className="font-bold block">Lý do không được duyệt:</span>
                      <span className="text-white/85 italic">{selectedHorse.rejectionReason}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedHorse.description && (
              <div className="mt-5 text-xs text-white/80 space-y-1">
                <span className="text-white/40 block font-bold uppercase tracking-wider">Mô tả đặc điểm:</span>
                <p className="bg-white/[0.01] border border-white/5 rounded-xl p-3.5 leading-relaxed italic">{selectedHorse.description}</p>
              </div>
            )}

            {/* Admin actions (Approve/Reject) */}
            <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
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
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 h-10 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5"
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
                        className="w-full rounded-xl border border-white/10 bg-[#15151E] p-3 text-xs text-white placeholder:text-white/30 outline-none transition focus:border-[#E10600] focus:ring-2 focus:ring-[#E10600]/20"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowRejectForm(false)}
                          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5 transition"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleReject(selectedHorse._id)}
                          disabled={actionLoading === selectedHorse._id || !rejectionInput.trim()}
                          className="rounded-lg bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs text-white font-bold transition disabled:opacity-40"
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
                    setSelectedHorse(null);
                    setShowRejectForm(false);
                    setRejectionInput("");
                  }}
                  className="rounded-xl border border-white/10 px-5 h-10 text-xs text-white/70 hover:bg-white/5 transition"
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
