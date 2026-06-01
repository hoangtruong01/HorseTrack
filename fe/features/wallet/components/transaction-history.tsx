"use client";

import { ArrowDownLeft, ArrowUpRight, Award, Calendar, Clock, Coins, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type { WalletTransaction } from "../mock-wallet";

export type TransactionHistoryProps = {
  transactions: WalletTransaction[];
};

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            tx.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterType === "all") return matchesSearch;
      if (filterType === "prizes") return matchesSearch && (tx.type === "prize_owner" || tx.type === "prize_jockey");
      if (filterType === "cashouts") return matchesSearch && (tx.type === "withdrawal_requested" || tx.type === "withdrawal_approved" || tx.type === "withdrawal_paid" || tx.type === "withdrawal_rejected");
      if (filterType === "deposits") return matchesSearch && tx.type === "deposit";
      return matchesSearch;
    });
  }, [transactions, filterType, searchTerm]);

  const typeMeta: Record<
    WalletTransaction["type"],
    { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
  > = {
    deposit: { icon: ArrowDownLeft, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", label: "Deposit" },
    withdrawal_requested: { icon: ArrowUpRight, color: "text-amber-500 bg-amber-500/10 border-amber-500/20", label: "Cashout Req" },
    withdrawal_approved: { icon: ArrowUpRight, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", label: "Cashout Appr" },
    withdrawal_paid: { icon: ArrowUpRight, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", label: "Cashout Paid" },
    withdrawal_rejected: { icon: ArrowUpRight, color: "text-red-500 bg-red-500/10 border-red-500/20", label: "Cashout Rej" },
    prize_owner: { icon: Award, color: "text-primary bg-primary/10 border-primary/20", label: "Owner Prize" },
    prize_jockey: { icon: Award, color: "text-blue-500 bg-blue-500/10 border-blue-500/20", label: "Jockey Prize" },
    prediction_win: { icon: Sparkles, color: "text-purple-500 bg-purple-500/10 border-purple-500/20", label: "Prediction Win" },
    prediction_refund: { icon: Coins, color: "text-sky-500 bg-sky-500/10 border-sky-500/20", label: "Refund" },
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#15151E]/90 p-4 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Ledger & History
          </p>
          <h2 className="mt-1 text-2xl font-black uppercase text-white">
            Transactions
          </h2>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2">
          {["all", "prizes", "cashouts", "deposits"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-wider transition cursor-pointer",
                filterType === t
                  ? "border-primary bg-primary text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Search inputs */}
      <div className="relative mt-6">
        <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          placeholder="Search transaction description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-12 w-full rounded-full border border-white/10 bg-black/25 pl-11 pr-6 text-sm text-white outline-none placeholder:text-white/40 focus:border-primary"
        />
      </div>

      {/* Transactions List */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Coins className="size-12 text-white/20 animate-pulse" />
            <p className="mt-4 text-sm font-black uppercase tracking-wider text-white">
              No transactions found
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search terms or filters above.
            </p>
          </div>
        ) : (
          <table className="min-w-[700px] w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5">Activity</th>
                <th className="px-4 py-3.5">Details</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5 text-right">Value (VND)</th>
                <th className="px-4 py-3.5 text-right">Points Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-black/5">
              {filteredTransactions.map((tx) => {
                const meta = typeMeta[tx.type] || { icon: Coins, color: "text-white/60 bg-white/5 border-white/10", label: "Transaction" };
                const Icon = meta.icon;
                const isPositive = tx.type === "deposit" || tx.type === "prize_owner" || tx.type === "prize_jockey" || tx.type === "prediction_win" || tx.type === "prediction_refund";

                return (
                  <tr key={tx.id} className="transition hover:bg-white/[0.02]">
                    {/* Icon and Type */}
                    <td className="px-4 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex size-9 items-center justify-center rounded-xl border", meta.color)}>
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <p className="font-black uppercase tracking-wider text-white text-xs">
                            {meta.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            #{tx.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="px-4 py-4.5">
                      <p className="text-sm font-semibold text-white/90">
                        {tx.description}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <StatusBadge
                          label={tx.status}
                          tone={
                            tx.status === "completed"
                              ? "green"
                              : tx.status === "pending"
                                ? "slate"
                                : "red"
                          }
                        />
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4.5 text-xs text-white/60 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-primary" />
                        {new Date(tx.createdAt).toLocaleDateString()}
                        <Clock className="size-3.5 text-white/40 ml-1" />
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Value in VND */}
                    <td className="px-4 py-4.5 text-right font-mono text-xs font-semibold text-white/70">
                      {(tx.amountVnd).toLocaleString()} VND
                    </td>

                    {/* Change in Points */}
                    <td className={cn(
                      "px-4 py-4.5 text-right font-mono text-base font-black",
                      isPositive ? "text-emerald-400" : "text-primary"
                    )}>
                      {isPositive ? "+" : "-"}{tx.amount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
