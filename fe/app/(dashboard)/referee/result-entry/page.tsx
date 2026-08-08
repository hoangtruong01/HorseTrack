"use client";

/**
 * ====================================================================
 * CHỨC NĂNG: DANH SÁCH TRẬN ĐUA CHỜ NHẬP KẾT QUẢ (RESULTS TO BE ENTERED)
 * QUYỀN SỬ DỤNG: REFEREE
 * MÔ TẢ:
 * - Danh sách các cuộc đua đã chạy xong nhưng chưa được trọng tài nhập kết quả về đích.
 * ====================================================================
 */
import Image from "next/image";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, ArrowRight, Clock, Trophy } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import { refereeAssignmentsApi, type AssignmentItem } from "@/lib/api-client";

export default function RefereeResultEntryWorkspacePage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const result = await refereeAssignmentsApi.myAssignments({ limit: 100 });
        const list = (result.data || []).filter(
          (a) => a.status === "accepted" && typeof a.raceId === "object" && a.raceId !== null
        );
        setAssignments(list);
      } catch (err) {
        toast.error((err as Error).message || "Lỗi tải danh sách cuộc đua.");
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
        <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
      </div>
    );
  }

  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <PageHeader
        eyebrow="Tác nghiệp trọng tài"
        title="Xác Nhận Kết Quả (Input Result)"
        description="Chọn cuộc đua đã kết thúc dưới đây để thực hiện nhập thời gian về đích, chạy thuật toán giả lập hoặc bấm khóa biên bản kết quả chính thức."
      />

      {assignments.length === 0 ? (
        <section className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-border bg-muted/30 max-w-lg mx-auto space-y-3">
          <div className="size-12 rounded-full border border-border flex items-center justify-center text-muted-foreground">
            <Award className="size-6" />
          </div>
          <h4 className="font-bold text-foreground uppercase text-sm">Chưa có cuộc đua nào</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bạn cần được Ban tổ chức phân công và chấp nhận cuộc đua trước khi nhập kết quả.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {assignments.map((a) => {
            const race = typeof a.raceId === "object" ? a.raceId : null;
            if (!race) return null;
            const isFinished = race.status === "FINISHED";
            const isLive = race.status === "LIVE";
            const isPublished = race.status === "RESULT_PUBLISHED";
            const isSelectable = isFinished || isLive || isPublished;

            return (
              <Link
                key={a._id}
                href={`/referee/races/${race._id}/result-entry`}
                className={`group rounded-2xl border p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-xl transition duration-200 cursor-pointer ${
                  isFinished
                    ? "border-teal-500/30 bg-teal-500/5 hover:border-teal-500/60"
                    : isLive
                      ? "border-red-500/30 bg-red-500/5 hover:border-red-500/60"
                      : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <StatusBadge
                    label={
                      race.status === "SCHEDULED" ? "Chưa mở" :
                      race.status === "CHECKING" ? "Kiểm duyệt" :
                      race.status === "READY" ? "Sẵn sàng" :
                      race.status === "LIVE" ? "Đang trực tiếp" :
                      race.status === "FINISHED" ? "ĐÃ XONG - CHỜ DUYỆT" : "ĐÃ CÔNG BỐ"
                    }
                    tone={
                      isFinished ? "teal" :
                      isLive ? "red" :
                      isPublished ? "green" : "slate"
                    }
                    pulse={isLive || isFinished}
                  />
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">
                    Nhập biên bản
                  </span>
                </div>

                <div className="space-y-1">
                  {typeof race.tournamentId === "object" && (race.tournamentId as { name?: string })?.name && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                      <Trophy className="size-3 shrink-0" />
                      <span>{(race.tournamentId as { name: string }).name}</span>
                    </div>
                  )}
                  <h3 className="text-sm font-black uppercase text-foreground leading-tight group-hover:text-primary transition">
                    {race.name}
                  </h3>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3 text-primary shrink-0" />
                    Ngày chạy: {formatDateTime(race.startTime)}
                  </p>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground font-medium">
                    Bấm vào thẻ để nhập kết quả
                  </span>
                  <div className={`h-9 px-4 rounded-full text-xs font-black uppercase flex items-center justify-center gap-1 transition ${
                    isSelectable
                      ? "bg-primary text-primary-foreground group-hover:bg-primary/90"
                      : "border border-border text-foreground group-hover:border-primary/50 group-hover:text-primary"
                  }`}>
                    <span>{isFinished ? "Nhập kết quả ngay" : isPublished ? "Xem kết quả đã khóa" : "Nhập kết quả nháp"}</span>
                    <ArrowRight className="size-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}
