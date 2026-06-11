"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ShieldAlert, FileText, User, Eye } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { jockeysApi, type JockeyItem } from "@/lib/api-client";

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
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterApproval, setFilterApproval] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Rejection Modal State
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchJockeys = useCallback(async (page = 1) => {
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
    } finally { setLoading(false); }
  }, [filterStatus, filterApproval]);

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
          <option value="" className="bg-card text-foreground">Tất cả Status</option>
          {STATUSES.map(s => <option key={s} value={s} className="bg-card text-foreground">{s}</option>)}
        </select>

        <select
          className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none"
          value={filterApproval}
          onChange={(e) => setFilterApproval(e.target.value)}
        >
          {APPROVAL_STATUSES.map(a => (
            <option key={a.value} value={a.value} className="bg-card text-foreground">{a.label}</option>
          ))}
        </select>

        <div className="text-sm text-muted-foreground flex items-center">
          Tổng: <strong className="text-foreground ml-1">{meta.total}</strong>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-3">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-xs font-mono uppercase tracking-widest">Đang tải hồ sơ Jockey...</p>
          </div>
        ) : jockeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/70 space-y-3">
            <ShieldAlert className="size-10 text-foreground/20" />
            <p className="text-sm font-bold uppercase">Không tìm thấy hồ sơ nào</p>
            <p className="text-xs text-muted-foreground">Các jockey đăng ký hồ sơ sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Jockey</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Giấy phép</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Thể chất & Bio</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Kiểm duyệt</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Races / Wins</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jockeys.map((j) => (
                  <tr key={j._id} className="hover:bg-muted transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                          <User className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-none">{getUserName(j.userId)}</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">{getUserEmail(j.userId)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-foreground/70">{j.licenseNumber ?? "—"}</td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="space-y-1">
                        <p className="text-xs text-foreground/70">
                          {j.experienceYears ?? 0} năm KN · {j.heightCm ?? "?"}cm · {j.weightKg ?? "?"}kg
                        </p>
                        {j.certificates && (
                          <p className="text-xs text-teal-300 font-semibold flex items-center gap-1">
                            <FileText className="size-3 shrink-0" />
                            Cert: {j.certificates}
                          </p>
                        )}
                        {j.bio ? (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">{j.bio}</p>
                        ) : (
                          <p className="text-[11px] text-foreground/30 italic">Chưa điền tiểu sử</p>
                        )}
                        {j.licenseImage && (
                          <div className="pt-1">
                            <a
                              href={j.licenseImage}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-sky-400 font-bold hover:underline"
                            >
                              <Eye className="size-3" />
                              Xem ảnh Giấy phép
                            </a>
                          </div>
                        )}
                        {j.approvalStatus === "REJECTED" && j.rejectionReason && (
                          <p className="text-[10px] text-red-400 bg-red-400/5 p-1.5 rounded border border-red-500/10 mt-1">
                            Lý do loại: {j.rejectionReason}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${approvalColors[j.approvalStatus || "PENDING"]}`}>
                        {j.approvalStatus === "PENDING" ? "Chờ duyệt" : j.approvalStatus === "APPROVED" ? "Đã duyệt" : "Từ chối"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground">{j.totalRaces ?? 0} / {j.wins ?? 0}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColors[j.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {j.approvalStatus === "PENDING" ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            disabled={actionLoading !== null}
                            onClick={() => setRejectingId(j._id)}
                            className="h-8 px-3 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-[11px] font-bold uppercase text-red-400 transition"
                          >
                            Từ chối
                          </button>
                          <button
                            disabled={actionLoading !== null}
                            onClick={() => handleApprove(j._id)}
                            className="h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[11px] font-bold uppercase text-black transition"
                          >
                            Duyệt hồ sơ
                          </button>
                        </div>
                      ) : (
                        <select
                          value={j.status}
                          disabled={actionLoading !== null}
                          onChange={(e) => handleChangeStatus(j._id, e.target.value)}
                          className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-foreground focus:border-primary/50 focus:outline-none disabled:opacity-50 cursor-pointer w-32"
                        >
                          <option value="available" className="bg-card text-foreground">available</option>
                          <option value="unavailable" className="bg-card text-foreground">unavailable</option>
                          <option value="suspended" className="bg-card text-foreground">suspended</option>
                        </select>
                      )}
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

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert className="size-6 shrink-0" />
              <h3 className="text-lg font-bold uppercase">Từ chối hồ sơ Jockey</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Vui lòng nhập lý do từ chối phê duyệt hồ sơ Jockey này. Lý do sẽ được hiển thị trên dashboard của Jockey để họ sửa đổi và nộp lại.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Lý do từ chối</label>
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
                  onClick={() => { setRejectingId(null); setRejectionReason(""); }}
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
    </main>
  );
}


