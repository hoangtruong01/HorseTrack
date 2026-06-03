"use client";

import { AlertTriangle, Award, Gift, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export type CashoutRequestFormProps = {
  availablePoints: number;
  onSubmit: (points: number) => void;
  onCancel: () => void;
};

export function CashoutRequestForm({ availablePoints, onSubmit, onCancel }: CashoutRequestFormProps) {
  const { t } = useTranslation();
  const [points, setPoints] = useState<number>(Math.min(100, availablePoints));
  const [isLoading, setIsLoading] = useState(false);

  const pointsStr = points === 0 ? "" : points.toString();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (points <= 0) {
      toast.error(t("wallet.cashoutForm.errInvalid"));
      return;
    }
    if (points > availablePoints) {
      toast.error(t("wallet.cashoutForm.errExceed"));
      return;
    }
    if (points < 10) {
      toast.error(t("wallet.cashoutForm.errMin"));
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);

    onSubmit(points);
    toast.success(t("wallet.cashoutForm.successMsg", { points: points.toLocaleString("vi-VN") }));
  };

  return (
    <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/95 bg-card p-4 sm:p-6 shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-primary flex items-center gap-1.5">
          <Gift className="size-4 animate-pulse" /> {t("wallet.cashoutForm.eyebrow")}
        </p>
        <h2 className="mt-1 text-2xl font-black uppercase dark:text-white text-foreground">
          {t("wallet.cashoutForm.title")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("wallet.cashoutForm.desc")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Available Points Display */}
        <div className="rounded-xl border dark:border-white/5 border-border dark:bg-white/[0.02] bg-muted/50 p-4 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            {t("wallet.cashoutForm.balanceLabel")}
          </span>
          <span className="font-mono text-xl font-black text-emerald-400">
            {availablePoints.toLocaleString('vi-VN')} {t("wallet.cashoutForm.pointsSuffix")}
          </span>
        </div>

        {/* Amount to Redeem in Points */}
        <div className="space-y-2">
          <label htmlFor="points-input" className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
            {t("wallet.cashoutForm.amountLabel")}
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
              className="h-12 w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/35 bg-muted/20 px-4 font-mono font-black dark:text-white text-foreground placeholder:dark:text-white/20 text-muted-foreground outline-none focus:border-primary"
              placeholder={t("wallet.cashoutForm.inputPlaceholder")}
            />
            <button
              type="button"
              onClick={() => setPoints(availablePoints)}
              className="absolute top-1/2 right-4 -translate-y-1/2 rounded bg-primary/20 hover:bg-primary/30 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary cursor-pointer"
            >
              {t("wallet.cashoutForm.btnMax")}
            </button>
          </div>
        </div>

        {/* Informative Box */}
        <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 flex items-center gap-3">
          <Award className="size-8 text-primary shrink-0" />
          <div className="text-xs">
            <p className="font-bold dark:text-white text-foreground uppercase tracking-wider">
              {t("wallet.cashoutForm.infoTitle")}
            </p>
            <p className="text-muted-foreground mt-0.5">
              {t("wallet.cashoutForm.infoDesc")}
            </p>
          </div>
        </div>

        {/* Disclaimers & Checks */}
        <div className="rounded-xl border dark:border-white/5 border-border dark:bg-white/[0.01] bg-muted/50 p-3 space-y-2">
          <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <AlertTriangle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>{t("wallet.cashoutForm.warningOver")}</span>
          </p>
          <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
            <ShieldCheck className="size-3.5 text-primary shrink-0 mt-0.5" />
            <span>{t("wallet.cashoutForm.warningAudit")}</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pt-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-12 flex-1 rounded-full font-black uppercase tracking-wider dark:border-white/10 border-border dark:text-white text-foreground bg-transparent hover:dark:bg-white/5 bg-muted/50"
          >
            {t("wallet.cashoutForm.btnCancel")}
          </Button>
          <Button
            type="submit"
            disabled={isLoading || points <= 0 || points > availablePoints}
            className="h-12 flex-1 rounded-full font-black uppercase tracking-wider text-white bg-primary hover:bg-[#B80500] shadow-[0_4px_16px_rgba(225,6,0,0.35)]"
          >
            {isLoading ? t("wallet.cashoutForm.btnProcessing") : t("wallet.cashoutForm.btnSubmit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
