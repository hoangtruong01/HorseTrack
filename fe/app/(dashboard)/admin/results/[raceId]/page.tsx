"use client";
import Image from "next/image";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Siren, Timer, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

interface Race {
  _id: string;
  name: string;
  startTime: string;
  status: string;
  distanceMeter: number;
  tournamentId?: {
    _id: string;
    name: string;
  };
}

interface RaceResultItem {
  id: string;
  _id: string;
  rank?: number;
  finishTimeMs?: number;
  outcome: string;
  incident: string;
  points?: number;
  prizeAmount: number;
  status: "DRAFT" | "CONFIRMED" | "PUBLISHED" | "CANCELLED";
  note?: string;
  horseId?: {
    id: string;
    _id: string;
    name: string;
    breed?: string;
  };
  jockeyUserId?: {
    id: string;
    _id: string;
    fullName: string;
  };
}

export default function AdminResultDetailPage({
  params,
}: {
  params: Promise<{ raceId: string }>;
}) {
  const { raceId } = use(params);
  const router = useRouter();

  const [race, setRace] = useState<Race | null>(null);
  const [results, setResults] = useState<RaceResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch race detail
      const raceRes = await fetch(`/api/admin/races/${raceId}`);
      if (!raceRes.ok) throw new Error("Không thể tải thông tin cuộc đua");
      const raceData = await raceRes.json();
      setRace(raceData.data);

      // 2. Fetch results for race
      const resultsRes = await fetch(`/api/admin/race-results/race/${raceId}`);
      if (!resultsRes.ok) throw new Error("Không thể tải kết quả lượt đua");
      const resultsData = await resultsRes.json();
      
      const rawResults: RaceResultItem[] = resultsData.data || [];
      // Sort by rank
      rawResults.sort((a, b) => {
        const rA = a.rank ?? 999;
        const rB = b.rank ?? 999;
        return rA - rB;
      });
      setResults(rawResults);
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Lỗi tải dữ liệu.");
      toast.error((err as Error).message || "Lỗi tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceId]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/admin/race-results/race/${raceId}/publish`, {
        method: "PATCH",
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Công bố kết quả thất bại");
      }

      toast.success("Công bố kết quả thành công! Hệ thống đã chia thưởng và cập nhật bảng xếp hạng.");
      await fetchData();
    } catch (err) {
      toast.error((err as Error).message || "Lỗi khi công bố kết quả.");
    } finally {
      setIsPublishing(false);
    }
  };

  const formatTime = (ms?: number) => {
    if (!ms) return "—";
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(2);
    return `${minutes}:${seconds.padStart(5, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
      </div>
    );
  }

  if (error || !race) {
    return (
      <main className="max-w-4xl mx-auto p-8 space-y-4 text-center">
        <h2 className="text-xl font-bold text-white">{error || "Không tìm thấy lượt đua"}</h2>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </main>
    );
  }

  const resultsStatus = results[0]?.status || "DRAFT";
  const isPublished = resultsStatus === "PUBLISHED" || race.status === "RESULT_PUBLISHED";
  const canPublish = resultsStatus === "CONFIRMED";

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12 px-4 sm:px-6">
      <Link href="/admin/results" className="inline-flex items-center text-xs text-white/50 hover:text-white transition">
        <ArrowLeft className="size-3.5 mr-1" /> Quay lại danh sách kết quả
      </Link>

      <PageHeader
        eyebrow="Chi tiết kết quả lượt đua"
        title={race.name}
        description="Xem bảng xếp hạng, giây phạt vi phạm và thực hiện công bố kết quả chính thức."
        actions={
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="h-11 rounded-full border-white/10 hover:bg-white/5 text-white hover:text-white">
              <Link href="/admin/results">Xem tất cả</Link>
            </Button>
          </div>
        }
      />

      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#15151E] p-5 shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(225,6,0,0.1),transparent_25rem)]" />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-teal-400">TRẠNG THÁI BIÊN BẢN KẾT QUẢ</span>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge
                label={
                  isPublished ? "Đã Công Bố (Published)" :
                  resultsStatus === "CONFIRMED" ? "Chờ Công Bố (Confirmed)" : "Bản Nháp (Draft)"
                }
                tone={
                  isPublished ? "teal" :
                  resultsStatus === "CONFIRMED" ? "green" : "yellow"
                }
                pulse={resultsStatus === "CONFIRMED"}
              />
              <span className="text-sm font-bold text-white uppercase">{race.name}</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              {isPublished 
                ? "Biên bản kết quả đã được công bố chính thức. Hệ thống đã tự động cộng điểm xếp hạng và chia thưởng điểm."
                : "Biên bản kết quả đang chờ admin duyệt và công bố chính thức."}
            </p>
          </div>

          {!isPublished && (
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                onClick={handlePublish}
                disabled={isPublishing || !canPublish}
                className="h-10 px-5 rounded-full bg-primary hover:bg-primary/95 text-white text-xs font-black uppercase flex items-center gap-1.5"
              >
                <ShieldCheck className="size-3.5" /> {isPublishing ? "Đang công bố..." : "Phê duyệt & Công bố kết quả"}
              </Button>
            </div>
          )}

          {isPublished && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shrink-0">
              <CheckCircle2 className="size-4" /> Kết quả đã công bố chính thức
            </div>
          )}
        </div>
      </section>

      {/* Results Table */}
      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-white">
          Bảng xếp hạng lượt đua chi tiết
        </h3>

        {results.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-white/10 bg-[#15151E]/40 text-white/40 text-xs">
            Chưa có kết quả nào cho lượt đua này.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#15151E] shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-[10px] font-black uppercase tracking-widest text-white/50">
                  <th className="p-4 w-16 text-center">Hạng</th>
                  <th className="p-4">Chiến mã (Horse)</th>
                  <th className="p-4">Giống ngựa</th>
                  <th className="p-4">Nài ngựa (Jockey)</th>
                  <th className="p-4">
                    <span className="flex items-center gap-1">
                      <Timer className="size-3.5 text-primary" /> Thời gian
                    </span>
                  </th>
                  <th className="p-4">
                    <span className="flex items-center gap-1">
                      <Siren className="size-3.5 text-primary" /> Lỗi / Sự cố
                    </span>
                  </th>
                  <th className="p-4 text-right">Điểm thưởng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((res, index) => (
                  <tr key={res.id || res._id || index} className="hover:bg-white/5 transition">
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center size-6 rounded-full font-black text-xs ${
                          res.rank === 1
                            ? "bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.3)]"
                            : res.rank === 2
                            ? "bg-slate-300 text-black"
                            : res.rank === 3
                            ? "bg-[#CD7F32] text-foreground"
                            : "bg-muted border border-border text-muted-foreground"
                        }`}
                      >
                        {res.rank || "—"}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white uppercase">{res.horseId?.name || "Chiến mã ẩn"}</td>
                    <td className="p-4 text-white/60">{res.horseId?.breed || "Chưa xác định"}</td>
                    <td className="p-4 text-white">{res.jockeyUserId?.fullName || "Nài ngựa ẩn"}</td>
                    <td className="p-4 font-mono font-black text-white text-sm">
                      {res.outcome === "finished" ? formatTime(res.finishTimeMs) : "Không hoàn thành"}
                    </td>
                    <td className={`p-4 ${res.incident !== "none" && res.incident !== "NONE" ? "text-primary font-bold" : "text-white/40"}`}>
                      {res.note || (res.incident !== "none" && res.incident !== "NONE" ? res.incident : "Không")}
                    </td>
                    <td className="p-4 text-right font-black text-teal-400 text-sm">
                      +{res.points || 0} điểm
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
