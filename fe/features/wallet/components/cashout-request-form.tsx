"use client";

import { AlertTriangle, Award, Gift, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/** Các mốc điểm cố định được phép quy đổi (khớp với backend). */
const REDEMPTION_TIERS = [5000, 10000, 20000, 50000, 100000];

export type CashoutRequestFormProps = {
  availablePoints: number;
  onSubmit: (points: number) => void | Promise<void>;
  onCancel: () => void;
};

export function CashoutRequestForm({
  availablePoints,
  onSubmit,
  onCancel,
}: CashoutRequestFormProps) {
  const { t } = useTranslation();
  const [points, setPoints] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (points === null) {
      toast.error(t("wallet.cashoutForm.errInvalid"));
      return;
    }
    if (points > availablePoints) {
      toast.error(t("wallet.cashoutForm.errExceed"));
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
    <div className="rounded-2xl border border-border bg-card p-3 shadow-lg sm:p-6">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.24em] text-primary">
          <Gift className="size-4" /> {t("wallet.cashoutForm.eyebrow")}
        </p>
        <h2 className="mt-1 text-2xl font-black uppercase text-foreground">
          {t("wallet.cashoutForm.title")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("wallet.cashoutForm.desc")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="flex items-center justify-between rounded-xl border border-border/5 bg-muted/[0.02] p-4">
          <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            {t("wallet.cashoutForm.balanceLabel")}
          </span>
          <span className="font-mono text-xl font-black text-emerald-400">
            {availablePoints.toLocaleString("vi-VN")}{" "}
            {t("wallet.cashoutForm.pointsSuffix")}
          </span>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
            {t("wallet.cashoutForm.amountLabel")}
          </label>
          <div className="flex flex-col gap-2">
            {REDEMPTION_TIERS.map((tier) => {
              const disabled = tier > availablePoints;
              const active = points === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  disabled={disabled}
                  onClick={() => setPoints(tier)}
                  className={`h-14 w-full rounded-xl border font-mono font-black transition ${
                    disabled
                      ? "cursor-not-allowed border-border bg-muted/[0.02] text-muted-foreground/40"
                      : active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted text-foreground hover:border-primary"
                  }`}
                >
                  {tier.toLocaleString("vi-VN")}
                  <span className="ml-1 text-[10px] font-bold uppercase tracking-wider">
                    {t("wallet.cashoutForm.pointsSuffix")}
                  </span>
                </button>
              );
            })}
          </div>
          {availablePoints < REDEMPTION_TIERS[0] && (
            <p className="text-[11px] font-bold text-amber-500">
              Số dư chưa đủ mốc tối thiểu ({REDEMPTION_TIERS[0].toLocaleString("vi-VN")} điểm).
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4">
          <Award className="size-8 shrink-0 text-primary" />
          <div className="text-xs">
            <p className="font-bold uppercase tracking-wider text-foreground">
              {t("wallet.cashoutForm.infoTitle")}
            </p>
            <p className="mt-0.5 text-muted-foreground">
              {t("wallet.cashoutForm.infoDesc")}
            </p>
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

        <div className="grid grid-cols-2 gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-12 w-full rounded-full border-border/10 bg-transparent font-black uppercase tracking-wider text-foreground hover:bg-muted/5"
          >
            {t("wallet.cashoutForm.btnCancel")}
          </Button>
          <Button
            type="submit"
            disabled={isLoading || points === null || points > availablePoints}
            className="h-12 w-full rounded-full bg-primary font-black uppercase tracking-wider text-foreground shadow-[0_4px_16px_rgba(225,6,0,0.35)] hover:bg-[#B80500]"
          >
            {isLoading
              ? t("wallet.cashoutForm.btnProcessing")
              : t("wallet.cashoutForm.btnSubmit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
