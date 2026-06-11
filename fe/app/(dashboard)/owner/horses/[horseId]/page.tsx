"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Edit2, Loader2, Award, Zap, Heart, Trophy, Timer, Gauge, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { HorseForm } from "@/features/horses/components/horse-form";
import type { Horse, HorseHealthStatus } from "@/features/horses/components/horse-card";
import { toast } from "sonner";

const healthMeta: Record<
  HorseHealthStatus,
  { label: string; tone: "red" | "yellow" | "green" | "slate" | "teal" }
> = {
  HEALTHY: { label: "Khỏe mạnh", tone: "green" },
  INJURED: { label: "Chấn thương", tone: "red" },
  RECOVERING: { label: "Đang hồi phục", tone: "yellow" },
  RETIRED: { label: "Giải nghệ", tone: "slate" },
};

type RaceResultRecord = {
  id: string;
  raceName: string;
  raceStartTime: string;
  position: number;
  finishTime: number;
  gateNumber: number;
  speed: number;
  distanceCovered: number;
  injuryNotes?: string;
};

export default function HorseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const horseId = params.horseId as string;
  const isEditing = searchParams.get("edit") === "true";

  const [horse, setHorse] = useState<Horse | null>(null);
  const [results, setResults] = useState<RaceResultRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHorseAndResults = async () => {
    setIsLoading(true);
    try {
      const [horseRes, resultsRes] = await Promise.all([
        fetch(`/api/owner/horses/${horseId}`),
        fetch(`/api/owner/horses/${horseId}/results`),
      ]);

      if (horseRes.ok) {
        const resData = await horseRes.json();
        if (resData.success) {
          const raw = resData.data;
          setHorse({ ...raw, id: raw.id || raw._id });
        }
      } else {
        toast.error("Không thể lấy thông tin chi tiết của ngựa.");
        router.push("/owner/horses");
        return;
      }

      if (resultsRes.ok) {
        const resData = await resultsRes.json();
        if (resData.success) {
          const raw = resData.data || [];
          const mapped: RaceResultRecord[] = raw.map((item: Record<string, unknown>) => ({
            id: (item.id || item._id) as string,
            raceName: ((item.raceId as Record<string, unknown>)?.name as string) || "Giải đấu tự do",
            raceStartTime: ((item.raceId as Record<string, unknown>)?.startTime as string) || new Date().toISOString(),
            position: item.position as number,
            finishTime: item.finishTime as number,
            gateNumber: item.gateNumber as number,
            speed: item.speed as number,
            distanceCovered: item.distanceCovered as number,
            injuryNotes: item.injuryNotes as string | undefined,
          }));
          setResults(mapped);
        }
      }
    } catch (err) {
      console.error("Lỗi lấy chi tiết ngựa và lịch sử:", err);
      toast.error("Lỗi kết nối tới Backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (horseId) {
      fetchHorseAndResults();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horseId]);

  const handleUpdate = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/owner/horses/${horseId}`, {
        method: "PATCH",
        body: formData,
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Cập nhật chiến mã thất bại.");
      }

      toast.success("Thông tin chiến mã đã được cập nhật thành công!");
      
      // Turn off edit mode
      router.push(`/owner/horses/${horseId}`);
      fetchHorseAndResults(); // Reload
    } catch (err) {
      toast.error((err as Error).message || "Đã xảy ra lỗi khi lưu chiến mã.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-foreground/55">
        <Loader2 className="size-8 animate-spin text-[#E10600]" />
        <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải dữ liệu hồ sơ...</p>
      </div>
    );
  }

  if (!horse) {
    return (
      <div className="rounded-2xl border border-border bg-card/85 p-12 text-center max-w-xl mx-auto shadow-2xl">
        <p className="text-sm text-muted-foreground mb-4">Chiến mã không tồn tại hoặc bạn không có quyền xem.</p>
        <Button asChild className="rounded-full bg-muted text-foreground">
          <Link href="/owner/horses">Quay lại chuồng ngựa</Link>
        </Button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <main className="space-y-6 max-w-4xl mx-auto">
        <div>
          <Link
            href={`/owner/horses/${horseId}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition mb-3"
          >
            <ChevronLeft className="size-4" /> Hủy chỉnh sửa
          </Link>
          <PageHeader
            eyebrow="Chỉnh sửa hồ sơ"
            title={`Cập Nhật ${horse.name}`}
            description="Chỉnh sửa hoặc cập nhật các thông số sức khỏe và kỹ thuật mới nhất của chiến mã."
          />
        </div>

        <section className="mt-4">
          <HorseForm
            initialData={horse}
            onSubmit={handleUpdate}
            onCancel={() => router.push(`/owner/horses/${horseId}`)}
            isSubmitting={isSubmitting}
          />
        </section>
      </main>
    );
  }

  const meta = healthMeta[horse.healthStatus] || { label: horse.healthStatus, tone: "slate" };

  return (
    <main className="space-y-8 max-w-4xl mx-auto">
      <div>
        <Link
          href="/owner/horses"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition mb-3"
        >
          <ChevronLeft className="size-4" /> Quay lại chuồng ngựa
        </Link>
        
        <PageHeader
          eyebrow="Hồ sơ chiến mã"
          title={horse.name}
          description="Thông số kỹ thuật chuẩn quốc tế và lịch sử tham gia thi đấu."
          actions={
            <Button
              onClick={() => router.push(`/owner/horses/${horseId}?edit=true`)}
              className="rounded-full bg-muted border border-border hover:bg-white/10 text-foreground flex items-center gap-2"
            >
              <Edit2 className="size-4" />
              Chỉnh sửa hồ sơ
            </Button>
          }
        />
      </div>

      {/* Horse Deck Details */}
      <section className="grid gap-6 md:grid-cols-12 bg-card border border-border rounded-2xl overflow-hidden p-6 md:p-8 shadow-[0_18px_56px_rgba(0,0,0,0.28)]">
        
        {/* Left Column: Image (span 5) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/40 border border-border flex items-center justify-center">
            {horse.image ? (
              <Image
                src={horse.image}
                alt={horse.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground/40">
                <Award className="size-20 stroke-[1]" />
                <span className="text-xs uppercase tracking-widest mt-3">No Image</span>
              </div>
            )}
            <div className="absolute top-3 left-3">
              <StatusBadge label={meta.label} tone={meta.tone} />
            </div>
          </div>

          {/* Core Speed & Stamina Indicators */}
          <div className="space-y-4 bg-muted02] border border-border rounded-xl p-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground uppercase tracking-wider flex items-center gap-1 font-bold">
                  <Zap className="size-3.5 text-yellow-400" /> Tốc độ nền
                </span>
                <span className="text-foreground font-mono font-bold">{horse.baseSpeed} km/h</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full"
                  style={{ width: `${Math.min(100, (horse.baseSpeed / 100) * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground uppercase tracking-wider flex items-center gap-1 font-bold">
                  <Heart className="size-3.5 text-red-500" /> Thể lực tích lũy
                </span>
                <span className="text-foreground font-mono font-bold">{horse.staminaScore}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                  style={{ width: `${horse.staminaScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Information Sheet (span 7) */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E10600]">Thông số sinh học</p>
              <h3 className="text-2xl font-black uppercase text-foreground tracking-tight mt-1">{horse.name}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 border-y border-border py-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">Giống ngựa</span>
                <p className="text-foreground font-bold">{horse.breed || "Không rõ giống"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">Màu sắc</span>
                <p className="text-foreground font-bold">{horse.color || "Không rõ màu sắc"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">Giới tính</span>
                <p className="text-foreground font-bold">
                  {horse.gender === "MALE" ? "Ngựa Đực (Male)" : horse.gender === "FEMALE" ? "Ngựa Cái (Female)" : "Ngựa Thiến (Gelding)"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">Tuổi đời</span>
                <p className="text-foreground font-bold">{horse.age ? `${horse.age} tuổi` : "N/A"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">Trọng lượng (kg)</span>
                <p className="text-foreground font-mono font-bold">{horse.weightKg ? `${horse.weightKg} kg` : "N/A"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">Chiều cao (cm)</span>
                <p className="text-foreground font-mono font-bold">{horse.heightCm ? `${horse.heightCm} cm` : "N/A"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-muted-foreground/60 uppercase tracking-widest">Mô tả đặc điểm</span>
              <p className="text-sm text-foreground/80 leading-relaxed bg-muted02] border border-border rounded-xl p-4">
                {horse.description || "Chiến mã chưa cập nhật thông tin mô tả cụ thể về tính cách hoặc thế mạnh địa hình."}
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button asChild variant="outline" className="rounded-xl border border-border hover:bg-muted text-foreground">
              <Link href="/owner/horses">Quay lại chuồng ngựa</Link>
            </Button>
            <Button
              onClick={() => router.push(`/owner/races`)}
              className="rounded-xl bg-[#E10600] hover:bg-[#B80500] text-foreground font-bold uppercase text-xs tracking-wider"
            >
              Ghi danh thi đấu
            </Button>
          </div>
        </div>

      </section>

      {/* Horse Historical Race Results Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-black uppercase tracking-wider text-foreground flex items-center gap-2">
          <Trophy className="size-5 text-[#E10600]" /> Lịch sử thi đấu & Kết quả
        </h3>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card/50 p-8 text-center text-muted-foreground/60">
            <Trophy className="size-12 mx-auto mb-3 opacity-20" />
            <p className="font-bold text-xs uppercase tracking-widest">Chưa có dữ liệu thi đấu</p>
            <p className="text-xs mt-1">Chiến mã này chưa từng tham gia trận đua chính thức nào hoặc kết quả chưa được ghi nhận.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((rec) => {
              const isPodium = rec.position <= 3;
              const podiumColors = [
                "border-yellow-500/40 bg-yellow-500/5 text-yellow-400 shadow-[0_4px_20px_rgba(234,179,8,0.08)]", // 1st
                "border-slate-300/40 bg-slate-300/5 text-slate-300 shadow-[0_4px_20px_rgba(203,213,225,0.08)]", // 2nd
                "border-amber-600/40 bg-amber-600/5 text-amber-500 shadow-[0_4px_20px_rgba(217,119,6,0.08)]", // 3rd
              ];
              const cardBorder = isPodium ? podiumColors[rec.position - 1] : "border-border bg-card text-foreground/80";

              return (
                <article
                  key={rec.id}
                  className={`relative rounded-xl border p-4 flex flex-col justify-between ${cardBorder}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                        {new Date(rec.raceStartTime).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                      <h4 className="font-black uppercase text-sm text-foreground mt-1 line-clamp-1">{rec.raceName}</h4>
                    </div>

                    <div className={`size-10 rounded-lg flex items-center justify-center border font-black text-lg ${
                      rec.position === 1 ? "bg-yellow-500/20 border-yellow-500 text-yellow-400" :
                      rec.position === 2 ? "bg-slate-300/20 border-slate-300 text-slate-200" :
                      rec.position === 3 ? "bg-amber-600/20 border-amber-600 text-amber-500" :
                      "bg-black/35 border-border text-muted-foreground"
                    }`}>
                      #{rec.position}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] border-t border-border pt-3">
                    <div>
                      <span className="text-muted-foreground/60 uppercase block">Thời gian</span>
                      <span className="font-mono font-bold text-foreground flex items-center gap-1 mt-0.5">
                        <Timer className="size-3 text-primary" /> {rec.finishTime}s
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground/60 uppercase block">Tốc độ TB</span>
                      <span className="font-mono font-bold text-foreground flex items-center gap-1 mt-0.5">
                        <Gauge className="size-3 text-primary" /> {rec.speed} km/h
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground/60 uppercase block">Cổng xuất phát</span>
                      <span className="font-mono font-bold text-foreground block mt-0.5">Cổng {rec.gateNumber}</span>
                    </div>
                  </div>

                  {rec.injuryNotes && (
                    <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-[10px] text-red-400 flex items-start gap-1.5">
                      <ShieldAlert className="size-3.5 shrink-0 mt-0.5" />
                      <span>{rec.injuryNotes}</span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
