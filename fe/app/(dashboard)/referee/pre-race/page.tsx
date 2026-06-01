"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, ShieldCheck } from "lucide-react";
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

export default function RefereePreRaceWorkspacePage() {
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
        title="Pre-race Check (Kiểm tra trước Race)"
        description="Chọn một cuộc đua đang kiểm duyệt dưới đây để cập nhật tình trạng sức khỏe của ngựa và điểm danh nài ngựa trước giờ xuất phát."
      />

      {assignments.length === 0 ? (
        <section className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-white/10 bg-[#15151E] max-w-lg mx-auto space-y-3">
          <div className="size-12 rounded-full border border-white/10 flex items-center justify-center text-white/30">
            <ShieldCheck className="size-6" />
          </div>
          <h4 className="font-bold text-white uppercase text-sm">Chưa có cuộc đua nào</h4>
          <p className="text-xs text-white/40 leading-relaxed">
            Bạn cần được Ban tổ chức phân công và chấp nhận cuộc đua trước khi thực hiện kiểm duyệt.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {assignments.map((a) => {
            const isChecking = a.raceId.status === "CHECKING";
            return (
              <article
                key={a._id}
                className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 shadow transition ${
                  isChecking
                    ? "border-primary/20 bg-[linear-gradient(135deg,rgba(225,6,0,0.06),rgba(21,21,30,0.95))]"
                    : "border-white/5 bg-[#15151E]/90 hover:border-white/15"
                }`}
              >
                <div className="flex items-center justify-between">
                  <StatusBadge
                    label={
                      a.raceId.status === "SCHEDULED" ? "Chưa mở" :
                      a.raceId.status === "CHECKING" ? "Đang mở duyệt" :
                      a.raceId.status === "READY" ? "Sẵn sàng" : "Đã chạy / Xong"
                    }
                    tone={
                      isChecking ? "yellow" :
                      a.raceId.status === "READY" ? "green" : "slate"
                    }
                    pulse={isChecking}
                  />
                  <span className="text-[10px] text-white/40 font-bold uppercase">
                    Cự ly: {a.raceId.status === "LIVE" ? "Đang chạy" : "Chưa xuất phát"}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase text-white leading-tight">
                    {a.raceId.name}
                  </h3>
                  <p className="text-[10px] text-white/50 flex items-center gap-1">
                    <Clock className="size-3 text-primary shrink-0" />
                    Giờ khởi chạy: {formatDateTime(a.raceId.startTime)}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex justify-end">
                  <Button
                    asChild
                    className={`h-9 px-4 rounded-full text-xs font-black uppercase ${
                      isChecking
                        ? "bg-primary hover:bg-primary-dark text-white"
                        : "bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                    }`}
                  >
                    <Link href={`/referee/races/${a.raceId._id}`}>
                      {isChecking ? "Bắt đầu kiểm duyệt" : "Xem chi tiết"}
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
