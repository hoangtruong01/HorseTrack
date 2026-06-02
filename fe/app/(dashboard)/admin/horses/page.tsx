"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Trash2, ShieldAlert } from "lucide-react";
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
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
          <input
            type="text"
            placeholder="Tìm tên ngựa, giống ngựa, tên chủ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-[#15151E]/60 px-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#E10600] focus:ring-4 focus:ring-[#E10600]/15"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#E10600] hover:bg-[#B80500] text-white px-5 text-xs font-bold uppercase tracking-wider transition shrink-0"
          >
            Tìm kiếm
          </button>
        </form>
        <div className="text-sm text-muted-foreground self-center">Tổng: <strong className="text-white">{meta.total}</strong> ngựa</div>
      </div>

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
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Trạng thái duyệt</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Sức khoẻ</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {horses.map((h) => (
                  <tr key={h._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {h.imageUrl || h.image ? (
                          <img src={h.imageUrl || h.image} alt={h.name} className="size-10 rounded-xl object-cover border border-white/10" />
                        ) : (
                          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-sm">🐎</div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-white">{h.name}</p>
                          <p className="text-xs text-muted-foreground">{h.breed ?? "—"} · {h.gender === "MALE" ? "Đực" : h.gender === "FEMALE" ? "Cái" : h.gender === "GELDING" ? "Thiến" : "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-white">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="font-semibold">{getOwnerName(h.ownerId)}</span>
                        <button
                          onClick={() => setSelectedHorse(h)}
                          className="rounded-lg bg-[#E10600]/10 border border-[#E10600]/25 text-[#E10600] hover:bg-[#E10600]/20 px-3 py-1 text-xs font-bold transition"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${
                        h.approvalStatus === "APPROVED" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                        h.approvalStatus === "REJECTED" ? "text-red-400 bg-red-400/10 border-red-400/20" :
                        "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                      }`}>
                        {h.approvalStatus === "APPROVED" ? "Đã duyệt" :
                         h.approvalStatus === "REJECTED" ? "Bị từ chối" : "Chờ duyệt"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${healthColors[h.healthStatus] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                        {h.healthStatus}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#15151E] p-6 md:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh]">
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
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                      selectedHorse.approvalStatus === "APPROVED" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
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
