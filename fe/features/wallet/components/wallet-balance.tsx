"use client";

import { Award, Gift, RefreshCw, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

export type WalletBalanceProps = {
  points: number;
  onRefresh?: () => void;
  onRequestCashout?: () => void;
  role: "Owner" | "Jockey" | "Spectator" | "Referee";
};

export function WalletBalance({ points, onRefresh, onRequestCashout, role }: WalletBalanceProps) {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh?.();
    setIsRefreshing(false);
    toast.success(t("wallet.balance.refreshSuccess"));
  };

  const roleLabel = t(`roles.${role.toLowerCase()}`);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[0_24px_64px_rgba(0,0,0,0.48)] sm:p-6">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">{t("wallet.balance.title")}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("wallet.balance.role", { role: roleLabel })}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          className="size-9 rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          disabled={isRefreshing}
          aria-label={t("wallet.balance.refreshAria")}
        >
          <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
        </Button>
      </div>

      <div className="mt-5 space-y-4">
        <div className="relative overflow-hidden rounded-xl border border-border bg-muted/[0.02] p-5">
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            <Star className="size-3.5 fill-primary text-primary" /> {t("wallet.balance.availableLabel")}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              {points.toLocaleString("vi-VN")}
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-primary">{t("wallet.balance.pointsUnit")}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {onRequestCashout && (
          <Button
            onClick={onRequestCashout}
            disabled={points <= 0}
            className="h-12 flex-1 rounded-full bg-primary text-xs font-black uppercase tracking-wider text-foreground shadow-[0_4px_16px_rgba(225,6,0,0.3)] transition hover:bg-[#B80500] disabled:opacity-50"
          >
            <Gift className="mr-1.5 size-3.5 shrink-0" /> {t("wallet.balance.redeem")}
          </Button>
        )}
        <Button
          variant="outline"
          className="h-12 flex-1 rounded-full border-border bg-muted text-xs font-black uppercase tracking-wider text-foreground transition hover:bg-muted/60"
          onClick={() => toast.info(t("wallet.balance.rulesToast"))}
        >
          <Award className="mr-1.5 size-3.5 shrink-0" /> {t("wallet.balance.rules")}
        </Button>
      </div>

      <div className="mt-4 rounded-xl border border-primary/10 bg-primary/5 p-3.5">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          <strong className="mr-1.5 font-black uppercase tracking-wide text-primary">{t("wallet.balance.noteLabel")}</strong>
          {t(`wallet.balance.note.${role.toLowerCase()}`)}
        </p>
      </div>
    </div>
  );
}
