"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Filter, Flag, User } from "lucide-react";

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
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Lỗi tải dữ liệu phân công.");
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
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xử lý thao tác.");
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
                : "text-white/40 hover:text-white/70 border border-transparent hover:border-border"
            }`}
          >
            {tab.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${
              activeTab === tab.key ? "bg-primary/20 text-primary" : "bg-white/5 text-white/30"
            }`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <section className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-border bg-card max-w-lg mx-auto space-y-3">
          <div className="size-12 rounded-full border border-border flex items-center justify-center text-white/30">
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
            const assignmentId = assignment._id || (assignment as any).id;
            const raceId = assignment.raceId?._id || (assignment.raceId as any)?.id;
            if (!assignment.raceId) return null;
            return (
              <article
                key={assignmentId}
                className="rounded-2xl border border-border bg-card/85 p-5 flex flex-col justify-between space-y-4 hover:border-primary/25 transition shadow-lg"
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
                    <span className="text-[10px] text-white/45 bg-white/5 border border-border px-2.5 py-0.5 rounded uppercase font-black tracking-wider">
                      {assignment.role === "main" ? "Trọng tài chính" : "Trọng tài phụ"}
                    </span>
                  </div>
                  {assignment.status === "accepted" && (
                    <Button asChild variant="outline" className="h-10 rounded-full border-white/15 hover:bg-white/5 text-white hover:text-white">
                      <Link href={`/referee/races/${raceId}`} className="flex items-center gap-1.5 text-xs">
                        Tác nghiệp <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase text-white leading-tight">
                    {assignment.raceId.name}
                  </h3>
                  <div className="p-3 rounded-xl bg-black/25 border border-white/5 space-y-2">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Giờ bắt đầu</p>
                        <p className="text-white font-bold mt-0.5 flex items-center gap-1">
                          <Clock className="size-3 text-teal-400 shrink-0" />
                          {formatDateTime(assignment.raceId.startTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Người phân công</p>
                        <p className="text-white font-bold mt-0.5 flex items-center gap-1 text-ellipsis overflow-hidden whitespace-nowrap">
                          <User className="size-3 text-teal-400 shrink-0" />
                          {assignment.assignedBy?.fullName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Mức lương</p>
                        <p className="text-emerald-400 font-bold mt-0.5">
                          {assignment.salary ? assignment.salary.toLocaleString("vi-VN") : "0"} Điểm
                        </p>
                      </div>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Trạng thái cuộc đua</p>
                      <p className="text-white font-bold text-xs mt-0.5">
                        {raceStatusMap[assignment.raceId.status] || assignment.raceId.status}
                      </p>
                    </div>
                  </div>
                </div>

                {assignment.status === "assigned" && (
                  <div className="pt-2">
                    {confirmDeclineId === assignmentId ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs w-full animate-in fade-in slide-in-from-top-1 duration-200">
                        <span className="text-red-400 font-bold">Xác nhận từ chối?</span>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setConfirmDeclineId(null)}
                            disabled={submittingActionId !== null}
                            variant="outline"
                            className="rounded-full border-border hover:bg-white/5 text-[10px] h-7 px-3 uppercase font-bold text-white hover:text-white"
                          >
                            Hủy
                          </Button>
                          <Button
                            onClick={() => handleRespond(assignmentId, "declined")}
                            disabled={submittingActionId !== null}
                            className="rounded-full bg-red-600 hover:bg-red-700 text-[10px] h-7 px-3 uppercase font-bold text-white border-0"
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
                          className="rounded-full border-border hover:bg-white/5 text-xs h-9 uppercase font-bold text-white hover:text-white"
                        >
                          Từ chối
                        </Button>
                        <Button
                          onClick={() => handleRespond(assignmentId, "accepted")}
                          disabled={submittingActionId !== null}
                          className="rounded-full bg-primary hover:bg-primary/90 text-xs h-9 uppercase font-bold text-white"
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
