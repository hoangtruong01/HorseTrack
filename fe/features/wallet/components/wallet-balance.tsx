"use client";

import { CreditCard, DollarSign, RefreshCw, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export type WalletBalanceProps = {
  points: number;
  onRefresh?: () => void;
  onRequestCashout?: () => void;
  role: "Owner" | "Jockey";
};

export function WalletBalance({ points, onRefresh, onRequestCashout, role }: WalletBalanceProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const vndValue = points * 100;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsRefreshing(false);
    toast.success("Wallet balance refreshed successfully!");
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(21,21,30,0.95),rgba(28,28,37,0.95))] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
            Reward Point Wallet
          </p>
          <p className="text-[10px] mt-1 text-muted-foreground uppercase tracking-widest">
            Role: {role}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          className="size-9 rounded-full border border-white/10 text-white/60 hover:text-white hover:bg-white/5"
          disabled={isRefreshing}
          aria-label="Refresh wallet balance"
        >
          <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
        </Button>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Available Rewards Balance
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
              {points.toLocaleString()}
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-primary">
              Points
            </span>
          </div>
        </div>

        <div className="space-y-1 border-t border-white/10 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-emerald-500" /> Estimated Value (1 pt = 100 VND)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-emerald-400 font-mono">
              {vndValue.toLocaleString()}
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-500">
              VND
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {onRequestCashout && (
          <Button
            onClick={onRequestCashout}
            className="h-12 flex-1 rounded-full font-black uppercase tracking-wider text-white shadow-[0_4px_16px_rgba(225,6,0,0.3)] bg-primary hover:bg-[#B80500] hover:shadow-[0_4px_20px_rgba(225,6,0,0.5)] transition"
          >
            <CreditCard className="mr-2 size-4" /> Request Cashout
          </Button>
        )}
        <Button
          variant="outline"
          className="h-12 flex-1 rounded-full border-white/15 text-white bg-white/5 hover:bg-white/10 transition"
          onClick={() => toast.info("Loyalty details loaded. Check Section 7 of topic.md for details.")}
        >
          <DollarSign className="mr-2 size-4" /> Exchange Rules
        </Button>
      </div>

      <div className="mt-4 rounded-xl border border-primary/10 bg-primary/5 p-3">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          <strong className="text-primary font-black uppercase tracking-wide mr-1.5">Note:</strong>
          Any winnings (70% for Owner, 30% for Jockey) are instantly deposited into this wallet upon race results publication. Point redemptions take up to 24 hours to clear bank checks.
        </p>
      </div>
    </div>
  );
}
