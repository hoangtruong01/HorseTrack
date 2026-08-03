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
  Award,
  Trophy,
  Loader2,
  Sparkles,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { jockeysApi, type JockeyItem, raceResultsApi, type JockeyVictoryItem } from "@/lib/api-client";
import { toast } from "sonner";

const STATUSES = ["available", "unavailable", "suspended"];
const statusColors: Record<string, string> = {
  ACTIVE: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 dark:bg-emerald-400/10 border-emerald-500/30 dark:border-emerald-400/20",
  available: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 dark:bg-emerald-400/10 border-emerald-500/30 dark:border-emerald-400/20",
  unavailable: "text-amber-700 dark:text-yellow-400 bg-amber-500/15 dark:bg-yellow-400/10 border-amber-500/30 dark:border-yellow-400/20",
  suspended: "text-rose-700 dark:text-red-400 bg-rose-500/15 dark:bg-red-400/10 border-rose-500/30 dark:border-red-400/20",
};

const APPROVAL_STATUSES = [
  { value: "", label: "Tất cả kiểm duyệt" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Bị từ chối" },
];

const approvalColors: Record<string, string> = {
  PENDING: "text-amber-700 dark:text-amber-400 bg-amber-500/15 dark:bg-amber-400/10 border-amber-500/30 dark:border-amber-400/20",
  APPROVED: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 dark:bg-emerald-400/10 border-emerald-500/30 dark:border-emerald-400/20",
  REJECTED: "text-rose-700 dark:text-red-400 bg-rose-500/15 dark:bg-red-400/10 border-rose-500/30 dark:border-red-400/20",
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
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  // Detail Modal State
  const [selectedJockeyDetail, setSelectedJockeyDetail] = useState<JockeyItem | null>(null);
  const [jockeyVictories, setJockeyVictories] = useState<JockeyVictoryItem[]>([]);
  const [loadingVictories, setLoadingVictories] = useState(false);
  const [victoryPage, setVictoryPage] = useState(1);
  const VICTORIES_PER_PAGE = 6;

  useEffect(() => {
    if (!selectedJockeyDetail) {
      setJockeyVictories([]);
      setVictoryPage(1);
      return;
    }
    const uId =
      typeof selectedJockeyDetail.userId === "object" && selectedJockeyDetail.userId !== null
        ? selectedJockeyDetail.userId._id
        : selectedJockeyDetail.userId;

    if (uId) {
      setLoadingVictories(true);
      setVictoryPage(1);
      raceResultsApi
        .getByJockey(String(uId), 1)
        .then((res) => {
          setJockeyVictories(res.results || []);
        })
        .catch((err) => {
          console.error("Failed to load jockey victories for admin view:", err);
        })
        .finally(() => {
          setLoadingVictories(false);
        });
    }
  }, [selectedJockeyDetail]);

  // Rejection Modal State
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

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
    [filterStatus, filterApproval]
  );

  useEffect(() => {
    void fetchJockeys(1);
  }, [fetchJockeys]);

  const handleChangeStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await jockeysApi.changeStatus(id, status);
      toast.success(`Đã cập nhật trạng thái: ${status}`);
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

  const getUserPhone = (userId: JockeyItem["userId"]) => {
    if (!userId || typeof userId !== "object") return "";
    return userId.phone || "";
  };

  const getPortraitPhoto = (j: JockeyItem) => {
    if (j.portraitImage) return j.portraitImage;
    if (j.userId && typeof j.userId === "object") return j.userId.avatar;
    return undefined;
  };

  const getCertPhotos = (j: JockeyItem) => {
    if (j.certificateImages && j.certificateImages.length > 0) {
      return j.certificateImages;
    }
    return j.licenseImage ? [j.licenseImage] : [];
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
        eyebrow="Jockey Management"
        title="Quản Lý Nại Ngựa (Jockey)"
        description="Xem danh sách, kiểm tra thông tin bằng cấp, chỉ số thi đấu và thực hiện phê duyệt / từ chối hồ sơ Kỵ mã."
      />

      {/* Filter Bar & View Mode Toggle */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card/60 p-4 rounded-2xl border border-border backdrop-blur-md shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
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

          <select
            className="rounded-xl border border-border bg-muted/80 px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="" className="bg-card text-foreground">Tất cả Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-card text-foreground">
                {s === "available" ? "Sẵn sàng" : s === "unavailable" ? "Bận" : "Đình chỉ"}
              </option>
            ))}
          </select>
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
          <p className="text-xs font-mono uppercase tracking-widest">Đang tải danh sách Jockey...</p>
        </div>
      ) : jockeys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground/70 space-y-3 bg-card/40 rounded-2xl border border-border">
          <ShieldAlert className="size-10 text-foreground/20" />
          <p className="text-sm font-bold uppercase">Không tìm thấy hồ sơ nào</p>
          <p className="text-xs text-muted-foreground">Các jockey đăng ký hồ sơ sẽ xuất hiện tại đây.</p>
        </div>
      ) : viewMode === "card" ? (
        /* CARD GRID LAYOUT (Bố trí dạng Thẻ Card chỉn chu) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jockeys.map((j) => {
            const portrait = getPortraitPhoto(j);
            const certs = getCertPhotos(j);
            const certPreview = formatCertificatePreview(j.certificates);
            const winRate = j.totalRaces && j.totalRaces > 0
              ? ((j.wins ?? 0) / j.totalRaces * 100).toFixed(1)
              : "0";

            return (
              <div
                key={j._id}
                onClick={() => setSelectedJockeyDetail(j)}
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
                          {getUserName(j.userId)}
                        </h3>
                        <p className="text-xs text-muted-foreground/80 flex items-center gap-1 mt-0.5 truncate">
                          <Mail className="size-3 shrink-0" /> {getUserEmail(j.userId) || "Chưa có email"}
                        </p>
                        <p className="text-xs text-muted-foreground/80 flex items-center gap-1 mt-0.5 truncate">
                          <Phone className="size-3 text-emerald-400 shrink-0" /> {getUserPhone(j.userId) || "Chưa có SĐT"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${approvalColors[j.approvalStatus || "PENDING"]}`}>
                      {j.approvalStatus === "PENDING" ? "Chờ duyệt" : j.approvalStatus === "APPROVED" ? "Đã duyệt" : "Từ chối"}
                    </span>
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColors[j.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                      {j.status === "available" || j.status === "ACTIVE" ? "Sẵn sàng" : j.status === "unavailable" ? "Bận" : "Đình chỉ"}
                    </span>
                  </div>
                </div>

                {/* Details info */}
                <div className="bg-muted/40 p-3.5 rounded-xl border border-border/50 text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Giấy phép</span>
                      <span className="font-semibold font-mono text-foreground">{j.licenseNumber || "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Kinh nghiệm</span>
                      <span className="font-semibold text-foreground">{j.experienceYears ?? 0} năm</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Thể chất</span>
                      <span className="font-semibold text-foreground">{j.heightCm ?? "?"}cm / {j.weightKg ?? "?"}kg</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Thắng / Tổng</span>
                      <span className="font-semibold text-emerald-400">{j.wins ?? 0} / {j.totalRaces ?? 0} ({winRate}%)</span>
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
                        {certs.length} ảnh giấy phép/bằng
                      </span>
                    )}
                  </div>

                  {/* Rejection Reason */}
                  {j.approvalStatus === "REJECTED" && j.rejectionReason && (
                    <div className="pt-1 text-[10px] text-red-400 bg-red-400/10 p-2 rounded border border-red-500/20">
                      <strong className="uppercase block text-[9px]">Lý do từ chối:</strong>
                      <p className="line-clamp-2">{j.rejectionReason}</p>
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setSelectedJockeyDetail(j)}
                    className="flex items-center gap-1 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-400 transition hover:bg-sky-500/20"
                  >
                    <Eye className="size-3.5" />
                    Xem chi tiết
                  </button>

                  {j.approvalStatus === "PENDING" ? (
                    <div className="flex gap-1.5">
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => setRejectingId(j._id)}
                        className="h-8 px-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold uppercase text-red-400 transition"
                      >
                        Từ chối
                      </button>
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => void handleApprove(j._id)}
                        className="h-8 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold uppercase text-black transition shadow-sm"
                      >
                        Duyệt
                      </button>
                    </div>
                  ) : (
                    <select
                      value={j.status}
                      disabled={actionLoading !== null}
                      onChange={(e) => void handleChangeStatus(j._id, e.target.value)}
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
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/80 whitespace-nowrap">
                  <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Jockey</th>
                  <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SĐT & Email</th>
                  <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Giấy phép</th>
                  <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kinh nghiệm & Thể chất</th>
                  <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bằng cấp</th>
                  <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kiểm duyệt</th>
                  <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Trận đua / Thắng</th>
                  <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Trạng thái</th>
                  <th className="px-4 py-3.5 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jockeys.map((j) => {
                  const portrait = getPortraitPhoto(j);
                  const certs = getCertPhotos(j);
                  const certPreview = formatCertificatePreview(j.certificates);

                  return (
                    <tr
                      key={j._id}
                      onClick={() => setSelectedJockeyDetail(j)}
                      className="hover:bg-muted/60 transition-colors group cursor-pointer"
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-primary/10 border border-primary/20 overflow-hidden shrink-0 flex items-center justify-center text-primary">
                            {portrait ? (
                              <img src={portrait} alt="Chân dung" className="w-full h-full object-cover" />
                            ) : (
                              <User className="size-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground leading-none">{getUserName(j.userId)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs whitespace-nowrap space-y-0.5">
                        <p className="text-foreground font-semibold">{getUserPhone(j.userId) || "Chưa có SĐT"}</p>
                        <p className="text-[11px] text-muted-foreground">{getUserEmail(j.userId)}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono text-foreground/80 whitespace-nowrap">{j.licenseNumber ?? "—"}</td>
                      <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                        <p className="font-semibold text-foreground">{j.experienceYears ?? 0} năm</p>
                        <p className="text-[11px] text-muted-foreground">{j.heightCm ?? "?"}cm / {j.weightKg ?? "?"}kg</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs max-w-[200px]">
                        <div className="space-y-1">
                          {certPreview ? (
                            <p className="text-xs text-teal-300 font-semibold truncate" title={j.certificates}>
                              Bằng cấp: {certPreview}
                            </p>
                          ) : (
                            <p className="text-[11px] text-muted-foreground/50 italic">Chưa điền bằng cấp</p>
                          )}
                          {certs.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-teal-300 font-bold bg-teal-400/10 px-2 py-0.5 rounded border border-teal-400/20 whitespace-nowrap">
                              <Eye className="size-3" />
                              {certs.length} ảnh bằng cấp
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${approvalColors[j.approvalStatus || "PENDING"]}`}>
                          {j.approvalStatus === "PENDING" ? "Chờ duyệt" : j.approvalStatus === "APPROVED" ? "Đã duyệt" : "Từ chối"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                        <span className="font-bold text-emerald-400">{j.wins ?? 0}</span> / {j.totalRaces ?? 0} trận
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColors[j.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                          {j.status === "available" || j.status === "ACTIVE" ? "Sẵn sàng" : j.status === "unavailable" ? "Bận" : "Đình chỉ"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedJockeyDetail(j)}
                            className="flex items-center gap-1 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-400 transition hover:bg-sky-500/20"
                          >
                            <Eye className="size-3.5" />
                            Chi tiết
                          </button>
                          {j.approvalStatus === "PENDING" ? (
                            <div className="flex gap-1.5">
                              <button
                                disabled={actionLoading !== null}
                                onClick={() => setRejectingId(j._id)}
                                className="h-8 px-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold uppercase text-red-400 transition"
                              >
                                Từ chối
                              </button>
                              <button
                                disabled={actionLoading !== null}
                                onClick={() => void handleApprove(j._id)}
                                className="h-8 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold uppercase text-black transition shadow-sm"
                              >
                                Duyệt
                              </button>
                            </div>
                          ) : (
                            <select
                              value={j.status}
                              disabled={actionLoading !== null}
                              onChange={(e) => void handleChangeStatus(j._id, e.target.value)}
                              className="rounded-xl border border-border bg-muted px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
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
            onClick={() => fetchJockeys(meta.page - 1)}
            disabled={meta.page <= 1}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-40 transition"
          >
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">
            Trang {meta.page} / {meta.totalPages}
          </span>
          <button
            onClick={() => fetchJockeys(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-40 transition"
          >
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      {/* Modal Xem Chi Tiết Jockey (Thiết kế đồng bộ đẳng cấp với Quản lý trọng tài) */}
      {selectedJockeyDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedJockeyDetail(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-4">
                <div className="relative size-16 rounded-2xl bg-primary/10 border border-primary/20 overflow-hidden flex items-center justify-center text-primary shrink-0 shadow-lg">
                  {getPortraitPhoto(selectedJockeyDetail) ? (
                    <img
                      src={getPortraitPhoto(selectedJockeyDetail)}
                      alt="Chân dung"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="size-8" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {getUserName(selectedJockeyDetail.userId)}
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="size-3.5 text-primary" /> {getUserEmail(selectedJockeyDetail.userId) || "Chưa có email"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="size-3.5 text-emerald-400" /> {getUserPhone(selectedJockeyDetail.userId) || "Chưa có SĐT"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedJockeyDetail(null)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Statuses Summary */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-4 rounded-2xl border border-border/50 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Trạng thái kiểm duyệt:</span>
                <span className={`inline-flex rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${approvalColors[selectedJockeyDetail.approvalStatus || "PENDING"]}`}>
                  {selectedJockeyDetail.approvalStatus === "PENDING"
                    ? "Chờ duyệt"
                    : selectedJockeyDetail.approvalStatus === "APPROVED"
                      ? "Đã duyệt"
                      : "Từ chối"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Trạng thái hoạt động:</span>
                <span className={`inline-flex rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColors[selectedJockeyDetail.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                  {selectedJockeyDetail.status === "available" || selectedJockeyDetail.status === "ACTIVE" ? "Sẵn sàng" : selectedJockeyDetail.status === "unavailable" ? "Bận" : "Đình chỉ"}
                </span>
              </div>
            </div>

            {selectedJockeyDetail.approvalStatus === "REJECTED" && selectedJockeyDetail.rejectionReason && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs text-red-400 space-y-1">
                <p className="font-bold uppercase text-[10px]">Lý do từ chối:</p>
                <p className="leading-relaxed">{selectedJockeyDetail.rejectionReason}</p>
              </div>
            )}

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Professional & Physical info */}
              <div className="space-y-3 bg-muted/30 p-4 rounded-2xl border border-border/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Award className="size-3.5" /> Thông tin chuyên môn & thể chất
                </p>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Mã giấy phép</span>
                  <span className="font-semibold text-foreground font-mono mt-0.5 block">{selectedJockeyDetail.licenseNumber || "Chưa cập nhật"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Kinh nghiệm</span>
                  <span className="font-semibold text-foreground mt-0.5 block">{selectedJockeyDetail.experienceYears ?? 0} năm</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Chiều cao & Cân nặng</span>
                  <span className="font-semibold text-foreground mt-0.5 block">{selectedJockeyDetail.heightCm ?? "?"} cm / {selectedJockeyDetail.weightKg ?? "?"} kg</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Trình độ / Chuyên môn</span>
                  <span className="font-semibold text-foreground mt-0.5 block">{selectedJockeyDetail.skillLevel || selectedJockeyDetail.specialty || "Tiêu chuẩn"}</span>
                </div>
              </div>

              {/* Race performance */}
              <div className="space-y-3 bg-muted/30 p-4 rounded-2xl border border-border/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Trophy className="size-3.5" /> Thành tích thi đấu
                </p>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Tổng số trận đua</span>
                  <span className="font-semibold text-foreground mt-0.5 block">{selectedJockeyDetail.totalRaces ?? 0} trận</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Số trận thắng</span>
                  <span className="font-semibold text-emerald-400 mt-0.5 block">{selectedJockeyDetail.wins ?? 0} chiến thắng</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Tỷ lệ thắng</span>
                  <span className="font-semibold text-amber-300 mt-0.5 block">
                    {selectedJockeyDetail.totalRaces && selectedJockeyDetail.totalRaces > 0
                      ? ((selectedJockeyDetail.wins ?? 0) / selectedJockeyDetail.totalRaces * 100).toFixed(1)
                      : "0"}%
                  </span>
                </div>
              </div>
            </div>

            {/* 🏆 BẢNG VÀNG THÀNH TÍCH TOP 1 */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Trophy className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1">
                      Bảng Vàng Thành Tích Top 1
                      <Sparkles className="size-3 text-amber-400 fill-amber-400" />
                    </h4>
                    <p className="text-[10px] text-muted-foreground">Các giải đấu & trận đua giành cúp Quán quân (Hạng 1)</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[11px]">
                  {jockeyVictories.length} Cúp
                </span>
              </div>

              {loadingVictories ? (
                <div className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin text-amber-400" /> Đang tải lịch sử cúp vô địch...
                </div>
              ) : jockeyVictories.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-border/60 text-center text-muted-foreground text-xs italic">
                  Chưa có danh hiệu vô địch Top 1 nào được ghi nhận.
                </div>
              ) : (() => {
                const totalPages = Math.ceil(jockeyVictories.length / VICTORIES_PER_PAGE);
                const safePage = Math.min(victoryPage, totalPages || 1);
                const currentVictories = jockeyVictories.slice((safePage - 1) * VICTORIES_PER_PAGE, safePage * VICTORIES_PER_PAGE);

                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentVictories.map((v) => {
                        const tournamentName = typeof v.tournamentId === "object" ? v.tournamentId?.name : "Giải đấu";
                        const raceName = typeof v.raceId === "object" ? v.raceId?.name : "Trận đua";
                        const raceTime = typeof v.raceId === "object" ? v.raceId?.startTime : v.createdAt;
                        const horseName = typeof v.horseId === "object" ? v.horseId?.name : "Chiến mã";

                        return (
                          <div key={v._id || v.id} className="p-3 rounded-xl border border-amber-500/20 bg-background/60 hover:bg-amber-500/10 transition space-y-1.5 text-xs">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                                <Trophy className="size-2.5" /> TOP 1 WINNER
                              </span>
                              {v.prizeAmount ? (
                                <span className="text-[11px] font-black text-teal-400 font-mono">
                                  +{v.prizeAmount.toLocaleString("vi-VN")} đ
                                </span>
                              ) : null}
                            </div>
                            <div>
                              <p className="font-bold text-foreground truncate" title={raceName}>{raceName}</p>
                              <p className="text-[10px] font-semibold text-amber-400/90 truncate" title={tournamentName}>
                                🏆 {tournamentName}
                              </p>
                            </div>
                            <div className="pt-1 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                              <span className="font-medium text-foreground/80">🐴 {horseName}</span>
                              {raceTime && (
                                <span className="flex items-center gap-1 font-mono">
                                  <Calendar className="size-2.5" /> {new Date(raceTime).toLocaleDateString("vi-VN")}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-2 border-t border-amber-500/10 text-[11px]">
                        <span className="text-muted-foreground">
                          Trang <strong className="text-amber-400">{safePage}</strong> / {totalPages}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            disabled={safePage === 1}
                            onClick={() => setVictoryPage((p) => Math.max(1, p - 1))}
                            className="px-2 py-1 rounded border border-amber-500/20 bg-amber-500/5 text-amber-400 disabled:opacity-40 text-[10px] font-bold"
                          >
                            Trước
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setVictoryPage(page)}
                              className={`size-6 rounded text-[10px] font-bold transition ${
                                page === safePage
                                  ? "bg-amber-500 text-black"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            disabled={safePage === totalPages}
                            onClick={() => setVictoryPage((p) => Math.min(totalPages, p + 1))}
                            className="px-2 py-1 rounded border border-amber-500/20 bg-amber-500/5 text-amber-400 disabled:opacity-40 text-[10px] font-bold"
                          >
                            Tiếp
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Complete Certificates List (Hiển thị đầy đủ tất cả bằng cấp) */}
            <div className="space-y-2">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                Danh sách Bằng cấp & Chứng chỉ chuyên môn đầy đủ
              </span>
              {selectedJockeyDetail.certificates ? (
                <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-4 text-xs text-teal-300 space-y-2">
                  {selectedJockeyDetail.certificates
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
              <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Tiểu sử / Bio cá nhân</span>
              <p className="bg-muted/30 p-4 rounded-2xl border border-border/50 text-foreground leading-relaxed">
                {selectedJockeyDetail.bio || "Chưa điền tiểu sử cá nhân."}
              </p>
            </div>

            {/* Photos section: Portrait & License Image Gallery */}
            <div className="space-y-4 text-xs">
              {/* Portrait Image */}
              {getPortraitPhoto(selectedJockeyDetail) ? (
                <div className="space-y-1.5">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Ảnh chân dung Jockey</span>
                  <a
                    href={getPortraitPhoto(selectedJockeyDetail)}
                    target="_blank"
                    rel="noreferrer"
                    className="block relative h-40 w-40 rounded-2xl overflow-hidden border border-border group"
                  >
                    <img
                      src={getPortraitPhoto(selectedJockeyDetail)}
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
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Ảnh chân dung Jockey</span>
                  <div className="h-20 w-full rounded-2xl border border-dashed border-border bg-muted/20 flex items-center justify-center text-muted-foreground text-xs gap-2">
                    <User className="size-5 text-muted-foreground/40" />
                    Chưa tải ảnh chân dung
                  </div>
                </div>
              )}

              {/* Certificate Multi-Image Gallery */}
              <div className="space-y-2">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                  Album ảnh bằng cấp & giấy phép ({getCertPhotos(selectedJockeyDetail).length} hình)
                </span>

                {getCertPhotos(selectedJockeyDetail).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {getCertPhotos(selectedJockeyDetail).map((imgUrl, idx) => (
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
              {selectedJockeyDetail.approvalStatus === "PENDING" ? (
                <div className="flex gap-2">
                  <button
                    disabled={actionLoading !== null}
                    onClick={() => {
                      const id = selectedJockeyDetail._id;
                      setSelectedJockeyDetail(null);
                      setRejectingId(id);
                    }}
                    className="h-10 px-5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold uppercase transition"
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
                    className="h-10 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold uppercase text-black transition shadow-md"
                  >
                    Duyệt hồ sơ Jockey
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">Cập nhật trạng thái:</span>
                  <select
                    value={selectedJockeyDetail.status}
                    disabled={actionLoading !== null}
                    onChange={(e) => {
                      const newSt = e.target.value;
                      const id = selectedJockeyDetail._id;
                      setSelectedJockeyDetail(null);
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
                onClick={() => setSelectedJockeyDetail(null)}
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
                  placeholder="Ví dụ: Giấy phép hết hạn hoặc bằng cấp chưa hợp lệ..."
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
