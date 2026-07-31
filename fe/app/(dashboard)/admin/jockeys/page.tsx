"use client";
import Image from "next/image";

import { PageHeader } from "@/components/layout/page-header";
import { jockeysApi, type JockeyItem } from "@/lib/api-client";
import {
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Mail,
  Shield,
  ShieldAlert,
  Trophy,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const STATUSES = ["ACTIVE", "UNAVAILABLE", "SUSPENDED"];
const statusColors: Record<string, string> = {
  ACTIVE: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  available: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  unavailable: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  suspended: "text-red-400 bg-red-400/10 border-red-400/20",
};

const APPROVAL_STATUSES = [
  { value: "", label: "Tất cả kiểm duyệt" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Bị từ chối" },
];

const approvalColors: Record<string, string> = {
  PENDING: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  APPROVED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  REJECTED: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

export default function AdminJockeysPage() {
  const [jockeys, setJockeys] = useState<JockeyItem[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterApproval, setFilterApproval] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Detail Modal State
  const [selectedJockeyDetail, setSelectedJockeyDetail] = useState<JockeyItem | null>(null);

  // Rejection Modal State
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Preview Image Modal State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchJockeys = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await jockeysApi.listAdmin({
          page,
          limit: 15,
          status: filterStatus || undefined,
          approvalStatus: filterApproval || undefined,
        });
        setJockeys(res.data);
        setMeta(res.meta);
      } catch (e) {
        toast.error((e as Error).message ?? "Lỗi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    },
    [filterStatus, filterApproval],
  );

  useEffect(() => {
    void fetchJockeys(1);
  }, [fetchJockeys]);

  const handleChangeStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await jockeysApi.changeStatus(id, status);
      toast.success(`Đã cập nhật status → ${status}`);
      await fetchJockeys(meta.page);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await jockeysApi.changeApproval(id, "APPROVED");
      toast.success("Đã phê duyệt hồ sơ Jockey thành công!");
      await fetchJockeys(meta.page);
    } catch (e) {
      toast.error((e as Error).message ?? "Lỗi phê duyệt hồ sơ");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId || !rejectionReason.trim()) return;
    setActionLoading(rejectingId);
    try {
      await jockeysApi.changeApproval(rejectingId, "REJECTED", rejectionReason);
      toast.success("Đã từ chối hồ sơ Jockey!");
      setRejectingId(null);
      setRejectionReason("");
      await fetchJockeys(meta.page);
    } catch (e) {
      toast.error((e as Error).message ?? "Lỗi từ chối hồ sơ");
    } finally {
      setActionLoading(null);
    }
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
        description="Xem toàn bộ jockey profiles bao gồm cả inactive/suspended. Duyệt thông tin bằng cấp, giấy phép và trạng thái hoạt động của Jockey."
      />

      <div className="flex gap-3">
        <select
          className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="" className="bg-card text-foreground">
            Tất cả Status
          </option>
          {STATUSES.map((s) => (
            <option key={s} value={s} className="bg-card text-foreground">
              {s}
            </option>
          ))}
        </select>

        <select
          className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none"
          value={filterApproval}
          onChange={(e) => setFilterApproval(e.target.value)}
        >
          {APPROVAL_STATUSES.map((a) => (
            <option
              key={a.value}
              value={a.value}
              className="bg-card text-foreground"
            >
              {a.label}
            </option>
          ))}
        </select>

        <div className="text-sm text-muted-foreground flex items-center">
          Tổng: <strong className="text-foreground ml-1">{meta.total}</strong>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-3">
            <Image
              src="/skeletonHorse.gif"
              alt="Đang tải..."
              width={80}
              height={80}
              unoptimized
              className="object-contain mx-auto"
            />
            <p className="text-xs font-mono uppercase tracking-widest">
              Đang tải hồ sơ Jockey...
            </p>
          </div>
        ) : jockeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/70 space-y-3">
            <ShieldAlert className="size-10 text-foreground/20" />
            <p className="text-sm font-bold uppercase">
              Không tìm thấy hồ sơ nào
            </p>
            <p className="text-xs text-muted-foreground">
              Các jockey đăng ký hồ sơ sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted whitespace-nowrap">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Jockey
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Giấy phép
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Thể chất & Bio
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Kiểm duyệt
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Races / Wins
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jockeys.map((j) => (
                  <tr
                    key={j._id}
                    onClick={() => setSelectedJockeyDetail(j)}
                    className="hover:bg-muted/80 transition-colors group cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                          <User className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-none">
                            {getUserName(j.userId)}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {getUserEmail(j.userId)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {j.licenseImage ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(j.licenseImage ?? null);
                          }}
                          className="block relative h-12 w-20 rounded-md overflow-hidden border border-border group/img focus:outline-none"
                        >
                          <img
                            src={j.licenseImage}
                            alt="Giấy phép"
                            className="object-cover w-full h-full transition-transform group-hover/img:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="size-4 text-white" />
                          </div>
                        </button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/50 italic">
                          -
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="space-y-1">
                        <p className="text-xs text-foreground/70">
                          {j.experienceYears ?? 0} năm KN · {j.heightCm ?? "?"}
                          cm · {j.weightKg ?? "?"}kg
                        </p>
                        {j.certificates && (
                          <p className="text-xs text-teal-300 font-semibold flex items-center gap-1">
                            <FileText className="size-3 shrink-0" />
                            Cert: {j.certificates}
                          </p>
                        )}
                        {j.bio ? (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {j.bio}
                          </p>
                        ) : (
                          <p className="text-[11px] text-foreground/30 italic">
                            Chưa điền tiểu sử
                          </p>
                        )}

                        {j.approvalStatus === "REJECTED" &&
                          j.rejectionReason && (
                            <p className="text-[10px] text-red-400 bg-red-400/5 p-1.5 rounded border border-red-500/10 mt-1">
                              Lý do loại: {j.rejectionReason}
                            </p>
                          )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${approvalColors[j.approvalStatus || "PENDING"]}`}
                      >
                        {j.approvalStatus === "PENDING"
                          ? "Chờ duyệt"
                          : j.approvalStatus === "APPROVED"
                            ? "Đã duyệt"
                            : "Từ chối"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground">
                      {j.totalRaces ?? 0} / {j.wins ?? 0}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColors[j.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJockeyDetail(j);
                          }}
                          className="flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-xs font-semibold text-sky-400 transition hover:scale-105 hover:bg-sky-500/20"
                        >
                          <Eye className="size-3" />
                          Chi tiết
                        </button>
                        {j.approvalStatus === "PENDING" ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              disabled={actionLoading !== null}
                              onClick={(e) => {
                                e.stopPropagation();
                                setRejectingId(j._id);
                              }}
                              className="h-8 px-3 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-[11px] font-bold uppercase text-red-400 transition"
                            >
                              Từ chối
                            </button>
                            <button
                              disabled={actionLoading !== null}
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleApprove(j._id);
                              }}
                              className="h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[11px] font-bold uppercase text-black transition"
                            >
                              Duyệt hồ sơ
                            </button>
                          </div>
                        ) : (
                          <select
                            value={j.status}
                            disabled={actionLoading !== null}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              void handleChangeStatus(j._id, e.target.value);
                            }}
                            className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-foreground focus:border-primary/50 focus:outline-none disabled:opacity-50 cursor-pointer w-32"
                          >
                            <option
                              value="available"
                              className="bg-card text-foreground"
                            >
                              available
                            </option>
                            <option
                              value="unavailable"
                              className="bg-card text-foreground"
                            >
                              unavailable
                            </option>
                            <option
                              value="suspended"
                              className="bg-card text-foreground"
                            >
                              suspended
                            </option>
                          </select>
                        )}
                      </div>
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
          <button
            onClick={() => fetchJockeys(meta.page - 1)}
            disabled={meta.page <= 1}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition"
          >
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">
            Trang {meta.page} / {meta.totalPages}
          </span>
          <button
            onClick={() => fetchJockeys(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition"
          >
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      {/* Modal Xem Chi Tiết Jockey */}
      {selectedJockeyDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedJockeyDetail(null)}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-black">
                  <User className="size-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {getUserName(selectedJockeyDetail.userId)}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Mail className="size-3" /> {getUserEmail(selectedJockeyDetail.userId) || "Chưa có email"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJockeyDetail(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Statuses summary */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3.5 rounded-xl border border-border/50 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Kiểm duyệt:</span>
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${approvalColors[selectedJockeyDetail.approvalStatus || "PENDING"]}`}>
                  {selectedJockeyDetail.approvalStatus === "PENDING"
                    ? "Chờ duyệt"
                    : selectedJockeyDetail.approvalStatus === "APPROVED"
                      ? "Đã duyệt"
                      : "Từ chối"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Trạng thái:</span>
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColors[selectedJockeyDetail.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                  {selectedJockeyDetail.status}
                </span>
              </div>
            </div>

            {selectedJockeyDetail.approvalStatus === "REJECTED" && selectedJockeyDetail.rejectionReason && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 space-y-1">
                <p className="font-bold uppercase text-[10px]">Lý do từ chối:</p>
                <p>{selectedJockeyDetail.rejectionReason}</p>
              </div>
            )}

            {/* Main Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                  <Award className="size-3" /> Thông tin chuyên môn
                </p>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Mã giấy phép</span>
                  <span className="font-semibold text-foreground">{selectedJockeyDetail.licenseNumber || "Chưa cập nhật"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Kinh nghiệm</span>
                  <span className="font-semibold text-foreground">{selectedJockeyDetail.experienceYears ?? 0} năm</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Chiều cao & Cân nặng</span>
                  <span className="font-semibold text-foreground">{selectedJockeyDetail.heightCm ?? "?"} cm / {selectedJockeyDetail.weightKg ?? "?"} kg</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Trình độ / Chuyên môn</span>
                  <span className="font-semibold text-foreground">{selectedJockeyDetail.skillLevel || selectedJockeyDetail.specialty || "Tiêu chuẩn"}</span>
                </div>
              </div>

              <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Trophy className="size-3" /> Thành tích thi đấu
                </p>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Tổng số trận đua</span>
                  <span className="font-semibold text-foreground">{selectedJockeyDetail.totalRaces ?? 0} trận</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Số trận thắng</span>
                  <span className="font-semibold text-emerald-400">{selectedJockeyDetail.wins ?? 0} chiến thắng</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Tỷ lệ thắng</span>
                  <span className="font-semibold text-amber-300">
                    {selectedJockeyDetail.totalRaces && selectedJockeyDetail.totalRaces > 0
                      ? ((selectedJockeyDetail.wins ?? 0) / selectedJockeyDetail.totalRaces * 100).toFixed(1)
                      : "0"}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Bằng cấp & Chứng chỉ</span>
                  <span className="font-semibold text-teal-300">{selectedJockeyDetail.certificates || "Chưa có"}</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5 text-xs">
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Tiểu sử / Bio</p>
              <p className="bg-muted/40 p-3 rounded-xl border border-border/50 text-foreground leading-relaxed">
                {selectedJockeyDetail.bio || "Chưa điền tiểu sử cá nhân."}
              </p>
            </div>

            {/* License Image Preview inside Modal */}
            {selectedJockeyDetail.licenseImage && (
              <div className="space-y-1.5 text-xs">
                <p className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Ảnh giấy phép hành nghề</p>
                <div
                  onClick={() => setPreviewImage(selectedJockeyDetail.licenseImage ?? null)}
                  className="relative h-40 w-full rounded-xl overflow-hidden border border-border cursor-pointer group"
                >
                  <img
                    src={selectedJockeyDetail.licenseImage}
                    alt="Giấy phép"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                    <Eye className="size-4" /> Xem ảnh phóng to
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-border pt-4 text-xs">
              {selectedJockeyDetail.approvalStatus === "PENDING" ? (
                <div className="flex gap-2">
                  <button
                    disabled={actionLoading !== null}
                    onClick={() => {
                      const id = selectedJockeyDetail._id;
                      setSelectedJockeyDetail(null);
                      setRejectingId(id);
                    }}
                    className="h-9 px-4 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold uppercase transition"
                  >
                    Từ chối
                  </button>
                  <button
                    disabled={actionLoading !== null}
                    onClick={() => {
                      const id = selectedJockeyDetail._id;
                      setSelectedJockeyDetail(null);
                      void handleApprove(id);
                    }}
                    className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold uppercase text-black transition"
                  >
                    Duyệt hồ sơ
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[11px]">Đổi trạng thái:</span>
                  <select
                    value={selectedJockeyDetail.status}
                    disabled={actionLoading !== null}
                    onChange={(e) => {
                      const newSt = e.target.value;
                      const id = selectedJockeyDetail._id;
                      setSelectedJockeyDetail(null);
                      void handleChangeStatus(id, newSt);
                    }}
                    className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-foreground focus:border-primary/50 focus:outline-none cursor-pointer"
                  >
                    <option value="available" className="bg-card text-foreground">available</option>
                    <option value="unavailable" className="bg-card text-foreground">unavailable</option>
                    <option value="suspended" className="bg-card text-foreground">suspended</option>
                  </select>
                </div>
              )}
              <button
                onClick={() => setSelectedJockeyDetail(null)}
                className="rounded-xl border border-border bg-muted px-5 py-2 font-semibold text-foreground hover:bg-white/[0.08] transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert className="size-6 shrink-0" />
              <h3 className="text-lg font-bold uppercase">
                Từ chối hồ sơ Jockey
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Vui lòng nhập lý do từ chối phê duyệt hồ sơ Jockey này. Lý do sẽ
              được hiển thị trên dashboard của Jockey để họ sửa đổi và nộp lại.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  Lý do từ chối
                </label>
                <textarea
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ví dụ: Ảnh chụp giấy phép bị mờ hoặc không khớp thông tin..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder-white/30 focus:border-red-500 focus:outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingId(null);
                    setRejectionReason("");
                  }}
                  className="h-9 px-4 rounded-xl border border-border bg-transparent text-xs font-bold uppercase text-foreground hover:bg-muted transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-bold uppercase text-black transition"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition"
            >
              <X className="size-5" />
            </button>
            <img
              src={previewImage}
              alt="Giấy phép Preview"
              className="max-w-full max-h-[85vh] object-contain block"
            />
          </div>
        </div>
      )}
    </main>
  );
}
