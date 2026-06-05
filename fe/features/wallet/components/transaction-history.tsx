"use client";

import { ArrowDownLeft, ArrowUpRight, Award, Calendar, Clock, Coins, Copy, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type { WalletUiTransaction } from "../backend-wallet";

export type TransactionHistoryProps = {
  transactions: WalletUiTransaction[];
  role?: "owner" | "jockey" | "referee" | "spectator" | "admin" | "counter_staff";
};

export function TransactionHistory({ transactions, role }: TransactionHistoryProps) {
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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
    deposit: { icon: ArrowDownLeft, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Diem ban dau" },
    withdrawal_requested: { icon: ArrowUpRight, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: "Doi qua (Cho)" },
    withdrawal_approved: { icon: ArrowUpRight, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", label: "Doi qua (Duyet)" },
    withdrawal_paid: { icon: ArrowUpRight, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Doi qua (Thanh cong)" },
    withdrawal_rejected: { icon: ArrowUpRight, color: "text-red-400 bg-red-500/10 border-red-500/20", label: "Doi qua (Tu choi)" },
    withdrawal_refund: { icon: ArrowDownLeft, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Hoan diem doi qua" },
    prize_owner: { icon: Award, color: "text-primary bg-primary/10 border-primary/20", label: "Giai Owner" },
    prize_jockey: { icon: Award, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", label: "Giai Jockey" },
    prediction_win: { icon: Sparkles, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", label: "Du doan thang" },
    prediction_refund: { icon: Coins, color: "text-sky-400 bg-sky-500/10 border-sky-500/20", label: "Hoan diem" },
    salary_bonus: { icon: Award, color: "text-violet-400 bg-violet-500/10 border-violet-500/20", label: "Luong/Thuong" },
  };

  const filterOptions = useMemo(() => {
    const options = [{ id: "all", label: "Tat ca" }];
    
    if (role !== "referee" && role !== "spectator") {
      options.push({ id: "prizes", label: "Chu/Nai ngua" });
    }
    
    if (role !== "owner" && role !== "jockey" && role !== "referee") {
      options.push({ id: "predictions", label: "Du doan" });
    }

    if (role === "referee" || role === "admin") {
      options.push({ id: "salary", label: "Luong thuong" });
    }

    options.push({ id: "cashouts", label: "Doi qua" });
    
    return options;
  }, [role]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[0_24px_64px_rgba(0,0,0,0.48)] sm:p-6">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#E10600]/30 to-transparent" />

      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.24em] text-primary">
            <Coins className="size-3.5 animate-pulse" /> So cai diem thuong
          </p>
          <h2 className="mt-1.5 text-xl font-black uppercase tracking-tight text-foreground sm:text-2xl">
            Lich su giao dich diem
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
          placeholder="Tim kiem theo mo ta giao dich..."
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
              Khong tim thay giao dich nao
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Thu doi bo loc hoac tu khoa tim kiem.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead className="border-b border-border bg-muted/[0.03] text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Loai giao dich</th>
                  <th className="px-4 py-3">Chi tiet</th>
                  <th className="px-4 py-3">Thoi gian</th>
                  <th className="px-4 py-3 text-right">Bien dong diem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.map((tx) => {
                  const meta = typeMeta[tx.type] || { icon: Coins, color: "text-muted-foreground bg-muted border-border", label: "Giao dich" };
                  const Icon = meta.icon;
                  const isPositive = ["deposit", "prize_owner", "prize_jockey", "prediction_win", "prediction_refund", "salary_bonus", "withdrawal_refund"].includes(tx.type);
                  const codeMatch = tx.description.match(/(RWD-[A-Z0-9]+)/);
                  const code = codeMatch ? codeMatch[1] : null;

                  return (
                    <tr key={tx.id} className="transition hover:bg-muted/[0.015]">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl border", meta.color)}>
                            <Icon className="size-4" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-wider text-foreground sm:text-xs">
                              {meta.label}
                            </p>
                            <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">#{tx.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs font-semibold text-foreground sm:text-sm">{tx.description}</p>
                        {code && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-bold text-foreground border border-border">
                              {code}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(code);
                                toast.success(`Da sao chep ma quy doi: ${code}`);
                              }}
                              className="cursor-pointer rounded p-1 text-muted-foreground/60 transition hover:bg-muted hover:text-foreground"
                              title="Sao chep ma"
                            >
                              <Copy className="size-3.5" />
                            </button>
                          </div>
                        )}
                        <div className="mt-1.5 flex items-center gap-2">
                          <StatusBadge
                            label={tx.status === "completed" ? "Thanh cong" : tx.status === "pending" ? "Dang cho" : "Tu choi/Loi"}
                            tone={tx.status === "completed" ? "green" : tx.status === "pending" ? "slate" : "red"}
                          />
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1 font-bold text-foreground">
                            <Calendar className="size-3 shrink-0 text-primary" />
                            {new Date(tx.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground/60">
                            <Clock className="size-3 shrink-0" />
                            {new Date(tx.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <span className={cn("font-mono text-xs font-black sm:text-sm", isPositive ? "text-emerald-400" : "text-primary")}>
                          {isPositive ? "+" : "-"}{tx.amount.toLocaleString("vi-VN")} diem
                        </span>
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
