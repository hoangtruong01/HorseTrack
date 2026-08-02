"use client";
import Image from "next/image";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock,
  User,
  Eye,
  X,
  Trophy,
  MapPin,
  Flag,
  RotateCw,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

// Types
type TournamentInfo = {
  _id: string;
  name: string;
};

type RaceInfo = {
  _id: string;
  name: string;
  startTime: string;
  status: string;
  distanceMeters?: number;
  location?: string;
  lapCount?: number;
  tournamentId?: TournamentInfo | string;
};

type Assignment = {
  _id: string;
  role: "main" | "assistant";
  status: "assigned" | "accepted" | "declined" | "removed";
  raceId: RaceInfo;
  assignedBy: { _id: string; fullName: string };
  salary?: number;
  createdAt: string;
};

type TabFilter = "all" | "assigned" | "accepted" | "declined";

const TAB_OPTIONS: { key: TabFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "assigned", label: "Chờ duyệt" },
  { key: "accepted", label: "Đã nhận" },
  { key: "declined", label: "Đã từ chối" },
];

const raceStatusMap: Record<string, string> = {
  SCHEDULED: "LÊN LỊCH CHỜ CHẠY",
  CHECKING: "ĐANG KIỂM TRA SỨC KHỎE NGỰA",
  READY: "SẴN SÀNG XUẤT PHÁT",
  LIVE: "ĐANG DIỄN RA TRỰC TIẾP",
  FINISHED: "ĐÃ KẾT THÚC CHỜ XÁC NHẬN",
  RESULT_PUBLISHED: "ĐÃ CÔNG BỐ KẾT QUẢ",
  CANCELLED: "ĐÃ HỦY TRẬN",
};

export default function RefereeAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submittingActionId, setSubmittingActionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [confirmDeclineId, setConfirmDeclineId] = useState<string | null>(null);

  // Detail Modal State
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/referee/referee-assignments/my-assignments?limit=100");
      if (!res.ok) throw new Error("Không thể tải danh sách phân công");
      const resData = await res.json();
      const rawData = resData.data;
      setAssignments(Array.isArray(rawData) ? rawData : rawData?.data || []);
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Lỗi tải dữ liệu phân công.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleRespond = async (assignmentId: string, status: "accepted" | "declined") => {
    setSubmittingActionId(assignmentId);
    const actionLabel = status === "accepted" ? "Chấp nhận" : "Từ chối";

    try {
      const res = await fetch(`/api/referee/referee-assignments/${assignmentId}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || `${actionLabel} thất bại`);
      toast.success(`${actionLabel} phân công thành công!`);
      setConfirmDeclineId(null);

      // Refresh data
      await fetchAssignments();

      // Update selected assignment in modal if open
      setSelectedAssignment((prev) =>
        prev && (prev._id === assignmentId || (prev as unknown as { id?: string }).id === assignmentId)
          ? { ...prev, status }
          : prev
      );
    } catch (err) {
      toast.error((err as Error).message || "Lỗi khi xử lý thao tác.");
    } finally {
      setSubmittingActionId(null);
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "Chưa xác định";
    const d = new Date(dateStr);
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ngày ${d.toLocaleDateString("vi-VN")}`;
  };

  const filtered = activeTab === "all" ? assignments : assignments.filter((a) => a.status === activeTab);

  const counts = {
    all: assignments.length,
    assigned: assignments.filter((a) => a.status === "assigned").length,
    accepted: assignments.filter((a) => a.status === "accepted").length,
    declined: assignments.filter((a) => a.status === "declined").length,
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
      </div>
    );
  }

  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <PageHeader
        eyebrow="Race được phân công"
        title="Danh sách phân công giám sát"
        description="Quản lý toàn bộ các cuộc đua được Ban tổ chức chỉ định bạn vào tổ trọng tài giám sát chính thức. Nhấp vào thẻ để xem chi tiết đầy đủ."
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-3 overflow-x-auto">
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                activeTab === tab.key ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <section className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-border bg-card max-w-lg mx-auto space-y-3">
          <div className="size-12 rounded-full border border-border flex items-center justify-center text-muted-foreground/30">
            <Calendar className="size-6" />
          </div>
          <h4 className="text-sm font-bold uppercase text-foreground">
            {activeTab === "all" ? "Danh sách trống" : `Không có phân công "${TAB_OPTIONS.find((t) => t.key === activeTab)?.label}"`}
          </h4>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {activeTab === "all"
              ? "Bạn hiện tại chưa được Ban tổ chức phân công điều hành cuộc đua nào."
              : "Không có mục nào phù hợp bộ lọc hiện tại."}
          </p>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {filtered.map((assignment) => {
            const assignmentId = assignment._id || (assignment as { id?: string }).id || "";
            const raceId = assignment.raceId?._id || (assignment.raceId as unknown as { id?: string })?.id;
            if (!assignment.raceId) return null;

            return (
              <article
                key={assignmentId}
                onClick={() => setSelectedAssignment(assignment)}
                className="group relative cursor-pointer rounded-2xl border border-border bg-card p-5 flex flex-col justify-between space-y-4 hover:border-primary/50 transition duration-200 shadow-md hover:shadow-xl"
              >
                {/* Header Badge Row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      label={
                        assignment.status === "assigned"
                          ? "Chờ duyệt"
                          : assignment.status === "accepted"
                            ? "Đã nhận"
                            : assignment.status === "declined"
                              ? "Đã từ chối"
                              : "Đã hủy"
                      }
                      tone={
                        assignment.status === "accepted"
                          ? "green"
                          : assignment.status === "assigned"
                            ? "yellow"
                            : assignment.status === "declined"
                              ? "red"
                              : "slate"
                      }
                      pulse={assignment.status === "assigned"}
                    />
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded uppercase font-black tracking-wider border ${
                        assignment.role === "main"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {assignment.role === "main" ? "Trọng tài chính" : "Trọng tài phụ"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-primary opacity-80 group-hover:opacity-100 transition flex items-center gap-1">
                      <Eye className="size-3.5" /> Xem chi tiết
                    </span>
                    {assignment.status === "accepted" && (
                      <Button
                        asChild
                        variant="outline"
                        className="h-9 rounded-full px-3 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/referee/races/${raceId}`} className="flex items-center gap-1">
                          Tác nghiệp <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Race Title & Brief Info */}
                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase text-foreground leading-tight group-hover:text-primary transition">
                    {assignment.raceId.name}
                  </h3>

                  <div className="p-3 rounded-xl bg-muted/40 dark:bg-black/25 border border-border dark:border-white/5 space-y-2">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Giờ bắt đầu</p>
                        <p className="text-foreground font-bold mt-0.5 flex items-center gap-1">
                          <Clock className="size-3 text-teal-500 dark:text-teal-400 shrink-0" />
                          {formatDateTime(assignment.raceId.startTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Người phân công</p>
                        <p className="text-foreground font-bold mt-0.5 flex items-center gap-1 text-ellipsis overflow-hidden whitespace-nowrap">
                          <User className="size-3 text-teal-500 dark:text-teal-400 shrink-0" />
                          {assignment.assignedBy?.fullName || "Ban Tổ Chức"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Mức lương</p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                          {assignment.salary ? assignment.salary.toLocaleString("vi-VN") : "0"} Điểm
                        </p>
                      </div>
                    </div>
                    <div className="h-px bg-border dark:bg-white/5" />
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Trạng thái cuộc đua</p>
                        <p className="text-foreground font-bold mt-0.5">
                          {raceStatusMap[assignment.raceId.status] || assignment.raceId.status}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground group-hover:text-foreground font-medium flex items-center gap-0.5">
                        Bấm để xem chi tiết <ChevronRight className="size-3" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inline Actions for Pending Status */}
                {assignment.status === "assigned" && (
                  <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                    {confirmDeclineId === assignmentId ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs w-full animate-in fade-in slide-in-from-top-1 duration-200">
                        <span className="text-red-600 dark:text-red-400 font-bold">Xác nhận từ chối?</span>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setConfirmDeclineId(null)}
                            disabled={submittingActionId !== null}
                            variant="outline"
                            className="rounded-full text-[10px] h-7 px-3 uppercase font-bold"
                          >
                            Hủy
                          </Button>
                          <Button
                            onClick={() => handleRespond(assignmentId, "declined")}
                            disabled={submittingActionId !== null}
                            variant="destructive"
                            className="rounded-full text-[10px] h-7 px-3 uppercase font-bold"
                          >
                            Đồng ý
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => setConfirmDeclineId(assignmentId)}
                          disabled={submittingActionId !== null}
                          variant="outline"
                          className="rounded-full text-xs h-9 uppercase font-bold"
                        >
                          Từ chối
                        </Button>
                        <Button
                          onClick={() => handleRespond(assignmentId, "accepted")}
                          disabled={submittingActionId !== null}
                          className="rounded-full bg-primary hover:bg-primary/90 text-xs h-9 uppercase font-bold text-primary-foreground"
                        >
                          Nhận nhiệm vụ
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {/* ── DETAIL MODAL DIALOG ── */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={
                      selectedAssignment.status === "assigned"
                        ? "Chờ duyệt"
                        : selectedAssignment.status === "accepted"
                          ? "Đã nhận"
                          : selectedAssignment.status === "declined"
                            ? "Đã từ chối"
                            : "Đã hủy"
                    }
                    tone={
                      selectedAssignment.status === "accepted"
                        ? "green"
                        : selectedAssignment.status === "assigned"
                          ? "yellow"
                          : selectedAssignment.status === "declined"
                            ? "red"
                            : "slate"
                    }
                  />
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded uppercase font-black tracking-wider border ${
                      selectedAssignment.role === "main"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {selectedAssignment.role === "main" ? "Trọng tài chính (Main Referee)" : "Trọng tài phụ (Assistant Referee)"}
                  </span>
                </div>
                <h3 className="text-xl font-black uppercase text-foreground leading-snug">
                  {selectedAssignment.raceId.name}
                </h3>
                {typeof selectedAssignment.raceId.tournamentId === "object" && (
                  <p className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Trophy className="size-3.5" /> Giải đấu: {selectedAssignment.raceId.tournamentId.name}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="size-8 rounded-full border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Race Details Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Flag className="size-3.5 text-teal-400" /> Thông tin trận đua & Đường đua
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-muted/30 p-4 rounded-2xl border border-border/50">
                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">Thời gian bắt đầu</span>
                  <span className="font-bold text-foreground mt-0.5 block flex items-center gap-1">
                    <Clock className="size-3 text-teal-400 shrink-0" />
                    {formatDateTime(selectedAssignment.raceId.startTime)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">Địa điểm thi đấu</span>
                  <span className="font-bold text-foreground mt-0.5 block flex items-center gap-1">
                    <MapPin className="size-3 text-rose-400 shrink-0" />
                    {selectedAssignment.raceId.location || "Trường đua trung tâm"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">Cự ly đua</span>
                  <span className="font-bold text-foreground mt-0.5 block">
                    {selectedAssignment.raceId.distanceMeters
                      ? `${selectedAssignment.raceId.distanceMeters.toLocaleString("vi-VN")} mét`
                      : "Tiêu chuẩn"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">Số vòng đua</span>
                  <span className="font-bold text-foreground mt-0.5 block flex items-center gap-1">
                    <RotateCw className="size-3 text-indigo-400 shrink-0" />
                    {selectedAssignment.raceId.lapCount ? `${selectedAssignment.raceId.lapCount} vòng` : "Tiêu chuẩn"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">Trạng thái hiện tại</span>
                  <span className="font-bold text-emerald-400 mt-0.5 block">
                    {raceStatusMap[selectedAssignment.raceId.status] || selectedAssignment.raceId.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Assignment & Compensation Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Award className="size-3.5 text-amber-400" /> Thông tin phân công & Thù lao
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-muted/30 p-4 rounded-2xl border border-border/50">
                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">Người phân công</span>
                  <span className="font-bold text-foreground mt-0.5 block flex items-center gap-1">
                    <User className="size-3 text-teal-400 shrink-0" />
                    {selectedAssignment.assignedBy?.fullName || "Ban Tổ Chức"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">Ngày tạo phân công</span>
                  <span className="font-bold text-foreground mt-0.5 block font-mono">
                    {formatDateTime(selectedAssignment.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">Mức thù lao (Lương)</span>
                  <span className="font-extrabold text-emerald-400 text-sm mt-0.5 block">
                    {selectedAssignment.salary ? selectedAssignment.salary.toLocaleString("vi-VN") : "0"} Điểm
                  </span>
                </div>
              </div>
            </div>

            {/* Role & Duties Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" /> Trách nhiệm & Quyền hạn tác nghiệp
              </h4>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-xs space-y-2">
                {selectedAssignment.role === "main" ? (
                  <>
                    <p className="font-bold text-primary uppercase text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5" /> Nhiệm vụ của Trọng Tài Chính (Main Referee)
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-foreground/90 leading-relaxed text-[11px]">
                      <li>Chịu trách nhiệm tổng thể về tính công bằng, minh bạch và an toàn của cuộc đua.</li>
                      <li>Quyết định lệnh phát lệnh xuất phát và xử lý mọi sự cố phạm quy trên đường đua.</li>
                      <li>Xem xét báo cáo của các Trọng tài phụ và phê duyệt bảng thành tích chính thức cuối cùng.</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-teal-400 uppercase text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5" /> Nhiệm vụ của Trọng Tài Phụ (Assistant Referee)
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-foreground/90 leading-relaxed text-[11px]">
                      <li>Hỗ trợ kiểm tra khu vực xuất phát, cân nặng nài ngựa và thiết bị bảo hộ trước giờ đua.</li>
                      <li>Theo dõi trực tiếp các khúc cua nguy hiểm và góc đường đua được phân công.</li>
                      <li>Báo cáo tức thì cho Trọng tài chính nếu phát hiện vi phạm hành lang đua hoặc chèn ép trái luật.</li>
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs">
              <div>
                {selectedAssignment.status === "accepted" && (
                  <Button asChild className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase px-4 h-10">
                    <Link href={`/referee/races/${selectedAssignment.raceId._id || (selectedAssignment.raceId as unknown as { id?: string }).id}`}>
                      Tác nghiệp trực tiếp <ExternalLink className="size-4 ml-1.5" />
                    </Link>
                  </Button>
                )}
                {selectedAssignment.status === "assigned" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        handleRespond(
                          selectedAssignment._id || (selectedAssignment as unknown as { id?: string }).id || "",
                          "declined"
                        )
                      }
                      disabled={submittingActionId !== null}
                      variant="outline"
                      className="rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold uppercase h-10 px-4"
                    >
                      Từ chối
                    </Button>
                    <Button
                      onClick={() =>
                        handleRespond(
                          selectedAssignment._id || (selectedAssignment as unknown as { id?: string }).id || "",
                          "accepted"
                        )
                      }
                      disabled={submittingActionId !== null}
                      className="rounded-xl bg-primary hover:bg-primary/90 font-bold uppercase text-primary-foreground h-10 px-4 shadow-md"
                    >
                      Nhận nhiệm vụ
                    </Button>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => setSelectedAssignment(null)}
                className="rounded-xl px-5 h-10 font-bold border-border"
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
