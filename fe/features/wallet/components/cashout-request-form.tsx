"use client";

import { AlertTriangle, Award, Gift, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

export type CashoutRequestFormProps = {
  availablePoints: number;
  onSubmit: (points: number) => void | Promise<void>;
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
    try {
      await onSubmit(points);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-lg sm:p-6">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.24em] text-primary">
          <Gift className="size-4" /> {t("wallet.cashoutForm.eyebrow")}
        </p>
        <h2 className="mt-1 text-2xl font-black uppercase text-foreground">{t("wallet.cashoutForm.title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("wallet.cashoutForm.desc")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="flex items-center justify-between rounded-xl border border-border/5 bg-muted/[0.02] p-4">
          <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t("wallet.cashoutForm.balanceLabel")}</span>
          <span className="font-mono text-xl font-black text-emerald-400">{availablePoints.toLocaleString("vi-VN")} {t("wallet.cashoutForm.pointsSuffix")}</span>
        </div>

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
                const val = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                setPoints(Number.isNaN(val) ? 0 : val);
              }}
              required
              className="h-12 w-full rounded-xl border border-border bg-muted px-4 font-mono font-black text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              placeholder={t("wallet.cashoutForm.inputPlaceholder")}
            />
            <button
              type="button"
              onClick={() => setPoints(availablePoints)}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded bg-primary/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary/30"
            >
              {t("wallet.cashoutForm.btnMax")}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4">
          <Award className="size-8 shrink-0 text-primary" />
          <div className="text-xs">
            <p className="font-bold uppercase tracking-wider text-foreground">{t("wallet.cashoutForm.infoTitle")}</p>
            <p className="mt-0.5 text-muted-foreground">{t("wallet.cashoutForm.infoDesc")}</p>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-border/5 bg-muted/[0.01] p-3">
          <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
            <span>{t("wallet.cashoutForm.warningOver")}</span>
          </p>
          <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <span>{t("wallet.cashoutForm.warningAudit")}</span>
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-12 flex-1 rounded-full border-border/10 bg-transparent font-black uppercase tracking-wider text-foreground hover:bg-muted/5"
          >
            {t("wallet.cashoutForm.btnCancel")}
          </Button>
          <Button
            type="submit"
            disabled={isLoading || points <= 0 || points > availablePoints}
            className="h-12 flex-1 rounded-full bg-primary font-black uppercase tracking-wider text-foreground shadow-[0_4px_16px_rgba(225,6,0,0.35)] hover:bg-[#B80500]"
          >
            {isLoading ? t("wallet.cashoutForm.btnProcessing") : t("wallet.cashoutForm.btnSubmit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
