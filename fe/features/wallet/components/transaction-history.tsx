"use client";

import { Calendar, Search, Gift, Download, Award, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import type { WalletTransaction } from "../mock-wallet";

export type TransactionHistoryProps = {
  transactions: WalletTransaction[];
};

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.type.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterType === "all") return matchesSearch;
      if (filterType === "points")
        return matchesSearch && (tx.type.includes("prize") || tx.type.includes("prediction"));
      if (filterType === "cashouts")
        return matchesSearch && tx.type.includes("withdrawal");
      return matchesSearch;
    });
  }, [transactions, filterType, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const typeMeta: Record<
    WalletTransaction["type"],
    { icon: React.ComponentType<{ className?: string }>; color: string; labelKey: string; subLabelKey: string; isPositive: boolean }
  > = {
    deposit: { icon: Gift, color: "text-emerald-500 bg-emerald-500/10", labelKey: "typeReceived", subLabelKey: "subDeposit", isPositive: true },
    withdrawal_requested: { icon: Download, color: "text-[#E10600] bg-[#E10600]/10", labelKey: "typeCashout", subLabelKey: "subWithdrawReq", isPositive: false },
    withdrawal_approved: { icon: Download, color: "text-[#E10600] bg-[#E10600]/10", labelKey: "typeCashout", subLabelKey: "subWithdrawApp", isPositive: false },
    withdrawal_paid: { icon: Download, color: "text-[#E10600] bg-[#E10600]/10", labelKey: "typeCashout", subLabelKey: "subWithdrawPaid", isPositive: false },
    withdrawal_rejected: { icon: Download, color: "text-[#E10600] bg-[#E10600]/10", labelKey: "typeCashout", subLabelKey: "subWithdrawRej", isPositive: false },
    prize_owner: { icon: Gift, color: "text-emerald-500 bg-emerald-500/10", labelKey: "typeReceived", subLabelKey: "subOwnerReward", isPositive: true },
    prize_jockey: { icon: Gift, color: "text-emerald-500 bg-emerald-500/10", labelKey: "typeReceived", subLabelKey: "subJockeyReward", isPositive: true },
    prediction_win: { icon: Gift, color: "text-emerald-500 bg-emerald-500/10", labelKey: "typeReceived", subLabelKey: "subPredictWin", isPositive: true },
    prediction_refund: { icon: Award, color: "text-purple-400 bg-purple-500/10", labelKey: "typeEvent", subLabelKey: "subRefundEvent", isPositive: true },
  };

  const filters = [
    { id: "all", labelKey: "tabAll" },
    { id: "points", labelKey: "tabPoints" },
    { id: "cashouts", labelKey: "tabCashouts" },
  ] as const;

  return (
    <div className="overflow-hidden rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E] bg-card p-0 shadow-[0_24px_64px_rgba(0,0,0,0.1)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.48)]">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b dark:border-white/5 border-border p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg dark:bg-white/5 bg-muted p-2 dark:text-white/70 text-muted-foreground border dark:border-white/10 border-border">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
          </div>
          <h2 className="text-base font-black uppercase tracking-wider dark:text-white text-foreground">
            {t("wallet.txHistory.title")}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex dark:bg-[#1E1E26] bg-muted/50 rounded-lg p-1 border dark:border-white/5 border-border">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setFilterType(f.id);
                  setCurrentPage(1);
                }}
                className={cn(
                  "rounded-md px-4 py-2 text-xs font-bold uppercase transition",
                  filterType === f.id
                    ? "bg-[#E10600] text-white"
                    : "dark:text-white/50 text-muted-foreground hover:dark:text-white/80 hover:text-foreground"
                )}
              >
                {t(`wallet.txHistory.${f.labelKey}`)}
              </button>
            ))}
          </div>
          <button className="flex items-center justify-center p-2 rounded-lg dark:bg-[#1E1E26] bg-muted/50 border dark:border-white/5 border-border dark:text-white/50 text-muted-foreground hover:dark:text-white hover:text-foreground transition">
            <Calendar className="size-5" />
          </button>
        </div>
      </div>

      {/* Search section */}
      <div className="border-b dark:border-white/5 border-border">
        <div className="relative">
          <input
            type="text"
            placeholder={t("wallet.txHistory.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[52px] w-full bg-transparent pl-5 pr-12 text-sm dark:text-white text-foreground outline-none placeholder:dark:text-white/20 placeholder:text-muted-foreground/60 transition"
          />
          <Search className="absolute top-1/2 right-5 size-4 -translate-y-1/2 dark:text-white/30 text-muted-foreground" />
        </div>
      </div>

      {/* Table section */}
      <div className="w-full overflow-x-auto select-none">
        <table className="w-full text-left text-sm border-collapse min-w-[700px]">
          <thead className="dark:bg-transparent bg-muted/20 text-[11px] font-black uppercase text-muted-foreground dark:text-white/40 border-b dark:border-white/5 border-border">
            <tr>
              <th className="px-5 py-4 w-1/4">{t("wallet.txHistory.colType")}</th>
              <th className="px-5 py-4 w-1/3">{t("wallet.txHistory.colDetails")}</th>
              <th className="px-5 py-4 w-1/6">{t("wallet.txHistory.colTime")}</th>
              <th className="px-5 py-4 w-1/6">{t("wallet.txHistory.colPoints")}</th>
              <th className="px-5 py-4 w-1/6 text-right">{t("wallet.txHistory.colValue")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 divide-border/50">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm dark:text-white/40 text-muted-foreground">
                  {t("wallet.txHistory.empty")}
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx) => {
                const meta = typeMeta[tx.type] ?? {
                  icon: Gift,
                  color: "text-emerald-500 bg-emerald-500/10",
                  labelKey: "typeReceived",
                  subLabelKey: "subDeposit",
                  isPositive: true,
                };
                const Icon = meta.icon;
                
                const d = new Date(tx.createdAt);
                const dateStr = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
                const timeStr = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                
                const pointsStr = (meta.isPositive ? "+" : "-") + tx.amount.toLocaleString("vi-VN");
                const vndStr = (meta.isPositive ? "+" : "-") + (tx.amount * 10).toLocaleString("vi-VN") + " VNĐ";

                return (
                  <tr key={tx.id} className="transition hover:dark:bg-white/[0.02] hover:bg-muted/50 group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", meta.color)}>
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <p className="font-bold dark:text-white/90 text-foreground text-[13px]">
                            {t(`wallet.txHistory.${meta.labelKey}`)}
                          </p>
                          <p className="text-xs dark:text-white/40 text-muted-foreground mt-0.5">
                            {t(`wallet.txHistory.${meta.subLabelKey}`)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="dark:text-white/70 text-foreground text-[13px] leading-relaxed max-w-[280px]">
                        {tx.description}
                      </p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="dark:text-white/70 text-foreground text-[13px]">
                        {dateStr}
                      </p>
                      <p className="text-[13px] dark:text-white/40 text-muted-foreground mt-0.5">
                        {timeStr}
                      </p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={cn("font-bold text-[14px]", meta.isPositive ? "text-emerald-600 dark:text-emerald-500" : "text-[#E10600]")}>
                        {pointsStr}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <span className={cn("font-bold text-[14px]", meta.isPositive ? "text-emerald-600 dark:text-emerald-500" : "text-[#E10600]")}>
                        {vndStr}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination section */}
      <div className="flex items-center justify-between border-t dark:border-white/5 border-border p-4 dark:bg-[#111116] bg-muted/20 rounded-b-2xl">
        <div className="text-[13px] dark:text-white/40 text-muted-foreground">
          {t("wallet.txHistory.showing", {
            start: (currentPage - 1) * itemsPerPage + 1,
            end: Math.min(currentPage * itemsPerPage, filteredTransactions.length),
            total: filteredTransactions.length
          })}
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="flex items-center justify-center size-8 rounded-lg hover:dark:bg-white/10 hover:bg-muted/50 transition disabled:opacity-30 disabled:cursor-not-allowed dark:text-white/60 text-muted-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          
          {[...Array(Math.min(totalPages, 4))].map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={cn(
                  "flex items-center justify-center size-8 rounded-lg text-[13px] font-bold transition",
                  currentPage === pageNum
                    ? "bg-[#E10600] text-white"
                    : "dark:text-white/60 text-muted-foreground hover:dark:bg-white/10 hover:bg-muted/50"
                )}
              >
                {pageNum}
              </button>
            );
          })}
          
          {totalPages > 4 && (
            <div className="flex items-center justify-center size-8 dark:text-white/40 text-muted-foreground">
              <MoreHorizontal className="size-4" />
            </div>
          )}

          {totalPages > 4 && (
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={cn(
                "flex items-center justify-center size-8 rounded-lg text-[13px] font-bold transition",
                currentPage === totalPages
                  ? "bg-[#E10600] text-white"
                  : "dark:text-white/60 text-muted-foreground hover:dark:bg-white/10 hover:bg-muted/50"
              )}
            >
              {totalPages}
            </button>
          )}

          <button 
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="flex items-center justify-center size-8 rounded-lg hover:dark:bg-white/10 hover:bg-muted/50 transition disabled:opacity-30 disabled:cursor-not-allowed dark:text-white/60 text-muted-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
