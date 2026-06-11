"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { aiApi, type AiPaymentItem } from "@/lib/api-client";

const statusColors: Record<string, string> = {
  SUCCESS: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  FAILED: "text-red-400 bg-red-400/10 border-red-400/20",
};

function getName(field: AiPaymentItem["userId"] | AiPaymentItem["packageId"]) {
  if (!field) return "—";
  if (typeof field === "object") {
    if ("fullName" in field) return field.fullName;
    if ("name" in field) return field.name;
  }
  return String(field);
}

export default function AdminAiPaymentsPage() {
  const [payments, setPayments] = useState<AiPaymentItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await aiApi.listRevenue({ page, limit: 15 });
      setPayments(res.data);
      setMeta(res.meta);
    } catch (e) {
      toast.error((e as Error).message ?? "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchPayments(1); }, [fetchPayments]);

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="AI Service"
        title="Doanh Thu Gói AI"
        description="Xem toàn bộ giao dịch mua gói dự đoán AI của Spectator qua cổng thanh toán PayOS."
      />

      <div className="text-sm text-muted-foreground">
        Tổng: <strong className="text-foreground">{meta.total}</strong> giao dịch
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Đang tải...</div>
        ) : payments.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Chưa có giao dịch nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Người dùng</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Gói AI</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Số tiền (VND)</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Phương thức</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Trạng thái</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-muted transition-colors">
                    <td className="px-5 py-4 text-sm text-foreground">{getName(p.userId)}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{getName(p.packageId)}</td>
                    <td className="px-5 py-4 text-right font-mono font-bold text-primary">{p.amount.toLocaleString("vi-VN")}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground uppercase">{p.paymentMethod}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${statusColors[p.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString("vi-VN") : "—"}
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
          <button onClick={() => fetchPayments(meta.page - 1)} disabled={meta.page <= 1}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition">
            <ChevronLeft className="size-4" /> Trước
          </button>
          <span className="text-sm text-muted-foreground">Trang {meta.page} / {meta.totalPages}</span>
          <button onClick={() => fetchPayments(meta.page + 1)} disabled={meta.page >= meta.totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground hover:bg-white/[0.06] disabled:opacity-40 transition">
            Sau <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </main>
  );
}
