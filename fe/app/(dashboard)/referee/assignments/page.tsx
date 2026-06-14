"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

// Types
type RaceInfo = {
  _id: string;
  name: string;
  startTime: string;
  status: string;
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

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/referee/referee-assignments/my-assignments?limit=100");
      if (!res.ok) throw new Error("Không thể tải danh sách phân công");
      const resData = await res.json();
      const rawData = resData.data;
      setAssignments(Array.isArray(rawData) ? rawData : (rawData?.data || []));
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Lỗi tải dữ liệu phân công.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, []);

  /* ── FIX: Send lowercase values matching backend RespondStatus enum ── */
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
      await fetchAssignments();
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

  const filtered = activeTab === "all" ? assignments : assignments.filter(a => a.status === activeTab);

  const counts = {
    all: assignments.length,
    assigned: assignments.filter(a => a.status === "assigned").length,
    accepted: assignments.filter(a => a.status === "accepted").length,
    declined: assignments.filter(a => a.status === "declined").length,
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <PageHeader
        eyebrow="Race được phân công"
        title="Danh sách phân công giám sát"
        description="Quản lý toàn bộ các cuộc đua được Ban tổ chức chỉ định bạn vào tổ trọng tài giám sát chính thức."
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-3 overflow-x-auto">
        {TAB_OPTIONS.map(tab => (
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
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${
              activeTab === tab.key ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            }`}>
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
            {activeTab === "all" ? "Danh sách trống" : `Không có phân công "${TAB_OPTIONS.find(t => t.key === activeTab)?.label}"`}
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
                className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between space-y-4 hover:border-primary/25 transition shadow-lg"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      label={
                        assignment.status === "assigned" ? "Chờ duyệt" :
                        assignment.status === "accepted" ? "Đã nhận" :
                        assignment.status === "declined" ? "Đã từ chối" : "Đã hủy"
                      }
                      tone={
                        assignment.status === "accepted" ? "green" :
                        assignment.status === "assigned" ? "yellow" :
                        assignment.status === "declined" ? "red" : "slate"
                      }
                      pulse={assignment.status === "assigned"}
                    />
                    <span className={`text-[10px] px-2.5 py-0.5 rounded uppercase font-black tracking-wider border ${
                      assignment.role === "main"
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-muted text-muted-foreground border-border"
                    }`}>
                      {assignment.role === "main" ? "Trọng tài chính" : "Trọng tài phụ"}
                    </span>
                  </div>
                  {assignment.status === "accepted" && (
                    <Button asChild variant="outline" className="h-10 rounded-full">
                      <Link href={`/referee/races/${raceId}`} className="flex items-center gap-1.5 text-xs">
                        Tác nghiệp <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase text-foreground leading-tight">
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
                          {assignment.assignedBy?.fullName}
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
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Trạng thái cuộc đua</p>
                      <p className="text-foreground font-bold text-xs mt-0.5">
                        {raceStatusMap[assignment.raceId.status] || assignment.raceId.status}
                      </p>
                    </div>
                  </div>
                </div>

                {assignment.status === "assigned" && (
                  <div className="pt-2">
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
    </main>
  );
}
