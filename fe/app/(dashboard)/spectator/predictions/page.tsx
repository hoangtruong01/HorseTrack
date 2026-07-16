"use client";
import Image from "next/image";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { predictionsApi, walletApi, type PredictionItem } from "@/lib/api-client";
import { Activity, Award, Bell, Coins, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function SpectatorPredictionsPage() {
  const [balance, setBalance] = useState(0);
  const [myPredictions, setMyPredictions] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    setLoadingBalance(true);
    try {
      const res = await walletApi.myHistory({ limit: 1 });
      setBalance(res.points ?? 0);
    } catch (e) {
      console.error("Lỗi khi lấy số dư điểm ví:", e);
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await predictionsApi.listMyPredictions({ page: 1, limit: 100 });
      setMyPredictions(res.data || []);
    } catch (e) {
      console.error("Lỗi khi tải lịch sử dự đoán:", e);
      toast.error("Không thể tải danh sách lịch sử dự đoán");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCancelPrediction = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy lượt dự đoán này và nhận lại điểm cược (nếu có)?")) {
      return;
    }
    setCancelingId(id);
    try {
      await predictionsApi.cancel(id);
      toast.success("Hủy đặt cược và hoàn điểm thành công!");
      void fetchBalance();
      void fetchPredictions();
    } catch (e) {
      console.error("Lỗi khi hủy đặt cược:", e);
      toast.error((e as Error).message || "Không thể hủy cược dự đoán lúc này");
    } finally {
      setCancelingId(null);
    }
  };

  useEffect(() => {
    void fetchBalance();
    void fetchPredictions();
  }, [fetchBalance, fetchPredictions]);

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
        <PageHeader
          eyebrow="Prediction Station"
          title="Lịch Sử Dự Đoán"
          description="Xem lại lịch sử và kết quả của các lượt dự đoán chiến mã bạn đã thực hiện."
        />

        {/* Real Points Display */}
        <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-border bg-card px-5 py-3 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            <Coins className="size-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Điểm thưởng hiện tại</span>
            {loadingBalance ? (
              <Loader2 className="mt-1 size-4 animate-spin text-primary" />
            ) : (
              <p className="text-xl font-black text-foreground">
                {balance.toLocaleString("vi-VN")}{" "}
                <span className="text-base font-bold text-muted-foreground">điểm</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Side: Summary & Guide */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative space-y-5 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-lg">
            <div className="pointer-events-none absolute top-0 right-0 h-48 w-48 rounded-full bg-primary/5 blur-[60px]" />
            
            <h3 className="flex items-center gap-2 text-base font-black uppercase tracking-tight text-foreground">
              <Award className="size-5 text-primary" /> Thể Lệ & Quy Định
            </h3>

            <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground">1. Đặt Dự Đoán</p>
                <p>Khán giả có thể tham gia dự đoán trực tiếp tại trang chi tiết của mỗi trận đấu trước giờ khởi tranh (khi trận đấu ở trạng thái SCHEDULED, CHECKING, hoặc READY).</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground">2. Điểm thưởng & Khấu trừ</p>
                <p>Mỗi dự đoán đúng sẽ giúp bạn nhận ngay <strong className="text-foreground">+1 Điểm</strong>. Ngược lại, nếu dự đoán sai tài khoản sẽ bị trừ <strong className="text-foreground">-1 Điểm</strong>.</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground">3. Hủy dự đoán / Hoàn cược</p>
                <p>Bạn có thể tự do hủy dự đoán và nhận lại 100% điểm cược trước thời gian diễn ra cuộc đua ít nhất 2 tiếng. Dưới 2 tiếng hoặc khi cuộc đua đã bắt đầu/kết thúc sẽ không thể hủy.</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground">4. Quy đổi điểm thưởng</p>
                <p>Tích lũy điểm để tạo yêu cầu quy đổi tại <strong className="text-foreground">Ví điểm thưởng</strong> và mang mã QR nhận quà trực tiếp tại quầy trường đua.</p>
              </div>
            </div>

            <div className="pt-2">
              <Button asChild className="w-full rounded-xl bg-primary hover:bg-[#B80500] text-white text-xs font-black uppercase tracking-wider py-2.5">
                <Link href="/spectator/tournaments" className="flex items-center justify-center gap-1.5">
                  Đến trang Giải Đấu để dự đoán
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side: List of Predictions */}
        <div className="lg:col-span-8 space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="flex items-center gap-2 text-base font-black uppercase tracking-tight text-foreground">
              <Activity className="size-5 text-primary" /> Các lượt đã dự đoán ({myPredictions.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
              <p className="mt-3 text-xs font-mono uppercase tracking-widest">Đang tải lịch sử...</p>
            </div>
          ) : myPredictions.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card py-16 text-center text-xs text-muted-foreground shadow-sm">
              <Bell className="mx-auto mb-2 size-10 text-muted-foreground/30" />
              Bạn chưa thực hiện lượt dự đoán nào.
            </div>
          ) : (
            <div className="space-y-4">
              {myPredictions.map((p) => {
                const raceName = typeof p.raceId === "object" ? p.raceId?.name : "Trận đua";
                const horseName = typeof p.predictedHorseId === "object" ? p.predictedHorseId?.name : "Chiến mã";
                const breedName = typeof p.predictedHorseId === "object" ? p.predictedHorseId?.breed : "";
                const dateString = p.createdAt ? new Date(p.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                }) : "N/A";

                let statusLabel = "Đang chờ chạy";
                if (p.status === "WON") statusLabel = "Đoán Đúng";
                else if (p.status === "LOST") statusLabel = "Đoán Sai";
                else if (p.status === "CANCELLED") statusLabel = "Đã Hủy";

                const isCancelable = (() => {
                  if (p.status !== "PENDING") return false;
                  if (!p.raceId || typeof p.raceId !== "object") return false;
                  const raceStatus = p.raceId.status;
                  if (raceStatus !== "SCHEDULED" && raceStatus !== "CHECKING" && raceStatus !== "READY") return false;
                  
                  const startTime = p.raceId.startTime;
                  if (!startTime) return false;
                  
                  const start = new Date(startTime).getTime();
                  const now = new Date().getTime();
                  const twoHoursInMs = 2 * 60 * 60 * 1000;
                  return (start - now) >= twoHoursInMs;
                })();

                return (
                  <div
                    key={p._id}
                    translate="no"
                    className="group rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-primary/20 transition duration-300 relative overflow-hidden notranslate"
                  >
                    {p.status === "PENDING" && (
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-yellow-400" />
                    )}
                    {p.status === "WON" && (
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-teal-500" />
                    )}
                    {p.status === "CANCELLED" && (
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-muted-foreground/30" />
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono">{dateString}</span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${
                          p.status === "WON"
                            ? "bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400"
                            : p.status === "LOST"
                            ? "bg-primary/10 border border-primary/20 text-primary"
                            : p.status === "PENDING"
                            ? "bg-yellow-500/10 border border-yellow-500/20 text-amber-600 dark:text-yellow-400"
                            : "bg-muted border border-border text-muted-foreground"
                        }`}>
                          {statusLabel}
                        </span>
                      </div>

                      <h4 className="font-black text-foreground text-sm uppercase tracking-tight">{raceName}</h4>
                      <p className="text-[10px] text-muted-foreground">
                        Chiến mã chọn: <strong className="text-foreground">{horseName}</strong> {breedName && `(${breedName})`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-border pt-2 sm:pt-0">
                      <div className="text-right">
                        <span className={`text-xs font-black block ${
                          p.status === "WON" 
                            ? "text-teal-600 dark:text-teal-400" 
                            : p.status === "LOST" 
                            ? "text-primary" 
                            : p.status === "PENDING" 
                            ? "text-amber-600 dark:text-yellow-400" 
                            : "text-muted-foreground"
                        }`}>
                          {p.status === "WON" 
                            ? `+${p.rewardPoints || 1} Điểm` 
                            : p.status === "LOST" 
                            ? `${p.rewardPoints || -1} Điểm` 
                            : p.status === "PENDING" 
                            ? "Chờ kết quả" 
                            : "0 Điểm"}
                        </span>
                        {p.betPoints !== undefined && p.betPoints > 0 && (
                          <span className="text-[9px] text-muted-foreground block font-mono">
                            Cược: {p.betPoints.toLocaleString("vi-VN")} điểm
                          </span>
                        )}
                      </div>

                      {isCancelable && (
                        <Button
                          variant="destructive"
                          onClick={() => handleCancelPrediction(p._id)}
                          disabled={cancelingId === p._id}
                          className="h-8 rounded-xl text-[10px] font-black uppercase tracking-wider bg-primary hover:bg-[#B80500] text-white px-3.5 transition shadow-[0_2px_8px_rgba(225,6,0,0.2)]"
                        >
                          {cancelingId === p._id ? (
                            <Loader2 className="size-3 animate-spin mr-1" />
                          ) : null}
                          Hoàn Cược
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
