"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Edit2, Loader2, Award, Zap, Heart, Trophy, Timer, Gauge, ShieldAlert, Calendar, Sparkles, Flame } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { HorseForm } from "@/features/horses/components/horse-form";
import type { Horse, HorseHealthStatus } from "@/features/horses/components/horse-card";
import { raceResultsApi, type HorseVictoriesSummary, type HorseVictoryResultItem } from "@/lib/api-client";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
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
  const [summary, setSummary] = useState<HorseVictoriesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);

  const fetchHorseAndResults = async () => {
    setIsLoading(true);
    try {
      const [horseRes, resultsRes, summaryRes] = await Promise.all([
        fetch(`/api/owner/horses/${horseId}`),
        fetch(`/api/owner/horses/${horseId}/results`),
        raceResultsApi.getByHorse(horseId).catch(() => null),
      ]);

      if (horseRes.ok) {
        const resData = await horseRes.json();
        if (resData.success) {
          const raw = resData.data;
          setHorse({ ...raw, id: raw.id || raw._id });
          setActiveImageIndex(0);
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

      if (summaryRes) {
        setSummary(summaryRes);
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
        <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
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

  const formatTimeMs = (ms?: number) => {
    if (!ms) return "—";
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(2);
    return `${minutes}:${seconds.padStart(5, "0")}`;
  };

  const victoriesList = summary?.championships || [];
  const totalRacesCount = summary?.totalRaces ?? results.length;
  const totalWinsCount = summary?.wins ?? results.filter((r) => r.position === 1).length;
  const winRatePercent = totalRacesCount > 0 ? Math.round((totalWinsCount / totalRacesCount) * 100) : 0;

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

      {/* Horse KPI Victories Bar */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-card to-card p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1">
            <Trophy className="size-3.5" /> Số lần Vô Địch
          </p>
          <p className="mt-1 font-mono text-2xl font-black text-yellow-400">
            {totalWinsCount} lần
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Tỷ lệ thắng
          </p>
          <p className="mt-1 font-mono text-2xl font-black text-emerald-400">
            {winRatePercent}%
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Tổng số trận đã đua
          </p>
          <p className="mt-1 font-mono text-2xl font-black text-foreground">
            {totalRacesCount} trận
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Tổng điểm tích lũy
          </p>
          <p className="mt-1 font-mono text-2xl font-black text-teal-400">
            +{summary?.totalPoints ?? 0} điểm
          </p>
        </div>
      </div>

      {/* Horse Deck Details */}
      <section className="grid gap-6 md:grid-cols-12 bg-card border border-border rounded-2xl overflow-hidden p-6 md:p-8 shadow-[0_18px_56px_rgba(0,0,0,0.28)]">
        
        {/* Left Column: Image (span 5) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          {(() => {
            const horseImages = horse.images && horse.images.length > 0
              ? horse.images
              : (horse.image ? [horse.image] : []);
            const activeImage = horseImages[activeImageIndex] || horse.image || "";

            return (
              <>
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/40 border border-border flex items-center justify-center">
                  {activeImage ? (
                    <Image
                      src={activeImage}
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

                {horseImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {horseImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                          activeImageIndex === index ? "border-primary" : "border-transparent opacity-75 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={img || ""}
                          alt={`${horse.name} thumb ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            );
          })()}

          {/* Core Speed & Stamina Indicators */}
          <div className="space-y-4 bg-muted/20 border border-border rounded-xl p-4">
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
              <p className="text-sm text-foreground/80 leading-relaxed bg-muted/20 border border-border rounded-xl p-4">
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

      {/* Championships Gold Showcase Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black uppercase tracking-wider text-foreground flex items-center gap-2">
            <Trophy className="size-5 text-yellow-400" /> Bảng Vàng Các Lần Vô Địch ({victoriesList.length})
          </h3>
          <span className="text-xs text-yellow-400 font-bold uppercase tracking-wider">
            🏆 Danh hiệu Quán Quân (Rank 1)
          </span>
        </div>

        {victoriesList.length === 0 ? (
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6 text-center text-muted-foreground">
            <Trophy className="size-10 mx-auto mb-2 opacity-20 text-yellow-500" />
            <p className="font-bold text-xs uppercase tracking-widest text-foreground">Chưa có giải Vô Địch</p>
            <p className="text-xs mt-1">Chiến mã này đang tích cực tham gia các giải đua để chinh phục chiếc cúp Vô địch đầu tiên.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {victoriesList.map((res) => {
              const raceObj = typeof res.raceId === "object" ? res.raceId : null;
              const tourObj = raceObj && typeof raceObj.tournamentId === "object" ? raceObj.tournamentId : null;
              const jockeyObj = typeof res.jockeyUserId === "object" ? res.jockeyUserId : null;

              return (
                <div
                  key={res.id}
                  className="group relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-card to-card p-5 shadow-[0_4px_24px_rgba(234,179,8,0.08)] transition duration-300 hover:border-yellow-500/60"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-yellow-400 border border-yellow-500/30">
                          🏆 VÔ ĐỊCH (HANG 1)
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3.5 text-yellow-500" />
                          {raceObj?.startTime
                            ? new Date(raceObj.startTime).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </span>
                      </div>

                      <h4 className="text-base font-black uppercase text-foreground group-hover:text-yellow-400 transition">
                        {tourObj?.name ? `${tourObj.name} · ` : ""}{raceObj?.name || "Giải đấu chính thức"}
                      </h4>

                      <p className="text-xs text-muted-foreground">
                        Nài ngựa điều khiển: <strong className="text-foreground font-bold">{jockeyObj?.fullName || "—"}</strong>
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-border pt-2 sm:pt-0">
                      <span className="text-sm font-mono font-black text-foreground">
                        {formatTimeMs(res.finishTimeMs)}
                      </span>
                      <span className="text-xs font-bold text-teal-400 mt-0.5">
                        +{res.points || 10} điểm thưởng
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Horse Historical Race Results Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-black uppercase tracking-wider text-foreground flex items-center gap-2">
          <Flame className="size-5 text-[#E10600]" /> Tất Cả Lịch Sử Thi Đấu ({summary?.allResults?.length ?? 0})
        </h3>

        {!summary || summary.allResults.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card/50 p-8 text-center text-muted-foreground/60">
            <Trophy className="size-12 mx-auto mb-3 opacity-20" />
            <p className="font-bold text-xs uppercase tracking-widest">Chưa có dữ liệu thi đấu</p>
            <p className="text-xs mt-1">Chiến mã này chưa từng tham gia trận đua chính thức nào hoặc kết quả chưa được ghi nhận.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {summary.allResults
              .slice((historyPage - 1) * 5, historyPage * 5)
              .map((rec) => {
                const raceObj = typeof rec.raceId === "object" ? rec.raceId : null;
                const tourObj = raceObj && typeof raceObj.tournamentId === "object" ? raceObj.tournamentId : null;
                const jockeyObj = typeof rec.jockeyUserId === "object" ? rec.jockeyUserId : null;
                const rank = rec.rank || 0;
                const isPodium = rank > 0 && rank <= 3;
                const podiumColors = [
                  "border-yellow-500/40 bg-yellow-500/5 text-yellow-400 shadow-[0_4px_20px_rgba(234,179,8,0.08)]", // 1st
                  "border-slate-300/40 bg-slate-300/5 text-slate-300 shadow-[0_4px_20px_rgba(203,213,225,0.08)]", // 2nd
                  "border-amber-600/40 bg-amber-600/5 text-amber-500 shadow-[0_4px_20px_rgba(217,119,6,0.08)]", // 3rd
                ];
                const cardBorder = isPodium ? podiumColors[rank - 1] : "border-border bg-card text-foreground/80";

                return (
                  <article
                    key={rec.id}
                    className={`relative rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition duration-200 hover:border-primary/40 ${cardBorder}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1">
                          <Calendar className="size-3 text-muted-foreground/60" />
                          {raceObj?.startTime
                            ? new Date(raceObj.startTime).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : "N/A"}
                        </span>
                      </div>

                      <h4 className="font-black uppercase text-sm text-foreground">
                        {tourObj?.name ? `${tourObj.name} · ` : ""}{raceObj?.name || "Trận đua chính thức"}
                      </h4>

                      <p className="text-xs text-muted-foreground">
                        Nài ngựa điều khiển: <strong className="text-foreground">{jockeyObj?.fullName || "—"}</strong>
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-border pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase text-muted-foreground/60 font-bold block">Thời gian cán đích</span>
                        <span className="font-mono font-black text-sm text-foreground flex items-center gap-1 mt-0.5">
                          <Timer className="size-3.5 text-primary" /> {formatTimeMs(rec.finishTimeMs)}
                        </span>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase text-muted-foreground/60 font-bold block">Điểm thưởng</span>
                        <span className="font-mono font-black text-sm text-teal-400 mt-0.5 block">
                          +{rec.points || 0} điểm
                        </span>
                      </div>

                      <div className={`size-10 rounded-xl flex items-center justify-center border font-black text-base shrink-0 ${
                        rank === 1 ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.2)]" :
                        rank === 2 ? "bg-slate-300/20 border-slate-300 text-slate-200" :
                        rank === 3 ? "bg-amber-600/20 border-amber-600 text-amber-500" :
                        "bg-black/35 border-border text-muted-foreground"
                      }`}>
                        {rank > 0 ? `#${rank}` : "—"}
                      </div>
                    </div>
                  </article>
                );
              })}

            <DataTablePagination
              currentPage={historyPage}
              totalItems={summary.allResults.length}
              pageSize={5}
              onPageChange={setHistoryPage}
            />
          </div>
        )}
      </section>
    </main>
  );
}
