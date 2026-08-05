"use client";
import Image from "next/image";

import { useEffect, useState, Suspense } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Clock,
  Eye,
  Flag,
  Sparkles,
  User,
  X,
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Folder,
  LayoutGrid,
  List,
  FileCode,
  FileText,
  FileArchive,
  ImageIcon,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

// Types
type OwnerInfo = {
  fullName: string;
  email: string;
  phone?: string;
};

type HorseInfoCompact = {
  id: string;
  name: string;
  breed: string;
  age?: number;
  gender?: string;
  baseSpeed?: number;
  staminaScore?: number;
  image?: string;
};

type RaceInfoCompact = {
  id: string;
  name: string;
  startTime: string;
  status: string;
  distanceMeters?: number;
  lapCount?: number;
  location?: string;
  prize?: number;
  image?: string;
};

type TournamentInfoCompact = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  status?: string;
};

type Invitation = {
  id: string;
  _id?: string;
  registrationId: string;
  tournamentId: TournamentInfoCompact;
  raceId: RaceInfoCompact;
  horseId: HorseInfoCompact;
  ownerId: OwnerInfo;
  jockeyUserId: string;
  message?: string;
  jockeySharePercent: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "EXPIRED";
  expiredAt?: string;
  createdAt: string;
  respondedAt?: string;
};

type HorseDetail = {
  _id: string;
  name: string;
  breed: string;
  age: number;
  gender: string;
  color?: string;
  weightKg: number;
  heightCm: number;
  healthStatus: "HEALTHY" | "INJURED" | "SICK";
  status: "active" | "inactive";
  description?: string;
  image?: string;
  baseSpeed?: number;
  staminaScore?: number;
};

type ViewMode = "explorer" | "grid" | "list";
type TimeframeGroup = "Earlier this week" | "Last week" | "Earlier this month" | "Older";

function getTimeframeLabel(dateStr?: string): TimeframeGroup {
  if (!dateStr) return "Older";
  const date = new Date(dateStr);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = startOfToday.getDay();
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (date >= startOfWeek) return "Earlier this week";
  if (date >= startOfLastWeek) return "Last week";
  if (date >= startOfMonth) return "Earlier this month";
  return "Older";
}

function ExplorerItemAvatar({ image, name }: { image?: string; name: string }) {
  const [imgError, setImgError] = useState(false);

  if (image && !imgError) {
    return (
      <div className="relative size-9 shrink-0 overflow-hidden rounded-xl border border-amber-500/30 bg-amber-500/10 shadow-xs transition-transform group-hover:scale-105">
        <Image
          src={image}
          alt={name || "Horse/Race image"}
          fill
          className="object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 dark:text-amber-400 shadow-xs transition-transform group-hover:scale-105">
      <Trophy className="size-4 text-amber-500 dark:text-amber-400" />
    </div>
  );
}

function getRaceStatusConfig(status?: string, isVi: boolean = true) {
  const upper = (status || "").toUpperCase();
  switch (upper) {
    case "SCHEDULED":
    case "PENDING":
      return {
        label: isVi ? "Đã lên lịch" : "Scheduled",
        tone: "blue" as const,
      };
    case "READY":
      return {
        label: isVi ? "Sẵn sàng" : "Ready",
        tone: "green" as const,
      };
    case "LIVE":
    case "IN_PROGRESS":
      return {
        label: isVi ? "ĐANG CHẠY" : "LIVE",
        tone: "red" as const,
        pulse: true,
      };
    case "FINISHED":
    case "COMPLETED":
      return {
        label: isVi ? "Hoàn thành" : "Finished",
        tone: "purple" as const,
      };
    case "RESULT_PUBLISHED":
      return {
        label: isVi ? "Kết quả công bố" : "Results Published",
        tone: "amber" as const,
      };
    case "CANCELLED":
    case "CANCELED":
      return {
        label: isVi ? "Đã hủy" : "Cancelled",
        tone: "rose" as const,
      };
    case "POSTPONED":
      return {
        label: isVi ? "Hoãn đua" : "Postponed",
        tone: "orange" as const,
      };
    default:
      return {
        label: status || "—",
        tone: "slate" as const,
      };
  }
}

export function JockeyAssignPage() {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language?.startsWith("vi") ?? true;

  // State variables
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoadingInvs, setIsLoadingInvs] = useState(true);

  // View Mode state (Explorer, Grid, List)
  const [viewMode, setViewMode] = useState<ViewMode>("explorer");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Pagination state (10 items per page)
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Selected horse detail for Modal
  const [selectedHorseId, setSelectedHorseId] = useState<string | null>(null);
  const [horseDetail, setHorseDetail] = useState<HorseDetail | null>(null);
  const [isLoadingHorse, setIsLoadingHorse] = useState(false);

  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const getTimeframeTitle = (groupKey: TimeframeGroup) => {
    switch (groupKey) {
      case "Earlier this week":
        return t("jockey.timeframe.thisWeek", isVi ? "Tuần này" : "Earlier this week");
      case "Last week":
        return t("jockey.timeframe.lastWeek", isVi ? "Tuần trước" : "Last week");
      case "Earlier this month":
        return t("jockey.timeframe.thisMonth", isVi ? "Tháng này" : "Earlier this month");
      case "Older":
        return t("jockey.timeframe.older", isVi ? "Cũ hơn" : "Older");
      default:
        return groupKey;
    }
  };

  // Format Date in DD/MM/YYYY HH:mm (Ngày / Tháng / Năm Giờ:Phút)
  const formatDateDDMMYYYY = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Fetch initial data
  const fetchInvitations = async () => {
    setIsLoadingInvs(true);
    try {
      const invsRes = await fetch("/api/jockey/invitations");
      if (invsRes.ok) {
        const invsData = await invsRes.json();
        if (invsData.success) {
          setInvitations(invsData.data || []);
        }
      }
    } catch (err) {
      console.error("Lỗi tải lịch thi đấu:", err);
      toast.error(t("common.serverError", "Không thể kết nối đến server."));
    } finally {
      setIsLoadingInvs(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  // Fetch Horse details and open modal
  const handleViewHorseDetail = async (horseId: string) => {
    setSelectedHorseId(horseId);
    setIsLoadingHorse(true);
    setHorseDetail(null);

    try {
      const res = await fetch(`/api/jockey/horses/${horseId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setHorseDetail(data.data);
        }
      } else {
        toast.error(t("jockey.assign.horseFetchError", "Không thể lấy thông tin chi tiết của ngựa."));
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin chiến mã:", err);
      toast.error(t("common.connectionError", "Lỗi kết nối."));
    } finally {
      setIsLoadingHorse(false);
    }
  };

  const acceptedInvs = invitations.filter((inv) => inv.status === "ACCEPTED");
  const totalItems = acceptedInvs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedInvs = acceptedInvs.slice(startIndex, endIndex);

  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <PageHeader
        eyebrow={t("jockey.assign.eyebrow", "Lịch Trình")}
        title={t("jockey.assign.title", "Lịch Thi Đấu Đã Nhận")}
        description={t("jockey.assign.description", "Xem chi tiết các cuộc đua bạn đã nhận lời tham gia, thông tin về chiến mã được phân công và tỷ lệ chia thưởng từ chủ chuồng.")}
      />

      <section className="space-y-4">
        {/* Layout Mode Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-2xl border border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t("jockey.assign.layoutLabel", "Giao diện / Layout:")}
            </span>
            <div className="flex items-center bg-card border border-border p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setViewMode("explorer");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === "explorer"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                title={t("jockey.assign.viewExplorer", "Explorer Chi Tiết (như hình)")}
              >
                <Folder className="size-3.5" />
                {t("jockey.assign.viewExplorer", "Chi Tiết")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("grid");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === "grid"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                title={t("jockey.assign.viewGrid", "Thẻ Grid")}
              >
                <LayoutGrid className="size-3.5" />
                {t("jockey.assign.viewGrid", "Thẻ Grid")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("list");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === "list"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                title={t("jockey.assign.viewList", "Danh Sách")}
              >
                <List className="size-3.5" />
                {t("jockey.assign.viewList", "Danh Sách")}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge label={t("jockey.assign.acceptedCount", "{{count}} Cuộc đua đã nhận", { count: totalItems })} tone="green" />
          </div>
        </div>

        {isLoadingInvs ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-muted/50 animate-pulse border border-border" />
            ))}
          </div>
        ) : totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-border bg-card max-w-lg mx-auto space-y-3">
            <div className="size-12 rounded-full border border-border flex items-center justify-center text-muted-foreground">
              <Calendar className="size-6" />
            </div>
            <h4 className="font-bold text-foreground">{t("jockey.assign.emptyTitle", isVi ? "Chưa có lịch trình" : "No Schedule Yet")}</h4>
            <p className="text-xs text-muted-foreground">{t("jockey.assign.emptyDesc", isVi ? "Khi bạn chấp nhận lời mời, lịch đua sẽ xuất hiện tại đây." : "Accepted race invitations will appear here.")}</p>
          </div>
        ) : viewMode === "explorer" ? (
          /* OPTION LAYOUT: Windows File Explorer Details View (Kiểu như hình đính kèm) */
          <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-xl">
            {(["Earlier this week", "Last week", "Earlier this month", "Older"] as TimeframeGroup[]).map((groupKey) => {
              const groupItems = paginatedInvs.filter(
                (inv) => getTimeframeLabel(inv.raceId?.startTime || inv.createdAt) === groupKey
              );
              if (groupItems.length === 0) return null;
              const isCollapsed = collapsedGroups[groupKey];

              return (
                <div key={groupKey} className="space-y-1">
                  {/* Group Header */}
                  <button
                    type="button"
                    onClick={() => toggleGroupCollapse(groupKey)}
                    className="flex items-center gap-2 w-full text-left py-1.5 px-2 rounded-lg text-xs font-semibold text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground transition"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="size-3.5" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                    <span>{getTimeframeTitle(groupKey)}</span>
                    <span className="text-[10px] text-muted-foreground/50">({groupItems.length})</span>
                  </button>

                  {/* Group Items */}
                  {!isCollapsed && (
                    <div className="space-y-1 pl-2">
                      {groupItems.map((inv) => {
                        const formattedDate = formatDateDDMMYYYY(inv.raceId?.startTime || inv.createdAt);
                        const statusConfig = getRaceStatusConfig(inv.raceId?.status, isVi);

                        return (
                          <div
                            key={inv.id || inv._id}
                            onClick={() => handleViewHorseDetail(inv.horseId.id)}
                            className="group relative flex flex-wrap md:flex-nowrap items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/[0.08] transition text-xs select-none cursor-pointer"
                          >
                            {/* Left Section: Icon / Real Image + Title & Type subtitle */}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <ExplorerItemAvatar
                                image={inv.horseId?.image || inv.raceId?.image}
                                name={inv.horseId?.name || inv.raceId?.name || "Chiến mã"}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-foreground truncate group-hover:text-primary transition">
                                    {inv.raceId?.name || t("jockey.assign.unnamedRace", "Cuộc đua chưa đặt tên")}
                                  </p>
                                  <StatusBadge
                                    label={statusConfig.label}
                                    tone={statusConfig.tone}
                                    pulse={statusConfig.pulse}
                                    className="text-[9px] px-1.5 py-0"
                                  />
                                </div>
                                <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">
                                  {t("jockey.assign.type", "Type")}: {t("jockey.assign.raceEvent", isVi ? "Sự kiện đua" : "Race Event")} • {t("jockey.assign.horse", isVi ? "Chiến mã" : "Horse")}: {inv.horseId?.name} • {t("jockey.assign.owner", isVi ? "Chủ chuồng" : "Owner")}: {inv.ownerId?.fullName}
                                </p>
                              </div>
                            </div>

                            {/* Right Section: Date modified (DD/MM/YYYY HH:mm) & Size / Share */}
                            <div className="flex items-center gap-6 shrink-0 text-right text-[11px]">
                              <div className="hidden sm:block text-muted-foreground/80">
                                <span className="block text-[10px] text-muted-foreground/60">
                                  {t("jockey.assign.dateModified", isVi ? "Ngày:" : "Date modified:")}
                                </span>
                                <span className="font-mono text-foreground font-semibold">{formattedDate}</span>
                              </div>

                              <div className="text-right min-w-[100px]">
                                <span className="block text-[10px] text-muted-foreground/60">
                                  {t("jockey.assign.sizeShare", isVi ? "Kích thước / Tỷ lệ:" : "Size / Share:")}
                                </span>
                                <span className="font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 inline-block mt-0.5">
                                  {t("jockey.assign.shareValue", isVi ? "Thưởng {{percent}}%" : "Share {{percent}}%", { percent: inv.jockeySharePercent })}
                                </span>
                              </div>

                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewHorseDetail(inv.horseId.id);
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2.5 text-[11px] font-semibold border border-border hover:bg-muted"
                              >
                                <Eye className="size-3 mr-1" />
                                {t("common.details", isVi ? "Chi tiết" : "Details")}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : viewMode === "list" ? (
          /* OPTION LAYOUT: Compact List View */
          <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
            {paginatedInvs.map((inv) => {
              const statusConfig = getRaceStatusConfig(inv.raceId?.status, isVi);
              return (
                <div
                  key={inv.id || inv._id}
                  onClick={() => handleViewHorseDetail(inv.horseId.id)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/60 transition cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Clock className="size-4 text-teal-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground truncate">{inv.raceId?.name}</p>
                        <StatusBadge label={statusConfig.label} tone={statusConfig.tone} pulse={statusConfig.pulse} className="text-[9px] px-1.5 py-0" />
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{inv.tournamentId?.name} • Chủ: {inv.ownerId?.fullName} • Mã ngựa: {inv.horseId?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">Thưởng {inv.jockeySharePercent}%</span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewHorseDetail(inv.horseId.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                    >
                      <Eye className="size-3 mr-1" /> Chi tiết
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* OPTION LAYOUT: Standard Grid Cards View */
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedInvs.map((inv) => {
              const statusConfig = getRaceStatusConfig(inv.raceId?.status, isVi);
              return (
                <div key={inv.id || inv._id} className="relative rounded-xl border border-border bg-card p-4 hover:border-teal-500/30 transition shadow-sm overflow-hidden flex flex-col justify-between h-full">
                  {/* Status accent line */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${inv.raceId?.status === "LIVE" ? "bg-red-500" : inv.raceId?.status === "RESULT_PUBLISHED" ? "bg-amber-500" : inv.raceId?.status === "CANCELLED" ? "bg-rose-500" : "bg-blue-500"}`} />

                  <div className="pl-3 space-y-3 flex-1">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-black uppercase text-foreground line-clamp-2" title={inv.raceId?.name}>{inv.raceId?.name}</h4>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5" title="Giờ chạy">
                            <Clock className="size-3.5 text-teal-400" />
                            <span className="font-medium">{formatDateDDMMYYYY(inv.raceId?.startTime)}</span>
                          </span>
                        </div>
                      </div>
                      <StatusBadge
                        label={statusConfig.label}
                        tone={statusConfig.tone}
                        pulse={statusConfig.pulse}
                        className="shrink-0"
                      />
                    </div>

                    {inv.tournamentId?.name && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                        <Flag className="size-3 shrink-0" /> {inv.tournamentId.name}
                      </div>
                    )}

                    <div className="flex flex-col gap-2 pt-3 border-t border-border/50">
                      {/* Owner & Share */}
                      <div className="flex items-center justify-between text-xs" title={`Chủ chuồng: ${inv.ownerId?.fullName}`}>
                        <div className="flex items-center gap-2">
                          <User className="size-3.5 text-muted-foreground" />
                          <span className="truncate max-w-[120px] font-medium">{inv.ownerId?.fullName}</span>
                        </div>
                        <span className="text-teal-400 font-bold bg-teal-500/10 px-1.5 py-0.5 rounded">
                          Thưởng {inv.jockeySharePercent}%
                        </span>
                      </div>

                      {/* Horse Action */}
                      <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg border border-border mt-1">
                        <span className="text-xs font-bold flex items-center gap-1.5 truncate pr-2">
                          <Sparkles className="size-3 text-primary" /> {inv.horseId?.name}
                        </span>
                        <Button
                          onClick={() => handleViewHorseDetail(inv.horseId.id)}
                          variant="ghost" size="sm"
                          className="h-6 text-[10px] font-bold bg-background hover:bg-muted border border-border px-2"
                          title="Xem thông số chiến mã"
                        >
                          <Eye className="size-3 mr-1" />
                          Xem
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar Controls */}
        {totalItems > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/60">
            <div className="text-xs text-muted-foreground">
              {isVi ? (
                <>
                  Hiển thị <span className="font-bold text-foreground">{totalItems > 0 ? startIndex + 1 : 0}</span> - <span className="font-bold text-foreground">{endIndex}</span> trong tổng số <span className="font-bold text-foreground">{totalItems}</span> cuộc đua
                </>
              ) : (
                <>
                  Showing <span className="font-bold text-foreground">{totalItems > 0 ? startIndex + 1 : 0}</span> - <span className="font-bold text-foreground">{endIndex}</span> of <span className="font-bold text-foreground">{totalItems}</span> races
                </>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-2.5 text-xs font-semibold"
                >
                  <ChevronLeft className="size-3.5 mr-1" />
                  {isVi ? "Trang trước" : "Previous"}
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`size-8 rounded-lg text-xs font-bold transition ${currentPage === pageNum
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-2.5 text-xs font-semibold"
                >
                  {isVi ? "Trang sau" : "Next"}
                  <ChevronRight className="size-3.5 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Horse Detail MODAL Dialog */}
      {selectedHorseId && (
        <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-scale-up">

            <div className="relative flex h-28 items-end bg-muted/50 p-5">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-teal-500/10" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-muted/50" />

              <button
                onClick={() => setSelectedHorseId(null)}
                className="absolute top-4 right-4 size-8 rounded-full bg-background/80 hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition shadow-sm backdrop-blur-md"
              >
                <X className="size-4" />
              </button>

              <div className="relative flex items-center gap-3">
                <div className="size-14 rounded-full border border-primary bg-primary/10 flex items-center justify-center backdrop-blur-md">
                  <Sparkles className="size-6 text-primary" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary">CHI TIẾT CHIẾN MÃ</span>
                  <h3 className="text-lg font-black uppercase text-foreground mt-0.5 drop-shadow-sm">
                    {isLoadingHorse ? "Đang tải..." : horseDetail?.name}
                  </h3>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {isLoadingHorse ? (
                <div className="space-y-4 py-8 animate-pulse text-center">
                  <div className="h-4 bg-muted/50 rounded w-1/3 mx-auto" />
                  <div className="h-2 bg-muted/50 rounded w-1/2 mx-auto" />
                  <div className="h-10 bg-muted/50 rounded" />
                </div>
              ) : horseDetail ? (
                <div className="space-y-4">
                  {horseDetail.image ? (
                    <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-border">
                      <img src={horseDetail.image} alt={horseDetail.name} className="size-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-32 w-full rounded-2xl bg-muted/30 border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground text-xs">
                      <HelpCircle className="size-8 text-muted-foreground/40 mb-2" />
                      Chưa cập nhật hình ảnh
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted/30 p-2.5 rounded-xl border border-border">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Giống</p>
                      <p className="text-xs font-bold text-foreground mt-0.5 truncate" title={horseDetail.breed}>{horseDetail.breed}</p>
                    </div>
                    <div className="bg-muted/30 p-2.5 rounded-xl border border-border">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Tuổi</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{horseDetail.age}</p>
                    </div>
                    <div className="bg-muted/30 p-2.5 rounded-xl border border-border">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Giới tính</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{horseDetail.gender === "male" ? "Đực" : "Cái"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-border bg-muted/30">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Kỹ thuật thi đấu</p>
                      <div className="space-y-3 mt-3">
                        <div>
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                            <span>Tốc độ</span>
                            <span className="font-bold text-primary">{horseDetail.baseSpeed || 60}/100</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${horseDetail.baseSpeed || 60}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                            <span>Sức bền</span>
                            <span className="font-bold text-teal-400">{horseDetail.staminaScore || 70}/100</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                            <div className="bg-teal-400 h-full rounded-full" style={{ width: `${horseDetail.staminaScore || 70}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-1.5">Sức khỏe</p>
                        <div className="inline-flex px-2 py-1 items-center gap-1.5 rounded-md border text-xs font-bold bg-green-500/10 text-green-500 border-green-500/20">
                          {horseDetail.healthStatus === "HEALTHY" ? "Khỏe mạnh" : horseDetail.healthStatus === "INJURED" ? "Chấn thương" : "Bị ốm"}
                        </div>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-1.5">Thông số vật lý</p>
                        <p className="text-xs text-foreground bg-background border border-border rounded-lg p-2 flex items-center justify-between">
                          <span>Cân nặng: <b>{horseDetail.weightKg}kg</b></span>
                          <span>Chiều cao: <b>{horseDetail.heightCm}cm</b></span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {horseDetail.description && (
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Mô tả đặc điểm</p>
                      <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border border-border">
                        {horseDetail.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">Không tìm thấy thông tin chiến mã.</div>
              )}
            </div>

            <div className="flex justify-end border-t border-border bg-muted/10 p-4">
              <Button
                onClick={() => setSelectedHorseId(null)}
                className="rounded-xl bg-muted/50 border border-border hover:bg-muted text-xs font-bold uppercase px-6 text-foreground transition"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function JockeyAssignedPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
        <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải...</p>
      </div>
    }>
      <JockeyAssignPage />
    </Suspense>
  );
}
