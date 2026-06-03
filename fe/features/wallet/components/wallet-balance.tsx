"use client";

import { Award, Gift, RefreshCw, Star } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatRoleLabel } from "@/lib/role-i18n";

export type WalletBalanceProps = {
  points: number;
  onRefresh?: () => void;
  onRequestCashout?: () => void;
  role: "Owner" | "Jockey" | "Spectator";
};

export function WalletBalance({ points, onRefresh, onRequestCashout, role }: WalletBalanceProps) {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const roleKey =
    role === "Owner" ? "owner" : role === "Jockey" ? "jockey" : "spectator";

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsRefreshing(false);
    toast.success(t("wallet.balance.refreshSuccess"));
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border dark:border-white/10 border-border dark:bg-[linear-gradient(135deg,rgba(21,21,30,0.95),rgba(28,28,37,0.95))] bg-card p-5 shadow-[0_24px_64px_rgba(0,0,0,0.48)] sm:p-6">
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="flex items-center justify-between border-b dark:border-white/5 border-border pb-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
            {t("wallet.balance.title")}
          </p>
          <p className="text-[10px] mt-1 text-muted-foreground uppercase tracking-widest font-bold">
            {t("wallet.balance.role", { role: formatRoleLabel(t, roleKey) })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          className="size-9 rounded-full border dark:border-white/10 border-border dark:text-white/60 text-muted-foreground hover:dark:text-white text-foreground hover:dark:bg-white/5 bg-muted/50"
          disabled={isRefreshing}
          aria-label={t("wallet.balance.refreshAria")}
        >
          <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
        </Button>
      </div>

      <div className="mt-5 space-y-4">
        <div className="relative overflow-hidden rounded-xl border dark:border-white/5 border-border dark:bg-white/[0.02] bg-muted/50 p-5">
          <span className="text-[10px] font-black uppercase tracking-wider dark:text-white/50 text-muted-foreground flex items-center gap-1.5">
            <Star className="size-3.5 text-primary fill-primary animate-pulse" />{" "}
            {t("wallet.balance.availableLabel")}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black tracking-tight dark:text-white text-foreground font-mono">
              {points.toLocaleString()}
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-primary">
              {t("wallet.balance.pointsUnit")}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {onRequestCashout && (
          <Button
            onClick={onRequestCashout}
            disabled={points <= 0}
            className="h-12 flex-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(225,6,0,0.3)] bg-primary hover:bg-[#B80500] hover:shadow-[0_4px_20px_rgba(225,6,0,0.5)] transition disabled:opacity-50"
          >
            <Gift className="mr-1.5 size-3.5 shrink-0" /> {t("wallet.balance.redeem")}
          </Button>
        )}
        <Button
          variant="outline"
          className="h-12 flex-1 rounded-full text-xs font-black uppercase tracking-wider dark:border-white/10 border-border dark:text-white text-foreground dark:bg-white/5 bg-muted/50 hover:dark:bg-white/10 hover:bg-muted/80 transition"
          onClick={() => toast.info(t("wallet.balance.rulesToast"))}
        >
          <Award className="mr-1.5 size-3.5 shrink-0" /> {t("wallet.balance.rules")}
        </Button>
      </div>

      <div className="mt-4 rounded-xl border border-primary/10 bg-primary/5 p-3.5">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          <strong className="text-primary font-black uppercase tracking-wide mr-1.5">
            {t("wallet.balance.noteLabel")}
          </strong>
          {t(`wallet.balance.note.${roleKey}`)}
        </p>
      </div>
    </div>
  );
}
