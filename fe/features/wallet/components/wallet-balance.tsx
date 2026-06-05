"use client";

import { Award, Gift, RefreshCw, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export type WalletBalanceProps = {
  points: number;
  onRefresh?: () => void;
  onRequestCashout?: () => void;
  role: "Owner" | "Jockey" | "Spectator" | "Referee";
};

export function WalletBalance({ points, onRefresh, onRequestCashout, role }: WalletBalanceProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsRefreshing(false);
    toast.success("Đã làm mới số dư điểm thưởng!");
  };

  const getRoleLabel = () => {
    switch (role) {
      case "Owner":
        return "Chủ ngựa (Owner)";
      case "Jockey":
        return "Nài ngựa (Jockey)";
      case "Spectator":
        return "Khán giả (Spectator)";
      case "Referee":
        return "Trọng tài (Referee)";
      default:
        return role;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[0_24px_64px_rgba(0,0,0,0.48)] sm:p-6">
      {/* Decorative radial gradients */}
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

      {/* Wallet Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
            Ví Điểm Thưởng Free
          </p>
          <p className="text-[10px] mt-1 text-muted-foreground uppercase tracking-widest font-bold">
            Vai trò: {getRoleLabel()}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          className="size-9 rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          disabled={isRefreshing}
          aria-label="Làm mới số dư"
        >
          <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
        </Button>
      </div>

      {/* Stacked Balance Cards to prevent overflow */}
      <div className="mt-5 space-y-4">
        {/* Available Points card */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-muted/[0.02] p-5">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Star className="size-3.5 text-primary fill-primary animate-pulse" /> Điểm thưởng khả dụng hiện tại
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground font-mono">
              {points.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-primary">
              Điểm
            </span>
          </div>
        </div>
      </div>

      {/* Buttons Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {onRequestCashout && (
          <Button
            onClick={onRequestCashout}
            disabled={points <= 0}
            className="h-12 flex-1 rounded-full text-xs font-black uppercase tracking-wider text-foreground shadow-[0_4px_16px_rgba(225,6,0,0.3)] bg-primary hover:bg-[#B80500] hover:shadow-[0_4px_20px_rgba(225,6,0,0.5)] transition disabled:opacity-50"
          >
            <Gift className="mr-1.5 size-3.5 shrink-0" /> Đổi thưởng
          </Button>
        )}
        <Button
          variant="outline"
          className="h-12 flex-1 rounded-full text-xs font-black uppercase tracking-wider border-border text-foreground bg-muted hover:bg-muted/60 transition"
          onClick={() =>
            toast.info(
              "Tích lũy điểm để nhận mã quà tặng. Đưa mã cho nhân viên quầy kiểm tra và trao quà vật lý tương ứng!"
            )
          }
        >
          <Award className="mr-1.5 size-3.5 shrink-0" /> Thể lệ đổi
        </Button>
      </div>

      {/* Notice Card */}
      <div className="mt-4 rounded-xl border border-primary/10 bg-primary/5 p-3.5">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          <strong className="text-primary font-black uppercase tracking-wide mr-1.5">Lưu ý:</strong>
          {role === "Spectator"
            ? "Khán giả tham gia dự đoán cuộc đua miễn phí: dự đoán đúng được +1 điểm, dự đoán sai bị trừ 1 điểm (nếu số dư lớn hơn 0). Tích lũy điểm thưởng để đổi các phần quà giá trị tại quầy."
            : role === "Referee"
            ? "Trọng tài nhận lương điểm thưởng trực tiếp cho mỗi vòng đua được phân công giám sát sau khi hoàn thành nhiệm vụ. Thực hiện đổi thưởng điểm thưởng trực tiếp tại quầy."
            : "Chủ ngựa (nhận 70% chia sẻ) và Nài ngựa (nhận 30% chia sẻ) nhận điểm thưởng tự động sau khi kết quả đua được công bố chính thức. Đổi thưởng được thực hiện trực tiếp thông qua mã xác nhận."}
        </p>
      </div>
    </div>
  );
}
