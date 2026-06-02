"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flag, Loader2, ArrowRight, Timer, MapPin, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

type Race = {
  id: string;
  name: string;
  distance: string;
  surface: string;
  startTime: string;
  maxParticipants?: number;
  participantsCount?: number;
  tournamentId: {
    id: string;
    name: string;
    status: string;
  };
};

export default function OwnerRacesBrowserPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRaces() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/owner/races");
        if (response.ok) {
          const resData = await response.json();
          if (resData.success) {
            // Backend returns a paginated list: { data: [...], meta: {...} }
            setRaces(resData.data?.data || resData.data || []);
          }
        } else {
          toast.error("Không thể lấy danh sách trận đua từ Backend.");
        }
      } catch (err) {
        console.error("Lỗi lấy trận đua:", err);
        toast.error("Lỗi kết nối tới server.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchRaces();
  }, []);

  return (
    <main className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Đại hội đua ngựa"
        title="Danh Sách Trận Đua"
        description="Tìm kiếm các trận đua đang mở hồ sơ ghi danh chiến mã. Đảm bảo chiến mã của bạn đáp ứng các tiêu chuẩn sức khỏe trước khi nộp hồ sơ."
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 dark:text-white/55 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-[#E10600]" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tìm kiếm các trận đấu khả dụng...</p>
        </div>
      ) : races.length === 0 ? (
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-12 text-center shadow-[0_18px_56px_rgba(0,0,0,0.28)]">
          <Award className="size-16 dark:text-white/15 text-muted-foreground mx-auto mb-4 stroke-[1]" />
          <h3 className="text-xl font-black dark:text-white text-foreground uppercase tracking-tight mb-2">Chưa có trận đấu nào</h3>
          <p className="text-sm dark:text-white/50 text-muted-foreground max-w-md mx-auto">
            Hệ thống hiện không có trận đua nào đang mở đăng ký hoặc được khởi tạo. Vui lòng quay lại sau!
          </p>
        </div>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {races.map((race) => {
            const tournament = race.tournamentId || {};
            const tournamentName = tournament.name || "Giải tự do";
            const tournamentStatus = tournament.status || "DRAFT";
            const isOpen = tournamentStatus === "OPEN_REGISTRATION";
            const isFull = (race.participantsCount || 0) >= (race.maxParticipants || 20);

            return (
              <article
                key={race.id}
                className="group relative overflow-hidden rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E] bg-card p-5 shadow-[0_18px_56px_rgba(0,0,0,0.28)] transition duration-200 hover:border-primary/40 dark:hover:bg-[#1C1C25] hover:bg-muted/80 flex flex-col justify-between min-h-[290px]"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-white/20 to-transparent" />
                <div className="absolute -right-12 -top-12 size-36 rounded-full bg-primary/5 blur-3xl transition group-hover:bg-primary/15" />
                
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {isOpen ? (
                      <StatusBadge label="Mở ghi tên" tone="green" />
                    ) : (
                      <StatusBadge label="Đóng đăng ký" tone="slate" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#E10600] max-w-[150px] truncate">
                      {tournamentName}
                    </span>
                  </div>
                  
                  <h2 className="mt-4 text-xl font-black uppercase tracking-tight dark:text-white text-foreground line-clamp-1 group-hover:text-primary transition">
                    {race.name}
                  </h2>
                  
                  {/* Specs */}
                  <div className="mt-4 grid gap-2.5 text-xs dark:text-white/60 text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Timer className="size-4 text-primary shrink-0" />
                      Khởi tranh: {new Date(race.startTime).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="size-4 text-primary shrink-0" />
                      Khoảng cách: {race.distance} · Mặt sân: {race.surface}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Users className="size-4 text-primary shrink-0" />
                      Số lượng: {race.participantsCount || 0}/{race.maxParticipants || 20} chiến mã
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t dark:border-white/5 border-border flex gap-2">
                  {isOpen ? (
                    isFull ? (
                      <Button disabled className="rounded-xl flex-1 text-xs py-2 h-9 dark:bg-white/5 bg-muted/50 dark:text-white/40 text-muted-foreground border dark:border-white/5 border-border">
                        Trận đấu đã đầy
                      </Button>
                    ) : (
                      <Button asChild className="rounded-xl flex-1 text-xs py-2 h-9 bg-[#E10600] hover:bg-[#B80500] text-white font-bold uppercase tracking-wider">
                        <Link href={`/owner/races/${race.id}/register`}>
                          Ghi danh ngay <ArrowRight className="size-3.5 ml-1" />
                        </Link>
                      </Button>
                    )
                  ) : (
                    <Button disabled className="rounded-xl flex-1 text-xs py-2 h-9 dark:bg-white/5 bg-muted/50 dark:text-white/40 text-muted-foreground border dark:border-white/5 border-border">
                      Ngừng tiếp nhận hồ sơ
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
