"use client";
import Image from "next/image";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, ShieldCheck, Trophy } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import { refereeAssignmentsApi, type AssignmentItem } from "@/lib/api-client";

export default function RefereePreRaceWorkspacePage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // CHỨC NĂNG: Tải danh sách phân công trọng tài (Assignments) được chấp nhận và có trạng thái trận đấu đang là SCHEDULED hoặc CHECKING
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const result = await refereeAssignmentsApi.myAssignments({ limit: 100 });
        const list = (result.data || []).filter(
          (a) =>
            a.status === "accepted" &&
            typeof a.raceId === "object" &&
            a.raceId !== null &&
            (a.raceId.status === "SCHEDULED" || a.raceId.status === "CHECKING")
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
        title="Pre-race Check (Kiểm tra trước Race)"
        description="Chọn một cuộc đua đang kiểm duyệt dưới đây để cập nhật tình trạng sức khỏe của ngựa và điểm danh nài ngựa trước giờ xuất phát."
      />

      {assignments.length === 0 ? (
        <section className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-border bg-muted/30 max-w-lg mx-auto space-y-3">
          <div className="size-12 rounded-full border border-border flex items-center justify-center text-muted-foreground">
            <ShieldCheck className="size-6" />
          </div>
          <h4 className="font-bold text-foreground uppercase text-sm">Không có cuộc đua cần kiểm duyệt</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Chỉ hiển thị các cuộc đua đang ở trạng thái Chờ xuất phát hoặc Đang kiểm duyệt. Các cuộc đua đã qua giai đoạn này sẽ không hiển thị ở đây.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {assignments.map((a) => {
            const race = typeof a.raceId === "object" ? a.raceId : null;
            if (!race) return null;
            const isChecking = race.status === "CHECKING";
            return (
              <Link
                key={a._id}
                href={`/referee/races/${race._id}`}
                className={`group rounded-2xl border p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-xl transition duration-200 cursor-pointer ${
                  isChecking
                    ? "border-primary/40 bg-primary/5 hover:border-primary"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <StatusBadge
                    label={
                      race.status === "SCHEDULED" ? "Chưa mở" :
                      race.status === "CHECKING" ? "Đang mở duyệt" :
                      race.status === "READY" ? "Sẵn sàng" : "Đã chạy / Xong"
                    }
                    tone={
                      isChecking ? "yellow" :
                      race.status === "READY" ? "green" : "slate"
                    }
                    pulse={isChecking}
                  />
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">
                    Cự ly: {race.status === "LIVE" ? "Đang chạy" : "Chưa xuất phát"}
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
                    Giờ khởi chạy: {formatDateTime(race.startTime)}
                  </p>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground font-medium">
                    Bấm vào thẻ để vào kiểm duyệt
                  </span>
                  <div className={`h-9 px-4 rounded-full text-xs font-black uppercase flex items-center justify-center gap-1 transition ${
                    isChecking
                      ? "bg-primary text-primary-foreground group-hover:bg-primary/90"
                      : "border border-border text-foreground group-hover:border-primary/50 group-hover:text-primary"
                  }`}>
                    <span>{isChecking ? "Bắt đầu kiểm duyệt" : "Xem chi tiết"}</span>
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
