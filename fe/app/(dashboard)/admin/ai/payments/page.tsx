"use client";
import Image from "next/image";
import Link from "next/link";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { aiApi, type AiPaymentItem } from "@/lib/api-client";

const statusColors: Record<string, string> = {
  SUCCESS: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 dark:bg-emerald-400/10 border-emerald-500/30 dark:border-emerald-400/20",
  PENDING: "text-amber-700 dark:text-yellow-400 bg-amber-500/15 dark:bg-yellow-400/10 border-amber-500/30 dark:border-yellow-400/20",
  FAILED: "text-rose-700 dark:text-red-400 bg-rose-500/15 dark:bg-red-400/10 border-rose-500/30 dark:border-red-400/20",
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await aiApi.listRevenue();
      setPayments(data ?? []);
    } catch (e) {
      toast.error((e as Error).message ?? "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchPayments(); }, [fetchPayments]);

  const filteredPayments = payments.filter((p) => {
    if (statusFilter && (p.status || "").toUpperCase() !== statusFilter.toUpperCase()) {
      return false;
    }
    if (!search) return true;
    const q = search.toLowerCase();
    const userName = getName(p.userId).toLowerCase();
    const pkgName = getName(p.packageId).toLowerCase();
    const method = (p.paymentMethod || "").toLowerCase();
    return userName.includes(q) || pkgName.includes(q) || method.includes(q);
  });

  const hasActiveFilters = Boolean(search || statusFilter);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  return (
    <main className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader
          eyebrow="AI Service"
          title="Doanh Thu Gói AI"
          description="Xem toàn bộ giao dịch mua gói dự đoán AI của Spectator qua cổng thanh toán PayOS."
        />
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition shrink-0"
        >
          <ArrowLeft className="size-3.5" />
          Dashboard
        </Link>
      </div>

      {/* Toolbar bộ lọc */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên user, gói AI, phương thức..."
              className="w-full rounded-xl border border-border bg-muted/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="SUCCESS">SUCCESS (Thành công)</option>
            <option value="PENDING">PENDING (Đang xử lý)</option>
            <option value="FAILED">FAILED (Thất bại)</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted px-3.5 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted/80 hover:text-foreground transition"
          >
            <X className="size-3.5" />
            Xóa bộ lọc
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Hiển thị: <strong className="text-foreground font-semibold">{filteredPayments.length}</strong> / {payments.length} giao dịch
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-foreground/55">
            <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
            <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Không tìm thấy giao dịch phù hợp.</div>
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
                {filteredPayments.map((p) => (
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
    </main>
  );
}
