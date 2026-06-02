"use client";

import { AlertTriangle, Award, Gift, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export type CashoutRequestFormProps = {
  availablePoints: number;
  onSubmit: (points: number) => void;
  onCancel: () => void;
};

export function CashoutRequestForm({ availablePoints, onSubmit, onCancel }: CashoutRequestFormProps) {
  const [points, setPoints] = useState<number>(Math.min(100, availablePoints));
  const [isLoading, setIsLoading] = useState(false);

  const pointsStr = points === 0 ? "" : points.toString();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (points <= 0) {
      toast.error("Vui lòng nhập số điểm hợp lệ.");
      return;
    }
    if (points > availablePoints) {
      toast.error("Số điểm đổi vượt quá số dư hiện có của bạn.");
      return;
    }
    if (points < 10) {
      toast.error("Số điểm tối thiểu để đổi thưởng là 10 điểm.");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);

    onSubmit(points);
    toast.success(`Yêu cầu đổi thưởng ${points.toLocaleString()} điểm thành công! Hãy lưu lại mã quy đổi.`);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#15151E]/95 p-4 sm:p-6 shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary flex items-center gap-1.5">
          <Gift className="size-4 animate-pulse" /> Phiếu Quy Đổi Thưởng
        </p>
        <h2 className="mt-1 text-2xl font-black uppercase text-white">
          Đổi Điểm Nhận Thưởng
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Quy đổi điểm thưởng tích lũy của bạn thành mã rút thưởng. Mang mã này ra quầy giao dịch vật lý để được nhân viên xác nhận và trao thưởng.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Available Points Display */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Số Dư Điểm Hiện Có
          </span>
          <span className="font-mono text-xl font-black text-emerald-400">
            {availablePoints.toLocaleString('vi-VN')} điểm
          </span>
        </div>

        {/* Amount to Redeem in Points */}
        <div className="space-y-2">
          <label htmlFor="points-input" className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
            Số Điểm Muốn Đổi
          </label>
          <div className="relative">
            <input
              id="points-input"
              type="number"
              min={10}
              max={availablePoints}
              value={pointsStr}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                setPoints(isNaN(val) ? 0 : val);
              }}
              required
              className="h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 font-mono font-black text-white placeholder:text-white/20 outline-none focus:border-primary"
              placeholder="Tối thiểu 10 điểm"
            />
            <button
              type="button"
              onClick={() => setPoints(availablePoints)}
              className="absolute top-1/2 right-4 -translate-y-1/2 rounded bg-primary/20 hover:bg-primary/30 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary cursor-pointer"
            >
              TỐI ĐA
            </button>
          </div>
        </div>

        {/* Informative Box */}
        <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 flex items-center gap-3">
          <Award className="size-8 text-primary shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-white uppercase tracking-wider">Hệ thống đổi thưởng vật lý</p>
            <p className="text-muted-foreground mt-0.5">Một mã quy đổi độc duy nhất sẽ được tạo. Điểm chỉ bị trừ khỏi ví của bạn khi nhân viên tại quầy kiểm tra và xác nhận trao thưởng thành công.</p>
          </div>
        </div>

        {/* Disclaimers & Checks */}
        <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 space-y-2">
          <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <AlertTriangle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>Lưu ý: Không đổi điểm quá số điểm hiện có của bạn tại thời điểm nhận quà tại quầy.</span>
          </p>
          <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <ShieldCheck className="size-3.5 text-primary shrink-0 mt-0.5" />
            <span>Giao dịch đổi thưởng được kiểm toán bảo mật và ghi lại trong hệ thống Ledger.</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pt-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-12 flex-1 rounded-full font-black uppercase tracking-wider border-white/10 text-white bg-transparent hover:bg-white/5"
          >
            Hủy Bỏ
          </Button>
          <Button
            type="submit"
            disabled={isLoading || points <= 0 || points > availablePoints}
            className="h-12 flex-1 rounded-full font-black uppercase tracking-wider text-white bg-primary hover:bg-[#B80500] shadow-[0_4px_16px_rgba(225,6,0,0.35)]"
          >
            {isLoading ? "Đang xử lý..." : "Tạo Mã Nhận Thưởng"}
          </Button>
        </div>
      </form>
    </div>
  );
}
