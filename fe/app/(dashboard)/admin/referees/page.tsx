"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  FileText,
  User,
  Eye,
  Mail,
  Phone,
  X,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle,
} from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

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

  const getPortraitPhoto = (p: RefereeProfileItem) => {
    if (p.portraitImage) return p.portraitImage;
    if (p.userId && typeof p.userId === "object") return p.userId.avatar;
    return undefined;
  };

  const getCertPhotos = (p: RefereeProfileItem) => {
    if (p.certificateImages && p.certificateImages.length > 0) {
      return p.certificateImages;
    }
    const single = p.certificateImage || p.licenseImage;
    return single ? [single] : [];
  };

  const formatCertificatePreview = (certText?: string) => {
    if (!certText || !certText.trim()) return null;
    const items = certText.split(/[,;\n]+/).map((c) => c.trim()).filter(Boolean);
    if (items.length === 0) return null;
    if (items.length === 1) {
      return items[0].length > 30 ? `${items[0].slice(0, 30)}...` : items[0];
    }
    return `${items[0]}, ...`;
  };

  return (
    <main className="space-y-6 max-w-7xl mx-auto px-4">
      <PageHeader
        eyebrow="Referee Registry"
        title="Quản Lý Trọng Tài"
        description="Xem danh sách, kiểm tra thông tin bằng cấp và thực hiện phê duyệt / từ chối hồ sơ đăng ký làm trọng tài giám sát cuộc đua."
      />

      {/* Filter Bar & View Mode Toggle */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card/60 p-4 rounded-2xl border border-border backdrop-blur-md shadow-sm">
        <div className="flex flex-wrap gap-2">
          {APPROVAL_STATUSES.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterApproval(tab.value)}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${filterApproval === tab.value
                  ? "bg-primary text-foreground shadow-lg"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewMode("card")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === "card"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <LayoutGrid className="size-3.5" /> Dạng Thẻ Card
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === "table"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <TableIcon className="size-3.5" /> Dạng Bảng
            </button>
          </div>

          <div className="text-xs text-muted-foreground font-mono">
            Tổng: <span className="text-foreground font-bold">{meta.total}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground space-y-3 bg-card/40 rounded-2xl border border-border">
          <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
          <p className="text-xs font-mono uppercase tracking-widest">Đang tải danh sách trọng tài...</p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground/70 space-y-3 bg-card/40 rounded-2xl border border-border">
          <ShieldAlert className="size-10 text-foreground/20" />
          <p className="text-sm font-bold uppercase">Không tìm thấy hồ sơ nào</p>
          <p className="text-xs text-muted-foreground">Các trọng tài đăng ký hồ sơ sẽ xuất hiện tại đây.</p>
        </div>
      ) : viewMode === "card" ? (
        /* CARD GRID LAYOUT (Bố trí dạng Thẻ Card dễ nhìn) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {profiles.map((p) => {
            const portrait = getPortraitPhoto(p);
            const certs = getCertPhotos(p);
            const certPreview = formatCertificatePreview(p.certificates);

            return (
              <div
                key={p._id}
                onClick={() => setSelectedRefereeDetail(p)}
                className="group relative rounded-2xl border border-border bg-card/90 hover:bg-card p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:shadow-2xl flex flex-col justify-between space-y-4 cursor-pointer"
              >
                {/* Header: Avatar, Name, Badges */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 rounded-2xl bg-primary/10 border border-primary/20 overflow-hidden shrink-0 flex items-center justify-center text-primary shadow-inner">
                        {portrait ? (
                          <img src={portrait} alt="Chân dung" className="w-full h-full object-cover" />
                        ) : (
                          <User className="size-6" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {getUserName(p.userId)}
                        </h3>
                        <p className="text-xs text-muted-foreground/80 flex items-center gap-1 mt-0.5 truncate">
                          <Mail className="size-3 shrink-0" /> {getUserEmail(p.userId) || "Chưa có email"}
                        </p>
                        <p className="text-xs text-muted-foreground/80 flex items-center gap-1 mt-0.5 truncate">
                          <Phone className="size-3 text-emerald-400 shrink-0" /> {getUserPhone(p.userId) || "Chưa có SĐT"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${approvalColors[p.approvalStatus]}`}>
                      {p.approvalStatus === "PENDING" ? "Chờ duyệt" : p.approvalStatus === "APPROVED" ? "Đã duyệt" : "Từ chối"}
                    </span>
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColors[p.status]}`}>
                      {p.status === "available" ? "Sẵn sàng" : p.status === "unavailable" ? "Bận" : "Đình chỉ"}
                    </span>
                  </div>
                </div>

                {/* Details info */}
                <div className="bg-muted/40 p-3.5 rounded-xl border border-border/50 text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Giấy phép</span>
                      <span className="font-semibold font-mono text-foreground">{p.licenseNo || "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Kinh nghiệm</span>
                      <span className="font-semibold text-foreground">{p.experienceYears ?? 0} năm</span>
                    </div>
                  </div>

                  {/* Certificate Representative Text */}
                  <div className="pt-1 border-t border-border/40">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Bằng cấp</span>
                    {certPreview ? (
                      <p className="text-xs text-teal-300 font-semibold mt-0.5 flex items-center gap-1">
                        <FileText className="size-3.5 shrink-0 text-teal-400" />
                        Bằng cấp: {certPreview}
                      </p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/60 italic mt-0.5">Chưa cập nhật bằng cấp</p>
                    )}
                  </div>

                  {/* Photo Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {certs.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-teal-300 font-bold bg-teal-400/10 px-2 py-0.5 rounded border border-teal-400/20">
                        <Eye className="size-3" />
                        {certs.length} ảnh bằng cấp
                      </span>
                    )}
                  </div>

                  {/* Rejection Reason */}
                  {p.approvalStatus === "REJECTED" && p.rejectionReason && (
                    <div className="pt-1 text-[10px] text-red-400 bg-red-400/10 p-2 rounded border border-red-500/20">
                      <strong className="uppercase block text-[9px]">Lý do từ chối:</strong>
                      <p className="line-clamp-2">{p.rejectionReason}</p>
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setSelectedRefereeDetail(p)}
                    className="flex items-center gap-1 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-400 transition hover:bg-sky-500/20"
                  >
                    <Eye className="size-3.5" />
                    Xem chi tiết
                  </button>

                  {p.approvalStatus === "PENDING" ? (
                    <div className="flex gap-1.5">
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => setRejectingId(p._id)}
                        className="h-8 px-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold uppercase text-red-400 transition"
                      >
                        Từ chối
                      </button>
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => void handleApprove(p._id)}
                        className="h-8 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold uppercase text-black transition shadow-sm"
                      >
                        Duyệt
                      </button>
                    </div>
                  ) : (
                    <select
                      value={p.status}
                      disabled={actionLoading !== null}
                      onChange={(e) => {
                        void handleChangeStatus(p._id, e.target.value as "available" | "unavailable" | "suspended");
                      }}
                      className="rounded-xl border border-border bg-muted px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
                    >
                      <option value="available">Sẵn sàng</option>
                      <option value="unavailable">Bận</option>
                      <option value="suspended">Tạm đình chỉ</option>
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW LAYOUT */
        <div className="rounded-2xl border border-border bg-card/90 overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted whitespace-nowrap">
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Trọng tài</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SĐT & Email</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Giấy phép</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kinh nghiệm</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bằng cấp & Bio</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kiểm duyệt</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Hoạt động</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {profiles.map((p) => {
                  const portrait = getPortraitPhoto(p);
                  const certs = getCertPhotos(p);
                  const certPreview = formatCertificatePreview(p.certificates);

                  return (
                    <tr
                      key={p._id}
                      onClick={() => setSelectedRefereeDetail(p)}
                      className="hover:bg-muted/80 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-primary/10 border border-primary/20 overflow-hidden shrink-0 flex items-center justify-center text-primary">
                            {portrait ? (
                              <img src={portrait} alt="Chân dung" className="w-full h-full object-cover" />
                            ) : (
                              <User className="size-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground leading-none">{getUserName(p.userId)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs space-y-0.5">
                        <p className="text-foreground/80 font-medium">{getUserPhone(p.userId) || "Chưa có SĐT"}</p>
                        <p className="text-[11px] text-muted-foreground/70">{getUserEmail(p.userId)}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-foreground/70">{p.licenseNo ?? "—"}</td>
                      <td className="px-6 py-4 text-xs text-foreground/70">{p.experienceYears ?? 0} năm</td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="space-y-1">
                          {certPreview ? (
                            <p className="text-xs text-teal-300 font-semibold flex items-center gap-1">
                              <FileText className="size-3 shrink-0" />
                              Bằng cấp: {certPreview}
                            </p>
                          ) : (
                            <p className="text-[11px] text-foreground/30 italic">Chưa điền bằng cấp</p>
                          )}
                          {p.bio && <p className="text-[11px] text-muted-foreground line-clamp-1">{p.bio}</p>}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {certs.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-teal-400 font-bold bg-teal-400/10 px-2 py-0.5 rounded border border-teal-400/20">
                                <Eye className="size-3" />
                                {certs.length} ảnh bằng cấp
                              </span>
                            )}
                          </div>
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
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedRefereeDetail(p)}
                            className="flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-xs font-semibold text-sky-400 transition hover:bg-sky-500/20"
                          >
                            <Eye className="size-3" />
                            Chi tiết
                          </button>
                          {p.approvalStatus === "PENDING" ? (
                            <div className="flex gap-2 justify-end">
                              <button
                                disabled={actionLoading !== null}
                                onClick={() => setRejectingId(p._id)}
                                className="h-8 px-3 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-[11px] font-bold uppercase text-red-400 transition"
                              >
                                Từ chối
                              </button>
                              <button
                                disabled={actionLoading !== null}
                                onClick={() => void handleApprove(p._id)}
                                className="h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[11px] font-bold uppercase text-black transition"
                              >
                                Duyệt
                              </button>
                            </div>
                          ) : (
                            <select
                              value={p.status}
                              disabled={actionLoading !== null}
                              onChange={(e) => {
                                void handleChangeStatus(p._id, e.target.value as "available" | "unavailable" | "suspended");
                              }}
                              className="rounded-lg border border-border bg-muted/80 px-3 py-1.5 text-xs text-foreground focus:border-primary/50 focus:outline-none disabled:opacity-50 cursor-pointer w-32"
                            >
                              <option value="available">Sẵn sàng</option>
                              <option value="unavailable">Bận</option>
                              <option value="suspended">Tạm đình chỉ</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => fetchProfiles(meta.page - 1)}
            disabled={meta.page <= 1}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-40 transition"
          >
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">Trang {meta.page} / {meta.totalPages}</span>
          <button
            onClick={() => fetchProfiles(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-40 transition"
          >
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      {/* Modal Xem Chi Tiết Trọng Tài (Hiển thị toàn bộ tất cả thông tin và tất cả bằng cấp) */}
      {selectedRefereeDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedRefereeDetail(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-4">
                <div className="relative size-16 rounded-2xl bg-primary/10 border border-primary/20 overflow-hidden flex items-center justify-center text-primary shrink-0 shadow-lg">
                  {getPortraitPhoto(selectedRefereeDetail) ? (
                    <img
                      src={getPortraitPhoto(selectedRefereeDetail)}
                      alt="Chân dung"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="size-8" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {getUserName(selectedRefereeDetail.userId)}
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="size-3.5 text-primary" /> {getUserEmail(selectedRefereeDetail.userId) || "Chưa có email"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="size-3.5 text-emerald-400" /> {getUserPhone(selectedRefereeDetail.userId) || "Chưa có SĐT"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedRefereeDetail(null)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-4 rounded-2xl border border-border/50 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Trạng thái kiểm duyệt:</span>
                <span className={`inline-flex rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${approvalColors[selectedRefereeDetail.approvalStatus]}`}>
                  {selectedRefereeDetail.approvalStatus === "PENDING"
                    ? "Chờ duyệt"
                    : selectedRefereeDetail.approvalStatus === "APPROVED"
                      ? "Đã duyệt"
                      : "Từ chối"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Hoạt động:</span>
                <span className={`inline-flex rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColors[selectedRefereeDetail.status]}`}>
                  {selectedRefereeDetail.status === "available" ? "Sẵn sàng" : selectedRefereeDetail.status === "unavailable" ? "Bận" : "Đình chỉ"}
                </span>
              </div>
            </div>

            {selectedRefereeDetail.approvalStatus === "REJECTED" && selectedRefereeDetail.rejectionReason && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs text-red-400 space-y-1">
                <p className="font-bold uppercase text-[10px]">Lý do từ chối:</p>
                <p className="leading-relaxed">{selectedRefereeDetail.rejectionReason}</p>
              </div>
            )}

            {/* Grid Stats Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-muted/30 p-4 rounded-2xl border border-border/50">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Mã số giấy phép</span>
                <span className="font-semibold text-foreground font-mono text-sm mt-0.5 block">{selectedRefereeDetail.licenseNo || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Kinh nghiệm làm việc</span>
                <span className="font-semibold text-foreground text-sm mt-0.5 block">{selectedRefereeDetail.experienceYears ?? 0} năm</span>
              </div>
            </div>

            {/* Complete Certificates List (Hiển thị đầy đủ tất cả bằng cấp) */}
            <div className="space-y-2">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                Danh sách Bằng cấp & Chứng chỉ chuyên môn đầy đủ
              </span>
              {selectedRefereeDetail.certificates ? (
                <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-4 text-xs text-teal-300 space-y-2">
                  {selectedRefereeDetail.certificates
                    .split(/[,;\n]+/)
                    .map((c) => c.trim())
                    .filter(Boolean)
                    .map((certItem, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="size-4 text-teal-400 shrink-0 mt-0.5" />
                        <span className="font-semibold leading-relaxed">{certItem}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-xs text-muted-foreground italic">
                  Chưa điền thông tin bằng cấp chuyên môn.
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-1.5 text-xs">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Tiểu sử / Mô tả quá trình công tác</span>
              <p className="bg-muted/30 p-4 rounded-2xl border border-border/50 text-foreground leading-relaxed">
                {selectedRefereeDetail.bio || "Chưa điền tiểu sử."}
              </p>
            </div>

            {/* Photos section: Portrait & Certificate/License Gallery */}
            <div className="space-y-4 text-xs">
              {/* Portrait Image */}
              {getPortraitPhoto(selectedRefereeDetail) ? (
                <div className="space-y-1.5">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Ảnh chân dung trọng tài</span>
                  <a
                    href={getPortraitPhoto(selectedRefereeDetail)}
                    target="_blank"
                    rel="noreferrer"
                    className="block relative h-40 w-40 rounded-2xl overflow-hidden border border-border group"
                  >
                    <img
                      src={getPortraitPhoto(selectedRefereeDetail)}
                      alt="Ảnh chân dung"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                      <Eye className="size-4" /> Xem ảnh lớn
                    </div>
                  </a>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Ảnh chân dung trọng tài</span>
                  <div className="h-20 w-full rounded-2xl border border-dashed border-border bg-muted/20 flex items-center justify-center text-muted-foreground text-xs gap-2">
                    <User className="size-5 text-muted-foreground/40" />
                    Chưa tải ảnh chân dung
                  </div>
                </div>
              )}

              {/* Certificate Multi-Image Gallery */}
              <div className="space-y-2">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                  Album ảnh bằng cấp & giấy phép ({getCertPhotos(selectedRefereeDetail).length} / 7 hình)
                </span>

                {getCertPhotos(selectedRefereeDetail).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {getCertPhotos(selectedRefereeDetail).map((imgUrl, idx) => (
                      <a
                        key={idx}
                        href={imgUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block relative h-28 w-full rounded-2xl overflow-hidden border border-border group bg-background"
                      >
                        <img
                          src={imgUrl}
                          alt={`Bằng cấp ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold gap-1">
                          <Eye className="size-3.5" /> Phóng to #{idx + 1}
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="h-20 w-full rounded-2xl border border-dashed border-border bg-muted/20 flex items-center justify-center text-muted-foreground text-xs gap-2">
                    <FileText className="size-5 text-muted-foreground/40" />
                    Chưa có hình ảnh bằng cấp/giấy phép nào được tải lên
                  </div>
                )}
              </div>
            </div>

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
                    className="h-10 px-5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold uppercase transition"
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
                    className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold uppercase text-black transition shadow-md"
                  >
                    Duyệt hồ sơ trọng tài
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">Cập nhật trạng thái:</span>
                  <select
                    value={selectedRefereeDetail.status}
                    disabled={actionLoading !== null}
                    onChange={(e) => {
                      const newSt = e.target.value as "available" | "unavailable" | "suspended";
                      const id = selectedRefereeDetail._id;
                      setSelectedRefereeDetail(null);
                      void handleChangeStatus(id, newSt);
                    }}
                    className="rounded-xl border border-border bg-muted px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  >
                    <option value="available">Sẵn sàng</option>
                    <option value="unavailable">Bận</option>
                    <option value="suspended">Tạm đình chỉ</option>
                  </select>
                </div>
              )}
              <button
                onClick={() => setSelectedRefereeDetail(null)}
                className="rounded-xl border border-border bg-muted px-5 py-2.5 font-bold text-foreground hover:bg-white/[0.08] transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert className="size-6 shrink-0" />
              <h3 className="text-lg font-bold uppercase">Từ chối hồ sơ trọng tài</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Vui lòng nhập lý do từ chối phê duyệt hồ sơ này. Lý do sẽ được hiển thị trên trang trạm điều hành của trọng tài để họ chỉnh sửa và gửi lại.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Lý do từ chối</label>
                <textarea
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ví dụ: Giấy phép không hợp lệ hoặc thông tin bằng cấp chưa rõ ràng..."
                  rows={3}
                  className="w-full rounded-2xl border border-border bg-muted px-3.5 py-2.5 text-xs text-foreground placeholder-white/30 focus:border-red-500 focus:outline-none resize-none"
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
                  className="h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold uppercase text-white transition shadow-md disabled:opacity-50"
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


