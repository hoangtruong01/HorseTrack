"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RaceRegistrationForm } from "@/features/registrations/components/race-registration-form";
import type { Horse } from "@/features/horses/components/horse-card";
import { toast } from "sonner";

type RaceDetail = {
  id: string;
  name: string;
  distance: string;
  surface: string;
  startTime: string;
  maxParticipants?: number;
  participantsCount?: number;
  tournamentId?: {
    id: string;
    name: string;
    status: string;
  };
};

export default function RaceRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const raceId = params.raceId as string;

  const [race, setRace] = useState<RaceDetail | null>(null);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [raceRes, horsesRes] = await Promise.all([
          fetch(`/api/owner/races/${raceId}`),
          fetch("/api/owner/horses"),
        ]);

        if (raceRes.ok && horsesRes.ok) {
          const raceData = await raceRes.json();
          const horsesData = await horsesRes.json();

          if (raceData.success) {
            setRace(raceData.data);
          }
          if (horsesData.success) {
            setHorses(horsesData.data?.data || horsesData.data || []);
          }
        } else {
          toast.error("Không thể tải thông tin trận đua hoặc chuồng ngựa.");
          router.push("/owner/races");
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
        toast.error("Lỗi kết nối mạng.");
      } finally {
        setIsLoading(false);
      }
    }

    if (raceId) {
      loadData();
    }
  }, [raceId]);

  const handleSubmit = async (horseId: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/owner/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raceId,
          horseId,
          tournamentId: race?.tournamentId?.id,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Ghi tên chiến mã thất bại.");
      }

      toast.success("Hồ sơ đăng ký trận đua của bạn đã được gửi thành công!");
      router.push("/owner/registrations");
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi nộp hồ sơ.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/55">
        <Loader2 className="size-8 animate-spin text-[#E10600]" />
        <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang khởi tạo thủ tục đăng ký...</p>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#15151E]/85 p-12 text-center max-w-xl mx-auto shadow-2xl">
        <p className="text-sm text-white/50 mb-4">Trận đua không khả dụng hoặc đã kết thúc.</p>
        <Button asChild className="rounded-full bg-white/5 text-white">
          <Link href="/owner/races">Quay lại danh sách trận đua</Link>
        </Button>
      </div>
    );
  }

  // Format race fields for the form
  const formattedRace = {
    id: race.id,
    name: race.name,
    tournamentName: race.tournamentId?.name,
    distance: race.distance,
    surface: race.surface,
    date: new Date(race.startTime).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    startTime: new Date(race.startTime).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    capacity: race.maxParticipants || 20,
    participantsCount: race.participantsCount || 0,
  };

  return (
    <main className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/owner/races"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white/50 hover:text-white transition mb-3"
        >
          <ChevronLeft className="size-4" /> Quay lại danh sách trận đua
        </Link>
        
        <PageHeader
          eyebrow="Ghi danh thi đấu"
          title={`Đăng Ký: ${race.name}`}
          description="Nộp hồ sơ kỹ thuật chiến mã để ban quản trị giải đấu phê duyệt lượt tham gia xuất phát."
        />
      </div>

      <section className="mt-4">
        <RaceRegistrationForm
          race={formattedRace}
          horses={horses}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/owner/races")}
          isSubmitting={isSubmitting}
        />
      </section>
    </main>
  );
}
