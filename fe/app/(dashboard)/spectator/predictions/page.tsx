"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Bell, Trophy, CheckCircle, HelpCircle, Activity, Award, Coins, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { predictionsApi, walletApi, type PredictionItem } from "@/lib/api-client";

export default function SpectatorPredictionsPage() {
  const [balance, setBalance] = useState(0);
  const [myPredictions, setMyPredictions] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const fetchBalance = useCallback(async () => {
    setLoadingBalance(true);
    try {
      const res = await walletApi.myHistory({ limit: 1 });
      setBalance(res.points ?? 0);
    } catch (e: any) {
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
    } catch (e: any) {
      console.error("Lỗi khi tải lịch sử dự đoán:", e);
      toast.error("Không thể tải danh sách lịch sử dự đoán");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBalance();
    void fetchPredictions();
  }, [fetchBalance, fetchPredictions]);

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-white/10 pb-6">
        <PageHeader
          eyebrow="Prediction Station"
          title="Lịch Sử Dự Đoán"
          description="Xem lại lịch sử và kết quả của các lượt dự đoán chiến mã bạn đã thực hiện."
        />

        {/* Real Points Display */}
        <div className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-3 flex items-center gap-4">
          <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Coins className="size-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Điểm thưởng hiện tại</span>
            {loadingBalance ? (
              <Loader2 className="size-4 animate-spin text-white mt-1" />
            ) : (
              <p className="text-xl font-black text-white">{balance.toLocaleString()} Pts</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Side: Summary & Guide */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#16161E] p-6 space-y-5 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
            
            <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Award className="size-5 text-[#E10600]" /> Thể Lệ & Quy Định
            </h3>

            <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
              <div className="space-y-1">
                <p className="font-bold text-white uppercase tracking-wider text-[10px]">1. Đặt Dự Đoán</p>
                <p>Khán giả có thể tham gia dự đoán trực tiếp tại trang chi tiết của mỗi trận đấu trước giờ khởi tranh (khi trận đấu ở trạng thái SCHEDULED, CHECKING, hoặc READY).</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-white uppercase tracking-wider text-[10px]">2. Điểm thưởng & Khấu trừ</p>
                <p>Mỗi dự đoán đúng sẽ giúp bạn nhận ngay <strong className="text-white">+1 Điểm</strong>. Ngược lại, nếu dự đoán sai tài khoản sẽ bị trừ <strong className="text-white">-1 Điểm</strong>.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-white uppercase tracking-wider text-[10px]">3. Quy đổi điểm thưởng</p>
                <p>Tích lũy điểm để tạo yêu cầu quy đổi tại <strong className="text-white">Ví điểm thưởng</strong> và mang mã QR nhận quà trực tiếp tại quầy trường đua.</p>
              </div>
            </div>

            <div className="pt-2">
              <Button asChild className="w-full rounded-xl bg-primary hover:bg-[#B80500] text-white text-xs font-black uppercase tracking-wider py-2.5">
                <Link href="/spectator/tournaments" className="flex items-center justify-center gap-1.5">
                  Đến trang Giải Đấu để dự đoán <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side: List of Predictions */}
        <div className="lg:col-span-8 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Activity className="size-5 text-[#E10600]" /> Các lượt đã dự đoán ({myPredictions.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/55">
              <Loader2 className="size-8 animate-spin text-[#E10600]" />
              <p className="mt-3 text-xs font-mono uppercase tracking-widest">Đang tải lịch sử...</p>
            </div>
          ) : myPredictions.length === 0 ? (
            <div className="text-center py-16 border border-white/5 rounded-2xl bg-[#13131A] text-muted-foreground text-xs shadow-md">
              <Bell className="size-10 text-white/10 mx-auto mb-2" />
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

                return (
                  <div
                    key={p._id}
                    className="group rounded-2xl border border-white/5 bg-[#13131A] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-white/10 transition duration-300 relative overflow-hidden"
                  >
                    {p.status === "PENDING" && (
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-yellow-400" />
                    )}
                    {p.status === "WON" && (
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-teal-500" />
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono">{dateString}</span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${
                          p.status === "WON"
                            ? "bg-teal-500/10 border border-teal-500/20 text-teal-400"
                            : p.status === "LOST"
                            ? "bg-primary/10 border border-primary/20 text-primary"
                            : p.status === "PENDING"
                            ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
                            : "bg-white/5 border border-white/10 text-muted-foreground"
                        }`}>
                          {statusLabel}
                        </span>
                      </div>

                      <h4 className="font-black text-white text-sm uppercase tracking-tight">{raceName}</h4>
                      <p className="text-[10px] text-muted-foreground">
                        Chiến mã chọn: <strong className="text-white">{horseName}</strong> {breedName && `(${breedName})`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                      <span className={`text-xs font-black ${
                        p.status === "WON" 
                          ? "text-teal-400" 
                          : p.status === "LOST" 
                          ? "text-primary" 
                          : p.status === "PENDING" 
                          ? "text-yellow-400" 
                          : "text-muted-foreground"
                      }`}>
                        {p.status === "WON" ? "+1 Điểm" : p.status === "LOST" ? "-1 Điểm" : p.status === "PENDING" ? "Chờ kết quả" : "0 Điểm"}
                      </span>
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
