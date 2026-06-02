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
      if (filterType === "predictions") return matchesSearch && (tx.type === "prediction_win" || tx.type === "prediction_refund");
      return matchesSearch;
    });
  }, [transactions, filterType, searchTerm]);

  const typeMeta: Record<
    WalletTransaction["type"],
    { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
  > = {
    deposit: { icon: ArrowDownLeft, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Điểm ban đầu" },
    withdrawal_requested: { icon: ArrowUpRight, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: "Đổi quà (Chờ)" },
    withdrawal_approved: { icon: ArrowUpRight, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Đổi quà (Duyệt)" },
    withdrawal_paid: { icon: ArrowUpRight, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Đổi quà (Thành công)" },
    withdrawal_rejected: { icon: ArrowUpRight, color: "text-red-400 bg-red-500/10 border-red-500/20", label: "Đổi quà (Từ chối)" },
    prize_owner: { icon: Award, color: "text-primary bg-primary/10 border-primary/20", label: "Giải Owner" },
    prize_jockey: { icon: Award, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", label: "Giải Jockey" },
    prediction_win: { icon: Sparkles, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", label: "Dự đoán Thắng" },
    prediction_refund: { icon: Coins, color: "text-sky-400 bg-sky-500/10 border-sky-500/20", label: "Hoàn trả điểm" },
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5 shadow-[0_24px_64px_rgba(0,0,0,0.48)] sm:p-6">
      {/* Decorative gradient header */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#E10600]/30 to-transparent" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b dark:border-white/5 border-border pb-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary flex items-center gap-1.5">
            <Coins className="size-3.5 animate-pulse" /> Sổ cái điểm thưởng
          </p>
          <h2 className="mt-1.5 text-xl font-black uppercase tracking-tight dark:text-white text-foreground sm:text-2xl">
            Lịch sử giao dịch điểm
          </h2>
        </div>

        {/* Filter Badges with sleek modern pill styling */}
        <div className="flex flex-wrap gap-1.5 dark:bg-black/30 bg-muted/20 p-1.5 rounded-xl border dark:border-white/5 border-border">
          {[
            { id: "all", label: "Tất cả" },
            { id: "prizes", label: "Chủ/Nài ngựa" },
            { id: "predictions", label: "Dự đoán" },
            { id: "cashouts", label: "Yêu cầu đổi quà" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider transition cursor-pointer outline-none",
                filterType === t.id
                  ? "bg-primary text-white shadow-[0_2px_8px_rgba(225,6,0,0.25)]"
                  : "dark:text-white/60 text-muted-foreground hover:dark:text-white hover:text-foreground hover:dark:bg-white/5 bg-muted/50 hover:bg-muted/80",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search input with motorsport dark aesthetic */}
      <div className="relative mt-5">
        <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 dark:text-white/30 text-muted-foreground" />
        <input
          type="text"
          placeholder="Tìm kiếm theo mô tả giao dịch..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-12 w-full rounded-xl border dark:border-white/10 border-border dark:bg-black/40 bg-muted/20 pl-11 pr-6 text-sm dark:text-white text-foreground outline-none placeholder:dark:text-white/20 text-muted-foreground focus:border-primary transition"
        />
      </div>

      {/* Transactions List */}
      <div className="mt-5 overflow-hidden rounded-xl border dark:border-white/5 border-border dark:bg-black/10 bg-muted/20">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Coins className="size-10 dark:text-white/10 text-muted-foreground animate-pulse" />
            <p className="mt-4 text-xs font-black uppercase tracking-wider dark:text-white/40 text-muted-foreground">
              Không tìm thấy giao dịch nào
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Vui lòng thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto select-none">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="dark:bg-white/[0.03] bg-muted/50 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground border-b dark:border-white/5 border-border">
                <tr>
                  <th className="px-4 py-3">Loại giao dịch</th>
                  <th className="px-4 py-3">Chi tiết hoạt động</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3 text-right">Biến động điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTransactions.map((tx) => {
                  const meta = typeMeta[tx.type] || { icon: Coins, color: "dark:text-white/60 text-muted-foreground dark:bg-white/5 bg-muted/50 dark:border-white/10 border-border", label: "Giao dịch" };
                  const Icon = meta.icon;
                  const isPositive = tx.type === "deposit" || tx.type === "prize_owner" || tx.type === "prize_jockey" || tx.type === "prediction_win" || tx.type === "prediction_refund";

                  return (
                    <tr key={tx.id} className="transition hover:dark:bg-white/[0.015] bg-muted/50">
                      {/* Icon and Type */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl border", meta.color)}>
                            <Icon className="size-4" />
                          </div>
                          <div>
                            <p className="font-black uppercase tracking-wider dark:text-white text-foreground text-[11px] sm:text-xs">
                              {meta.label}
                            </p>
                            <p className="text-[9px] text-muted-foreground font-mono mt-0.5">
                              #{tx.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Details */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold dark:text-white/90 text-muted-foreground text-xs sm:text-sm">
                          {tx.description}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <StatusBadge
                            label={tx.status === "completed" ? "Thành công" : tx.status === "pending" ? "Đang chờ tại quầy" : "Từ chối/Lỗi"}
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

                      {/* Stacked Date & Time */}
                      <td className="px-4 py-3.5 whitespace-nowrap dark:text-white/60 text-muted-foreground font-mono text-[11px] leading-relaxed">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1 font-bold dark:text-white/80 text-muted-foreground">
                            <Calendar className="size-3 text-primary shrink-0" />
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] dark:text-white/40 text-muted-foreground mt-0.5">
                            <Clock className="size-3 shrink-0" />
                            {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      {/* Points Change */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <span className={cn(
                            "font-mono text-xs sm:text-sm font-black",
                            isPositive ? "text-emerald-400" : "text-primary"
                          )}>
                            {isPositive ? "+" : "-"}{tx.amount.toLocaleString('vi-VN')} Điểm
                          </span>
                        </div>
                      </td>
                    </tr>
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
