"use client";

import { ArrowDownLeft, ArrowUpRight, Award, Coins, Copy, Search, Sparkles } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type { WalletUiTransaction } from "../backend-wallet";

export type TransactionHistoryProps = {
  transactions: WalletUiTransaction[];
  role?: "owner" | "jockey" | "referee" | "spectator" | "admin" | "counter_staff";
};

export function TransactionHistory({ transactions, role }: TransactionHistoryProps) {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return transactions.filter((tx) => {
      const matchesSearch = tx.description.toLowerCase().includes(query) || tx.type.toLowerCase().includes(query);
      if (filterType === "all") return matchesSearch;
      if (filterType === "prizes") return matchesSearch && (tx.type === "prize_owner" || tx.type === "prize_jockey");
      if (filterType === "cashouts") return matchesSearch && tx.type.startsWith("withdrawal_");
      if (filterType === "predictions") return matchesSearch && (tx.type === "prediction_win" || tx.type === "prediction_refund");
      if (filterType === "salary") return matchesSearch && tx.type === "salary_bonus";
      return matchesSearch;
    });
  }, [transactions, filterType, searchTerm]);

  const typeMeta: Record<
    WalletUiTransaction["type"],
    { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
  > = {
    deposit: { icon: ArrowDownLeft, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: t("wallet.transactions.types.deposit") },
    withdrawal_requested: { icon: ArrowUpRight, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: t("wallet.transactions.types.withdrawalRequested") },
    withdrawal_approved: { icon: ArrowUpRight, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", label: t("wallet.transactions.types.withdrawalApproved") },
    withdrawal_paid: { icon: ArrowUpRight, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: t("wallet.transactions.types.withdrawalPaid") },
    withdrawal_rejected: { icon: ArrowUpRight, color: "text-red-400 bg-red-500/10 border-red-500/20", label: t("wallet.transactions.types.withdrawalRejected") },
    withdrawal_refund: { icon: ArrowDownLeft, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: t("wallet.transactions.types.predictionRefund") },
    prize_owner: { icon: Award, color: "text-primary bg-primary/10 border-primary/20", label: t("wallet.transactions.types.prizeOwner") },
    prize_jockey: { icon: Award, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", label: t("wallet.transactions.types.prizeJockey") },
    prediction_win: { icon: Sparkles, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", label: t("wallet.transactions.types.predictionWin") },
    prediction_refund: { icon: Coins, color: "text-sky-400 bg-sky-500/10 border-sky-500/20", label: t("wallet.transactions.types.predictionRefund") },
    salary_bonus: { icon: Award, color: "text-violet-400 bg-violet-500/10 border-violet-500/20", label: t("wallet.transactions.types.generic") },
  };

  const filterOptions = useMemo(() => {
    const options = [{ id: "all", label: t("wallet.transactions.filters.all") }];
    
    if (role !== "referee" && role !== "spectator") {
      options.push({ id: "prizes", label: t("wallet.transactions.filters.prizes") });
    }
    
    if (role !== "owner" && role !== "jockey" && role !== "referee") {
      options.push({ id: "predictions", label: t("wallet.transactions.filters.predictions") });
    }

    if (role === "referee" || role === "admin") {
      options.push({ id: "salary", label: t("wallet.transactions.filters.salary") || "Lương thưởng" });
    }

    options.push({ id: "cashouts", label: t("wallet.transactions.filters.cashouts") });
    
    return options;
  }, [role, t]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[0_24px_64px_rgba(0,0,0,0.48)] sm:p-6">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#E10600]/30 to-transparent" />

      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.24em] text-primary">
            <Coins className="size-3.5 animate-pulse" /> {t("wallet.transactions.eyebrow")}
          </p>
          <h2 className="mt-1.5 text-xl font-black uppercase tracking-tight text-foreground sm:text-2xl">
            {t("wallet.transactions.title")}
          </h2>
        </div>

        <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-muted/50 p-1.5">
          {filterOptions.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition cursor-pointer outline-none sm:text-xs",
                filterType === item.id
                  ? "bg-primary text-foreground shadow-[0_2px_8px_rgba(225,6,0,0.25)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-5">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
        <input
          type="text"
          placeholder={t("wallet.transactions.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-12 w-full rounded-xl border border-border bg-muted/50 pl-11 pr-6 text-sm text-foreground outline-none placeholder:text-muted-foreground transition focus:border-primary"
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-muted/30">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Coins className="size-10 text-muted-foreground/30" />
            <p className="mt-4 text-xs font-black uppercase tracking-wider text-muted-foreground/60">
              {t("wallet.transactions.emptyTitle")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("wallet.transactions.emptyHint")}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            <table className="w-full table-auto border-collapse text-left text-xs">
              <thead className="border-b border-border bg-muted/[0.03] text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-3">{t("wallet.transactions.colType")}</th>
                  <th className="px-3 py-3 hidden sm:table-cell w-[90px]">{t("wallet.transactions.colTime")}</th>
                  <th className="px-3 py-3 text-center w-[120px]">{t("wallet.redemption.colStatus") || "Trạng thái"}</th>
                  <th className="px-3 py-3 text-right w-[100px]">{t("wallet.transactions.colPoints")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((tx) => {
                  const meta = typeMeta[tx.type] || { icon: Coins, color: "text-muted-foreground bg-muted border-border", label: t("wallet.transactions.types.generic") };
                  const Icon = meta.icon;
                  const isPositive = ["deposit", "prize_owner", "prize_jockey", "prediction_win", "prediction_refund", "salary_bonus", "withdrawal_refund"].includes(tx.type);
                  const codeMatch = tx.description.match(/(RWD-[A-Z0-9]+)/);
                  const code = codeMatch ? codeMatch[1] : null;

                  // Ánh xạ trạng thái thực tế dựa trên loại giao dịch rút tiền
                  let displayStatus: "pending" | "completed" | "failed" = "completed";
                  if (tx.type === "withdrawal_requested") {
                    displayStatus = "pending";
                  } else if (tx.type === "withdrawal_rejected") {
                    displayStatus = "failed";
                  }

                  return (
                    <React.Fragment key={tx.id}>
                      <tr 
                        className="cursor-pointer transition hover:bg-muted/[0.015]"
                        onClick={() => setExpandedId(expandedId === tx.id ? null : tx.id)}
                      >
                        {/* 1. Loại */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg border", meta.color)}>
                              <Icon className="size-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black uppercase tracking-wider text-foreground sm:text-xs">
                                {meta.label}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 2. Thời gian (Desktop only) */}
                        <td className="px-3 py-3 hidden sm:table-cell whitespace-nowrap font-mono text-[10px] text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString("vi-VN")}
                        </td>

                        {/* 3. Trạng thái */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <StatusBadge
                            label={
                              displayStatus === "completed"
                                ? t("wallet.transactions.statusCompleted")
                                : displayStatus === "pending"
                                ? t("wallet.transactions.statusPending")
                                : t("wallet.transactions.statusFailed")
                            }
                            tone={
                              displayStatus === "completed"
                                ? "green"
                                : displayStatus === "pending"
                                ? "yellow"
                                : "red"
                            }
                            className="w-full justify-center text-[9px] px-1 py-0.5 tracking-[0.02em]"
                          />
                        </td>

                        {/* 4. Điểm biến động */}
                        <td className="px-3 py-3 text-right whitespace-nowrap font-mono text-xs font-black sm:text-sm">
                          <span className={isPositive ? "text-emerald-400" : "text-primary"}>
                            {isPositive ? "+" : "-"}{tx.amount.toLocaleString("vi-VN")}
                          </span>
                        </td>
                      </tr>

                      {/* Chi tiết (hiện khi click) */}
                      {expandedId === tx.id && (
                        <tr>
                          <td colSpan={4} className="bg-muted/[0.02] p-0">
                            <div className="border-t border-border/50 px-4 py-3 sm:px-6">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Mô tả giao dịch</p>
                                  <p className="text-[11px] leading-relaxed text-foreground/80">{tx.description}</p>
                                </div>
                                <div className="flex flex-col gap-3 sm:items-end">
                                  {code && (
                                    <div className="space-y-1 sm:text-right">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Mã quy đổi</p>
                                      <div className="inline-flex items-center gap-1.5 rounded bg-muted/50 px-2 py-1 font-mono text-xs font-bold border border-border">
                                        <span className="text-primary">{code}</span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(code);
                                            toast.success(`Đã sao chép mã: ${code}`);
                                          }}
                                          className="cursor-pointer rounded p-0.5 text-muted-foreground transition hover:bg-muted-foreground/20"
                                        >
                                          <Copy className="size-3" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  <div className="space-y-1 sm:text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Thời gian tạo</p>
                                    <p className="font-mono text-[11px] text-muted-foreground">
                                      {new Date(tx.createdAt).toLocaleString("vi-VN")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
