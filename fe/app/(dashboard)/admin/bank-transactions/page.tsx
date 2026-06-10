"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { bankTransactionsApi, type BankTxItem } from "@/lib/api-client";

const directionColors: Record<string, string> = {
  in: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  out: "text-red-400 bg-red-400/10 border-red-400/20",
};

const matchedTypeColors: Record<string, string> = {
  payment: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  payout: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  unknown: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

const MATCH_TYPE_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "payment", label: "Payment" },
  { value: "payout", label: "Payout" },
  { value: "unknown", label: "Unknown" },
];

export default function AdminBankTransactionsPage() {
  const [txs, setTxs] = useState<BankTxItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [matchedType, setMatchedType] = useState("");

  const fetchTxs = useCallback(async (page = 1, type = matchedType) => {
    setLoading(true);
    try {
      const res = await bankTransactionsApi.list({
        page,
        limit: 20,
        matchedType: type || undefined,
      });
      setTxs(res.data);
      setMeta(res.meta);
    } catch (e) {
      toast.error((e as Error).message ?? "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [matchedType]);

  useEffect(() => { void fetchTxs(1); }, [fetchTxs]);

  const handleTypeChange = (type: string) => {
    setMatchedType(type);
    void fetchTxs(1, type);
  };

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Payment"
        title="Giao Dịch Ngân Hàng"
        description="Danh sách giao dịch nhận được qua webhook ngân hàng (SEPAY). Bao gồm nạp điểm, thanh toán gói AI và các giao dịch chưa khớp."
      />

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground">Loại:</span>
        {MATCH_TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleTypeChange(opt.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition border ${matchedType === opt.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground">
          Tổng: <strong className="text-foreground">{meta.total}</strong> giao dịch
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Đang tải...</div>
        ) : txs.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Không có giao dịch nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Provider</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Chiều</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Số tiền</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Loại khớp</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Mô tả</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Tài khoản đối ứng</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Thời gian GD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {txs.map((tx) => (
                  <tr key={tx._id} className="hover:bg-muted transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-foreground uppercase">{tx.provider}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${directionColors[tx.direction] ?? ""}`}>
                        {tx.direction === "in" ? "IN ↑" : "OUT ↓"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-bold text-foreground">
                      {tx.amount.toLocaleString("vi-VN")} <span className="text-xs text-muted-foreground">{tx.currency}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${matchedTypeColors[tx.matchedType] ?? ""}`}>
                        {tx.matchedType}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground max-w-xs truncate">{tx.description ?? "—"}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {tx.counterAccountNo ? (
                        <span>{tx.counterAccountNo}{tx.counterAccountName ? ` · ${tx.counterAccountName}` : ""}</span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {new Date(tx.transactionTime).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => fetchTxs(meta.page - 1)} disabled={meta.page <= 1}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition">
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">Trang {meta.page} / {meta.totalPages}</span>
          <button onClick={() => fetchTxs(meta.page + 1)} disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition">
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </main>
  );
}
