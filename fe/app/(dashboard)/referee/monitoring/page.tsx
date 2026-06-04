"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, Clock } from "lucide-react";
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

export default function RefereeMonitoringWorkspacePage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch("/api/referee/referee-assignments/my-assignments?limit=100");
        if (!res.ok) throw new Error("Không thể tải danh sách cuộc đua");
        const resData = await res.json();
        const rawData = resData.data;
        const rawArray = Array.isArray(rawData) ? rawData : (rawData?.data || []);
        // Only accepted assignments
        const list = rawArray.filter(
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
        title="Theo Dõi Race (Race Monitoring)"
        description="Theo dõi trực tiếp trạng thái xuất phát, điều phối race chạy trực tiếp (LIVE) và quản lý chuyển đổi trạng thái cuộc đua."
      />

      {assignments.length === 0 ? (
        <section className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-border bg-muted/30 max-w-lg mx-auto space-y-3">
          <div className="size-12 rounded-full border border-border flex items-center justify-center text-muted-foreground">
            <Activity className="size-6" />
          </div>
          <h4 className="font-bold text-foreground uppercase text-sm">Chưa có cuộc đua nào</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bạn cần được Ban tổ chức phân công và chấp nhận cuộc đua trước khi thực hiện giám sát.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {assignments.map((a) => {
            const isLive = a.raceId.status === "LIVE";
            const isReady = a.raceId.status === "READY";
            const isActive = isLive || isReady;
            
            return (
              <article
                key={a._id}
                className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 shadow-sm transition ${
                  isLive
                    ? "border-red-500/20 bg-red-500/5"
                    : isReady
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-border bg-card hover:border-primary/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <StatusBadge
                    label={
                      a.raceId.status === "SCHEDULED" ? "Chưa mở" :
                      a.raceId.status === "CHECKING" ? "Kiểm duyệt" :
                      a.raceId.status === "READY" ? "SẴN SÀNG" :
                      a.raceId.status === "LIVE" ? "ĐANG CHẠY TRỰC TIẾP" : "ĐÃ KẾT THÚC"
                    }
                    tone={
                      isLive ? "red" :
                      isReady ? "green" :
                      a.raceId.status === "CHECKING" ? "yellow" : "slate"
                    }
                    pulse={isLive || isReady}
                  />
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">
                    Giám sát trực tiếp
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase text-foreground leading-tight">
                    {a.raceId.name}
                  </h3>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3 text-primary shrink-0" />
                    Giờ xuất phát: {formatDateTime(a.raceId.startTime)}
                  </p>
                </div>

                <div className="pt-2 border-t border-border flex justify-end">
                  <Button
                    asChild
                    variant={isActive ? "default" : "outline"}
                    className="h-9 px-4 rounded-full text-xs font-black uppercase"
                  >
                    <Link href={`/referee/races/${a.raceId._id}`}>
                      {isLive ? "Vào phòng giám sát" : isReady ? "Kích hoạt xuất phát" : "Xem chi tiết"}
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
