"use client";
import Image from "next/image";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { aiApi, type AiPackageItem } from "@/lib/api-client";

const statusColors: Record<string, string> = {
  ACTIVE: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  INACTIVE: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

const defaultForm = { name: "", description: "", price: "", durationDays: "", accuracyRate: "" };

export default function AdminAiPackagesPage() {
  const [packages, setPackages] = useState<AiPackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await aiApi.listPackages();
      setPackages(data);
    } catch (e) {
      toast.error((e as Error).message ?? "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchPackages(); }, [fetchPackages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.durationDays) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }
    setSubmitting(true);
    try {
      await aiApi.createPackage({
        name: form.name,
        description: form.description || undefined,
        price: Number(form.price),
        durationDays: Number(form.durationDays),
        accuracyRate: form.accuracyRate ? Number(form.accuracyRate) : undefined,
      });
      toast.success("Tạo gói AI thành công");
      setForm(defaultForm);
      setShowForm(false);
      await fetchPackages();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="AI Service"
        title="Quản Lý Gói Dự Đoán AI"
        description="Tạo và quản lý các gói dự đoán AI. Spectator có thể mua gói để xem kết quả dự đoán từ AI."
        actions={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            <Plus className="size-4" />
            Tạo gói mới
          </button>
        }
      />

      {showForm && (
        <form onSubmit={(e) => { void handleSubmit(e); }} className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Thêm gói AI mới</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Tên gói <span className="text-red-400">*</span></label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="VD: Gói Cơ Bản"
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Giá (VND) <span className="text-red-400">*</span></label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="50000"
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Thời hạn (ngày) <span className="text-red-400">*</span></label>
              <input
                type="number"
                min="1"
                value={form.durationDays}
                onChange={(e) => setForm((f) => ({ ...f, durationDays: e.target.value }))}
                placeholder="30"
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Tỉ lệ chính xác (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.accuracyRate}
                onChange={(e) => setForm((f) => ({ ...f, accuracyRate: e.target.value }))}
                placeholder="75"
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Mô tả</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Mô tả ngắn về gói..."
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(defaultForm); }}
              className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition"
            >
              {submitting ? "Đang tạo..." : "Tạo gói"}
            </button>
          </div>
        </form>
      )}

      <div className="text-sm text-muted-foreground">
        Tổng: <strong className="text-foreground">{packages.length}</strong> gói
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-foreground/55">
  <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
  <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải...</p>
</div>
        ) : packages.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Chưa có gói AI nào. Tạo gói đầu tiên!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Tên gói</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Mô tả</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Giá (VND)</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Thời hạn</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Độ chính xác</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {packages.map((pkg) => (
                  <tr key={pkg._id} className="hover:bg-muted transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-foreground">{pkg.name}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground max-w-xs truncate">{pkg.description ?? "—"}</td>
                    <td className="px-5 py-4 text-right font-mono font-bold text-primary">{pkg.price.toLocaleString("vi-VN")}</td>
                    <td className="px-5 py-4 text-center text-sm text-foreground">{pkg.durationDays} ngày</td>
                    <td className="px-5 py-4 text-center text-sm text-foreground">
                      {pkg.accuracyRate != null ? `${pkg.accuracyRate}%` : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${statusColors[pkg.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                        {pkg.status}
                      </span>
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
