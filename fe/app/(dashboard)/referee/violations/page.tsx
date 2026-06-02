"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Siren, ArrowRight, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

type RaceInfo = {
  _id: string;
  name: string;
  startTime: string;
  status: string;
};

type Assignment = {
  _id: string;
  status: string;
  raceId: RaceInfo;
};

export default function RefereeViolationsWorkspacePage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch("/api/referee/referee-assignments/my-assignments?limit=100");
        if (!res.ok) throw new Error("Không thể tải danh sách cuộc đua");
        const resData = await res.json();
        // Only accepted assignments
        const list = (resData.data?.data || []).filter(
          (a: any) => a.status === "accepted" && a.raceId
        );
        setAssignments(list);
      } catch (err: any) {
        toast.error(err.message || "Lỗi tải danh sách cuộc đua.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignments();
  }, []);

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
        eyebrow="Tác nghiệp trọng tài"
        title="Ghi Nhận Vi Phạm (Violation Report)"
        description="Chọn cuộc đua dưới đây để ghi chú các trường hợp phạm quy của nài ngựa và tự động áp dụng khung cộng giây phạt kỷ luật."
      />

      {assignments.length === 0 ? (
        <section className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed dark:border-white/10 border-border dark:bg-[#15151E] bg-card max-w-lg mx-auto space-y-3">
          <div className="size-12 rounded-full border dark:border-white/10 border-border flex items-center justify-center dark:text-white/30 text-muted-foreground">
            <Siren className="size-6" />
          </div>
          <h4 className="font-bold dark:text-white text-foreground uppercase text-sm">Chưa có cuộc đua nào</h4>
          <p className="text-xs dark:text-white/40 text-muted-foreground leading-relaxed">
            Bạn cần được Ban tổ chức phân công và chấp nhận cuộc đua trước khi báo cáo vi phạm.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {assignments.map((a) => {
            const isLive = a.raceId.status === "LIVE";
            const isFinished = a.raceId.status === "FINISHED";
            const isChecking = a.raceId.status === "CHECKING";
            const isSelectable = isLive || isFinished || isChecking;
            
            return (
              <article
                key={a._id}
                className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 shadow transition ${
                  isLive
                    ? "border-red-500/20 dark:bg-[linear-gradient(135deg,rgba(225,6,0,0.06),rgba(21,21,30,0.95))] bg-card"
                    : isFinished
                      ? "border-teal-500/20 dark:bg-[linear-gradient(135deg,rgba(20,184,166,0.06),rgba(21,21,30,0.95))] bg-card"
                      : "dark:border-white/5 border-border dark:bg-[#15151E]/90 bg-card hover:dark:border-white/15 border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <StatusBadge
                    label={
                      a.raceId.status === "SCHEDULED" ? "Chưa mở" :
                      a.raceId.status === "CHECKING" ? "Kiểm duyệt" :
                      a.raceId.status === "READY" ? "Sẵn sàng" :
                      a.raceId.status === "LIVE" ? "Đang chạy trực tiếp" :
                      a.raceId.status === "FINISHED" ? "Đã chạy xong" : "Đã công bố"
                    }
                    tone={
                      isLive ? "red" :
                      isFinished ? "teal" :
                      a.raceId.status === "CHECKING" ? "yellow" : "slate"
                    }
                    pulse={isLive}
                  />
                  <span className="text-[10px] dark:text-white/40 text-muted-foreground font-bold uppercase">
                    Nhật ký vi phạm
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase dark:text-white text-foreground leading-tight">
                    {a.raceId.name}
                  </h3>
                  <p className="text-[10px] dark:text-white/50 text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3 text-primary shrink-0" />
                    Ngày chạy: {formatDateTime(a.raceId.startTime)}
                  </p>
                </div>

                <div className="pt-2 border-t dark:border-white/5 border-border flex justify-end">
                  <Button
                    asChild
                    className={`h-9 px-4 rounded-full text-xs font-black uppercase ${
                      isSelectable
                        ? "bg-primary hover:bg-primary-dark text-white"
                        : "dark:bg-white/5 bg-muted/50 border dark:border-white/10 border-border hover:dark:bg-white/10 bg-muted/50 text-white"
                    }`}
                  >
                    <Link href={`/referee/races/${a.raceId._id}/violations`}>
                      {isLive ? "Ghi nhận vi phạm" : "Xem nhật ký lỗi"}
                      <ArrowRight className="size-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
