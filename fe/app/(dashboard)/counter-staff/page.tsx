"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gift, ArrowRight, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { walletApi, type CashoutItem } from "@/lib/api-client";

export default function CounterStaffDashboard() {
  const [stats, setStats] = useState({
    totalCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    paidCount: 0,
    totalPoints: 0,
  });
  const [recentCashouts, setRecentCashouts] = useState<CashoutItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await walletApi.allCashouts({ page: 1, limit: 100 });
        if (res && res.data) {
          const list = res.data;
          const totalCount = res.meta?.total ?? list.length;
          const pendingCount = list.filter((c) => c.status === "PENDING").length;
          const approvedCount = list.filter((c) => c.status === "APPROVED").length;
          const paidCount = list.filter((c) => c.status === "PAID").length;
          const totalPoints = list
            .filter((c) => c.status === "PAID" || c.status === "APPROVED")
            .reduce((sum, c) => sum + c.pointsRedeemed, 0);

          setStats({
            totalCount,
            pendingCount,
            approvedCount,
            paidCount,
            totalPoints,
          });
          setRecentCashouts(list.slice(0, 5));
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu quầy:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <main className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <PageHeader
        eyebrow="Counter Operations"
        title="Quầy Giao Dịch Đổi Thưởng"
        description="Chào mừng bạn đến với bàn làm việc của Nhân viên quầy. Tại đây bạn có thể phê duyệt mã quà tặng vật lý và hỗ trợ trao thưởng trực tiếp tại quầy."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm transition duration-300 hover:border-amber-300 dark:border-yellow-500/10 dark:bg-gradient-to-br dark:from-[#1A1813]/90 dark:to-[#12110D]/90">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-amber-800 dark:text-yellow-500/80">
              Chờ Phê Duyệt
            </p>
            <Clock className="size-5 text-amber-600 dark:text-yellow-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">
              {loading ? "—" : stats.pendingCount}
            </span>
            <span className="text-xs text-muted-foreground">mã đang đợi</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm transition duration-300 hover:border-blue-300 dark:border-blue-500/10 dark:bg-gradient-to-br dark:from-[#121724]/90 dark:to-[#0E121C]/90">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-blue-800 dark:text-blue-400/80">
              Đã Duyệt (Chờ Trao Quà)
            </p>
            <Sparkles className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">
              {loading ? "—" : stats.approvedCount}
            </span>
            <span className="text-xs text-muted-foreground">mã đã xác thực</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm transition duration-300 hover:border-emerald-300 dark:border-emerald-500/10 dark:bg-gradient-to-br dark:from-[#101C15]/90 dark:to-[#0A120E]/90">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-400/80">
              Đã Trao Quà
            </p>
            <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">
              {loading ? "—" : stats.paidCount}
            </span>
            <span className="text-xs text-muted-foreground">giao dịch hoàn tất</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm transition duration-300 hover:border-primary/30 dark:border-[#E10600]/10 dark:bg-gradient-to-br dark:from-[#241010]/90 dark:to-[#190C0C]/90">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-primary">
              Tổng Điểm Đổi Quà
            </p>
            <Gift className="size-5 text-primary" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-primary">
              {loading ? "—" : stats.totalPoints.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">điểm</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          href="/counter-staff/redemptions"
          className="group relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-lg transition duration-300 hover:border-primary/30 hover:shadow-md"
        >
          <div className="flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition duration-300 group-hover:scale-110">
            <Gift className="size-6" />
          </div>
          <h3 className="mt-5 text-lg font-black uppercase tracking-wider text-foreground transition group-hover:text-primary">
            Đổi Thưởng Vật Lý
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Tra cứu mã đổi thưởng dạng{" "}
            <code className="font-mono text-primary">RWD-XXXXXX</code> do khán
            giả/người dùng cung cấp tại quầy, đối soát thông tin quà và cập nhật
            trạng thái đã trao quà thành công.
          </p>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            Mở hàng đợi đổi thưởng{" "}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1.5" />
          </div>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
        <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-foreground">
          Các lượt quy đổi gần đây
        </h3>
        {loading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Đang tải lịch sử đổi...
          </div>
        ) : recentCashouts.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Chưa có giao dịch quy đổi nào được thực hiện.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4">Mã Đổi Quà</th>
                  <th className="pb-3 pr-4">Khách hàng</th>
                  <th className="pb-3 pr-4 text-center">Điểm đổi</th>
                  <th className="pb-3 pr-4">Trạng thái</th>
                  <th className="pb-3 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {recentCashouts.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/40">
                    <td className="py-3 pr-4 font-mono font-bold text-primary">
                      {item.redemptionCode}
                    </td>
                    <td className="py-3 pr-4">
                      {typeof item.userId === "object"
                        ? item.userId.fullName
                        : "Khách hàng"}
                      <span className="block text-[10px] text-muted-foreground">
                        {typeof item.userId === "object" ? item.userId.email : "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-center font-mono font-bold text-amber-700 dark:text-yellow-500">
                      {item.pointsRedeemed.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                          item.status === "PENDING"
                            ? "border border-amber-500/30 bg-amber-50 text-amber-800"
                            : item.status === "APPROVED"
                              ? "border border-blue-500/30 bg-blue-50 text-blue-800"
                              : item.status === "PAID"
                                ? "border border-emerald-500/30 bg-emerald-50 text-emerald-800"
                                : "border border-red-500/30 bg-red-50 text-red-800"
                        }`}
                      >
                        {item.status === "PAID" ? "ĐÃ TRAO QUÀ" : item.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-muted-foreground">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                        : "—"}
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
