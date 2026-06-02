"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Flag, ShieldAlert, User } from "lucide-react";

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
  assignedBy: {
    _id: string;
    fullName: string;
  };
  createdAt: string;
};

export default function RefereeAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submittingActionId, setSubmittingActionId] = useState<string | null>(null);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/referee/referee-assignments/my-assignments?limit=100");
      if (!res.ok) throw new Error("Không thể tải danh sách phân công");
      const resData = await res.json();
      setAssignments(resData.data?.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Lỗi tải dữ liệu phân công.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleRespond = async (assignmentId: string, status: "ACCEPTED" | "REJECTED") => {
    setSubmittingActionId(assignmentId);
    const actionLabel = status === "ACCEPTED" ? "Chấp nhận" : "Từ chối";
    try {
      const res = await fetch(`/api/referee/referee-assignments/${assignmentId}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || `Thao tác ${actionLabel.toLowerCase()} thất bại`);
      }

      toast.success(`${actionLabel} phân công thành công!`);
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
    return `${d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })} ngày ${d.toLocaleDateString("vi-VN")}`;
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

      {assignments.length === 0 ? (
        <section className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed dark:border-white/10 border-border dark:bg-[#15151E] bg-card max-w-lg mx-auto space-y-3">
          <div className="size-12 rounded-full border dark:border-white/10 border-border flex items-center justify-center dark:text-white/30 text-muted-foreground">
            <Calendar className="size-6" />
          </div>
          <h4 className="font-bold dark:text-white text-foreground uppercase text-sm">Danh sách trống</h4>
          <p className="text-xs dark:text-white/40 text-muted-foreground leading-relaxed">
            Bạn hiện tại chưa được Ban tổ chức phân công điều hành cuộc đua nào trong hệ thống.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-2">
          {assignments.map((assignment) => {
            if (!assignment.raceId) return null;
            return (
              <article
                key={assignment._id}
                className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5 flex flex-col justify-between space-y-4 hover:border-primary/25 transition shadow-lg"
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
                    <span className="text-[10px] dark:text-white/45 text-muted-foreground dark:bg-white/5 bg-muted/50 border dark:border-white/10 border-border px-2.5 py-0.5 rounded uppercase font-black tracking-wider">
                      {assignment.role === "main" ? "Trọng tài chính" : "Trọng tài phụ"}
                    </span>
                  </div>
                  {assignment.status === "accepted" && (
                    <Button asChild variant="outline" className="h-10 rounded-full dark:border-white/15 border-border hover:dark:bg-white/5 bg-muted/50 dark:text-white text-foreground hover:dark:text-white text-foreground">
                      <Link href={`/referee/races/${assignment.raceId._id}`} className="flex items-center gap-1.5 text-xs">
                        Tác nghiệp <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase dark:text-white text-foreground leading-tight">
                    {assignment.raceId.name}
                  </h3>
                  <div className="p-3 rounded-xl dark:bg-black/25 bg-muted/20 border dark:border-white/5 border-border space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] dark:text-white/40 text-muted-foreground">Giờ bắt đầu</p>
                        <p className="dark:text-white text-foreground font-bold mt-0.5 flex items-center gap-1">
                          <Clock className="size-3 text-teal-400 shrink-0" />
                          {formatDateTime(assignment.raceId.startTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] dark:text-white/40 text-muted-foreground">Người phân công</p>
                        <p className="dark:text-white text-foreground font-bold mt-0.5 flex items-center gap-1">
                          <User className="size-3 text-teal-400 shrink-0" />
                          {assignment.assignedBy?.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="h-px dark:bg-white/5 bg-muted/50" />
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] dark:text-white/40 text-muted-foreground">Trạng thái cuộc đua</p>
                      <p className="dark:text-white text-foreground font-bold text-xs mt-0.5">
                        {assignment.raceId.status === "SCHEDULED" && "LÊN LỊCH CHỜ CHẠY"}
                        {assignment.raceId.status === "CHECKING" && "ĐANG KHỞI CHẠY KIỂM TRA SỨC KHỎE NGỰA"}
                        {assignment.raceId.status === "READY" && "SẴN SÀNG XUẤT PHÁT"}
                        {assignment.raceId.status === "LIVE" && "ĐANG DIỄN RA TRỰC TIẾP"}
                        {assignment.raceId.status === "FINISHED" && "ĐÃ KẾT THÚC CHỜ XÁC NHẬN KẾT QUẢ"}
                        {assignment.raceId.status === "RESULT_PUBLISHED" && "ĐÃ CÔNG BỐ KẾT QUẢ VÀ TRẢ THƯỞNG"}
                        {assignment.raceId.status === "CANCELLED" && "ĐÃ HỦY TRẬN"}
                      </p>
                    </div>
                  </div>
                </div>

                {assignment.status === "assigned" && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                      onClick={() => handleRespond(assignment._id, "REJECTED")}
                      disabled={submittingActionId !== null}
                      variant="outline"
                      className="rounded-full dark:border-white/10 border-border hover:dark:bg-white/5 bg-muted/50 text-xs h-9 uppercase font-bold dark:text-white text-foreground hover:dark:text-white text-foreground"
                    >
                      Từ chối
                    </Button>
                    <Button
                      onClick={() => handleRespond(assignment._id, "ACCEPTED")}
                      disabled={submittingActionId !== null}
                      className="rounded-full bg-primary hover:bg-primary/90 text-xs h-9 uppercase font-bold text-white"
                    >
                      Nhận nhiệm vụ
                    </Button>
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
