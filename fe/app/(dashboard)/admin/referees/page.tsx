"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ShieldAlert, FileText, User, Eye, Mail, Phone, Shield, Award, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { refereeProfilesApi, type RefereeProfileItem } from "@/lib/api-client";
import { toast } from "sonner";

const APPROVAL_STATUSES = [
  { value: "", label: "Tất cả kiểm duyệt" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Bị từ chối" },
];

const statusColors: Record<string, string> = {
  available: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  unavailable: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  suspended: "text-red-400 bg-red-400/10 border-red-400/20",
};

const approvalColors: Record<string, string> = {
  PENDING: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  APPROVED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  REJECTED: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

export default function AdminRefereesPage() {
  const [profiles, setProfiles] = useState<RefereeProfileItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filterApproval, setFilterApproval] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Detail Modal State
  const [selectedRefereeDetail, setSelectedRefereeDetail] = useState<RefereeProfileItem | null>(null);

  // Rejection Modal State
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchProfiles = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await refereeProfilesApi.listAdmin({
        page,
        limit: 15,
        approvalStatus: filterApproval || undefined,
      });
      setProfiles(res.data);
      setMeta(res.meta);
    } catch (e) {
      toast.error((e as Error).message ?? "Lỗi tải dữ liệu trọng tài");
    } finally {
      setLoading(false);
    }
  }, [filterApproval]);

  useEffect(() => {
    void fetchProfiles(1);
  }, [fetchProfiles]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await refereeProfilesApi.changeApproval(id, "APPROVED");
      toast.success("Đã phê duyệt hồ sơ trọng tài thành công!");
      void fetchProfiles(meta.page);
    } catch (e) {
      toast.error((e as Error).message ?? "Lỗi phê duyệt");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    setActionLoading(rejectingId);
    try {
      await refereeProfilesApi.changeApproval(rejectingId, "REJECTED", rejectionReason);
      toast.success("Đã từ chối hồ sơ trọng tài.");
      setRejectingId(null);
      setRejectionReason("");
      void fetchProfiles(meta.page);
    } catch (e) {
      toast.error((e as Error).message ?? "Lỗi từ chối hồ sơ");
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeStatus = async (id: string, status: "available" | "unavailable" | "suspended") => {
    setActionLoading(id);
    try {
      await refereeProfilesApi.changeStatus(id, status);
      toast.success(`Đã cập nhật trạng thái hoạt động: ${status}`);
      void fetchProfiles(meta.page);
    } catch (e) {
      toast.error((e as Error).message ?? "Lỗi cập nhật trạng thái");
    } finally {
      setActionLoading(null);
    }
  };

  const getUserName = (userId: RefereeProfileItem["userId"]) => {
    if (!userId) return "—";
    if (typeof userId === "object") return userId.fullName;
    return userId;
  };

  const getUserEmail = (userId: RefereeProfileItem["userId"]) => {
    if (!userId || typeof userId !== "object") return "";
    return userId.email;
  };

  const getUserPhone = (userId: RefereeProfileItem["userId"]) => {
    if (!userId || typeof userId !== "object") return "";
    return userId.phone || "";
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4">
      <PageHeader
        eyebrow="Referee Registry"
        title="Quản Lý Trọng Tài"
        description="Xem danh sách, kiểm tra thông tin bằng cấp và thực hiện phê duyệt / từ chối hồ sơ đăng ký làm trọng tài giám sát cuộc đua."
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card/40 p-4 rounded-2xl border border-border">
        <div className="flex flex-wrap gap-2">
          {APPROVAL_STATUSES.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterApproval(tab.value)}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${filterApproval === tab.value
                  ? "bg-primary text-foreground shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          Tổng hồ sơ: <span className="text-foreground font-bold">{meta.total}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/90 overflow-hidden shadow-2xl backdrop-blur-md">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-3">
            <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
            <p className="text-xs font-mono uppercase tracking-widest">Đang tải hồ sơ trọng tài...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/70 space-y-3">
            <ShieldAlert className="size-10 text-foreground/20" />
            <p className="text-sm font-bold uppercase">Không tìm thấy hồ sơ nào</p>
            <p className="text-xs text-muted-foreground">Các trọng tài đăng ký hồ sơ sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted whitespace-nowrap">
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Trọng tài</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Giấy phép</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kinh nghiệm</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bằng cấp & Bio</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kiểm duyệt</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Hoạt động</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {profiles.map((p) => (
                  <tr
                    key={p._id}
                    onClick={() => setSelectedRefereeDetail(p)}
                    className="hover:bg-muted/80 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                          <User className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-none">{getUserName(p.userId)}</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">{getUserEmail(p.userId)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-foreground/70">{p.licenseNo ?? "—"}</td>
                    <td className="px-6 py-4 text-xs text-foreground/70">{p.experienceYears ?? 0} năm</td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="space-y-1">
                        {p.certificates && (
                          <p className="text-xs text-teal-300 font-semibold flex items-center gap-1">
                            <FileText className="size-3 shrink-0" />
                            Cert: {p.certificates}
                          </p>
                        )}
                        {p.bio ? (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">{p.bio}</p>
                        ) : (
                          <p className="text-[11px] text-foreground/30 italic">Chưa điền tiểu sử</p>
                        )}
                        {p.licenseImage && (
                          <div className="pt-1">
                            <a
                              href={p.licenseImage}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[10px] text-sky-400 font-bold hover:underline"
                            >
                              <Eye className="size-3" />
                              Xem ảnh Giấy phép
                            </a>
                          </div>
                        )}
                        {p.approvalStatus === "REJECTED" && p.rejectionReason && (
                          <p className="text-[10px] text-red-400 bg-red-400/5 p-1.5 rounded border border-red-500/10 mt-1">
                            Lý do loại: {p.rejectionReason}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${approvalColors[p.approvalStatus]}`}>
                        {p.approvalStatus === "PENDING" ? "Chờ duyệt" : p.approvalStatus === "APPROVED" ? "Đã duyệt" : "Từ chối"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColors[p.status]}`}>
                        {p.status === "available" ? "Sẵn sàng" : p.status === "unavailable" ? "Bận" : "Tạm đình chỉ"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRefereeDetail(p);
                          }}
                          className="flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-xs font-semibold text-sky-400 transition hover:scale-105 hover:bg-sky-500/20"
                        >
                          <Eye className="size-3" />
                          Chi tiết
                        </button>
                        {p.approvalStatus === "PENDING" ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              disabled={actionLoading !== null}
                              onClick={(e) => {
                                e.stopPropagation();
                                setRejectingId(p._id);
                              }}
                              className="h-8 px-3 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-[11px] font-bold uppercase text-red-400 transition"
                            >
                              Từ chối
                            </button>
                            <button
                              disabled={actionLoading !== null}
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleApprove(p._id);
                              }}
                              className="h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[11px] font-bold uppercase text-black transition"
                            >
                              Duyệt hồ sơ
                            </button>
                          </div>
                        ) : (
                          <select
                            value={p.status}
                            disabled={actionLoading !== null}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              void handleChangeStatus(p._id, e.target.value as "available" | "unavailable" | "suspended");
                            }}
                            className="rounded-lg border border-border bg-muted/80 px-3 py-1.5 text-xs text-foreground focus:border-primary/50 focus:outline-none disabled:opacity-50 cursor-pointer w-32"
                          >
                            <option value="available" className="bg-card text-foreground">Sẵn sàng</option>
                            <option value="unavailable" className="bg-card text-foreground">Bận</option>
                            <option value="suspended" className="bg-card text-foreground">Tạm đình chỉ</option>
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
            onClick={() => fetchProfiles(meta.page - 1)}
            disabled={meta.page <= 1}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition"
          >
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">Trang {meta.page} / {meta.totalPages}</span>
          <button
            onClick={() => fetchProfiles(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition"
          >
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      {/* Modal Xem Chi Tiết Trọng Tài */}
      {selectedRefereeDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedRefereeDetail(null)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200"
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
                    {getUserName(selectedRefereeDetail.userId)}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Mail className="size-3" /> {getUserEmail(selectedRefereeDetail.userId) || "Chưa có email"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRefereeDetail(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3.5 rounded-xl border border-border/50 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Kiểm duyệt:</span>
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${approvalColors[selectedRefereeDetail.approvalStatus]}`}>
                  {selectedRefereeDetail.approvalStatus === "PENDING"
                    ? "Chờ duyệt"
                    : selectedRefereeDetail.approvalStatus === "APPROVED"
                      ? "Đã duyệt"
                      : "Từ chối"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Hoạt động:</span>
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColors[selectedRefereeDetail.status]}`}>
                  {selectedRefereeDetail.status === "available" ? "Sẵn sàng" : selectedRefereeDetail.status === "unavailable" ? "Bận" : "Tạm đình chỉ"}
                </span>
              </div>
            </div>

            {selectedRefereeDetail.approvalStatus === "REJECTED" && selectedRefereeDetail.rejectionReason && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 space-y-1">
                <p className="font-bold uppercase text-[10px]">Lý do từ chối:</p>
                <p>{selectedRefereeDetail.rejectionReason}</p>
              </div>
            )}

            {/* Grid Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-muted/30 p-4 rounded-xl border border-border/50">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Mã số giấy phép</span>
                <span className="font-semibold text-foreground font-mono mt-0.5 block">{selectedRefereeDetail.licenseNo || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Kinh nghiệm</span>
                <span className="font-semibold text-foreground mt-0.5 block">{selectedRefereeDetail.experienceYears ?? 0} năm</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Số điện thoại</span>
                <span className="font-semibold text-foreground mt-0.5 block">{getUserPhone(selectedRefereeDetail.userId) || "Chưa cập nhật"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Bằng cấp & Chứng chỉ</span>
                <span className="font-semibold text-teal-300 mt-0.5 block">{selectedRefereeDetail.certificates || "Chưa có"}</span>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5 text-xs">
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Tiểu sử / Mô tả kinh nghiệm</p>
              <p className="bg-muted/40 p-3 rounded-xl border border-border/50 text-foreground leading-relaxed">
                {selectedRefereeDetail.bio || "Chưa điền tiểu sử."}
              </p>
            </div>

            {/* License Image */}
            {selectedRefereeDetail.licenseImage && (
              <div className="space-y-1.5 text-xs">
                <p className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Ảnh giấy phép chứng nhận trọng tài</p>
                <a
                  href={selectedRefereeDetail.licenseImage}
                  target="_blank"
                  rel="noreferrer"
                  className="block relative h-40 w-full rounded-xl overflow-hidden border border-border group"
                >
                  <img
                    src={selectedRefereeDetail.licenseImage}
                    alt="Giấy phép"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                    <Eye className="size-4" /> Xem ảnh gốc trong tab mới
                  </div>
                </a>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-border pt-4 text-xs">
              {selectedRefereeDetail.approvalStatus === "PENDING" ? (
                <div className="flex gap-2">
                  <button
                    disabled={actionLoading !== null}
                    onClick={() => {
                      const id = selectedRefereeDetail._id;
                      setSelectedRefereeDetail(null);
                      setRejectingId(id);
                    }}
                    className="h-9 px-4 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold uppercase transition"
                  >
                    Từ chối
                  </button>
                  <button
                    disabled={actionLoading !== null}
                    onClick={() => {
                      const id = selectedRefereeDetail._id;
                      setSelectedRefereeDetail(null);
                      void handleApprove(id);
                    }}
                    className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold uppercase text-black transition"
                  >
                    Duyệt hồ sơ
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[11px]">Cập nhật trạng thái:</span>
                  <select
                    value={selectedRefereeDetail.status}
                    disabled={actionLoading !== null}
                    onChange={(e) => {
                      const newSt = e.target.value as "available" | "unavailable" | "suspended";
                      const id = selectedRefereeDetail._id;
                      setSelectedRefereeDetail(null);
                      void handleChangeStatus(id, newSt);
                    }}
                    className="rounded-lg border border-border bg-muted/80 px-3 py-1.5 text-xs text-foreground focus:border-primary/50 focus:outline-none cursor-pointer"
                  >
                    <option value="available" className="bg-card text-foreground">Sẵn sàng</option>
                    <option value="unavailable" className="bg-card text-foreground">Bận</option>
                    <option value="suspended" className="bg-card text-foreground">Tạm đình chỉ</option>
                  </select>
                </div>
              )}
              <button
                onClick={() => setSelectedRefereeDetail(null)}
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
              <h3 className="text-lg font-bold uppercase">Từ chối hồ sơ trọng tài</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Vui lòng nhập lý do từ chối phê duyệt hồ sơ này. Lý do sẽ được hiển thị trên dashboard của trọng tài để họ sửa đổi và nộp lại.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Lý do từ chối</label>
                <textarea
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ví dụ: Giấy phép hết hạn hoặc bằng cấp không hợp lệ..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder-white/30 focus:border-red-500 focus:outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingId(null);
                    setRejectionReason("");
                  }}
                  className="h-10 px-4 rounded-xl border border-border hover:bg-muted text-xs font-bold uppercase text-foreground"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading !== null}
                  className="h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold uppercase text-foreground disabled:opacity-50"
                >
                  Xác nhận loại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}


