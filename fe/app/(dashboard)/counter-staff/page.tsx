"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gift, Wallet, ArrowRight, CheckCircle2, AlertCircle, Clock, ShieldAlert, Sparkles } from "lucide-react";
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
        description="Chào mừng bạn đến với bàn làm việc của Nhân viên quầy. Tại đây bạn có thể phê duyệt mã quà tặng vật lý và hỗ trợ khách hàng nạp tiền."
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pending Card */}
        <div className="relative overflow-hidden rounded-2xl border border-yellow-500/10 bg-gradient-to-br from-[#1A1813]/90 to-[#12110D]/90 p-5 shadow-2xl transition duration-300 hover:border-yellow-500/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-yellow-500/80">Chờ Phê Duyệt</p>
            <Clock className="size-5 text-yellow-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{loading ? "—" : stats.pendingCount}</span>
            <span className="text-xs text-muted-foreground">mã đang đợi</span>
          </div>
          <div className="absolute -bottom-6 -right-6 size-24 bg-yellow-500/5 rounded-full blur-xl"></div>
        </div>

        {/* Approved Card */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/10 bg-gradient-to-br from-[#121724]/90 to-[#0E121C]/90 p-5 shadow-2xl transition duration-300 hover:border-blue-500/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-blue-400/80">Đã Duyệt (Chờ Trao Quà)</p>
            <Sparkles className="size-5 text-blue-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{loading ? "—" : stats.approvedCount}</span>
            <span className="text-xs text-muted-foreground">mã đã xác thực</span>
          </div>
          <div className="absolute -bottom-6 -right-6 size-24 bg-blue-500/5 rounded-full blur-xl"></div>
        </div>

        {/* Paid Card */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-[#101C15]/90 to-[#0A120E]/90 p-5 shadow-2xl transition duration-300 hover:border-emerald-500/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400/80">Đã Trao Quà</p>
            <CheckCircle2 className="size-5 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{loading ? "—" : stats.paidCount}</span>
            <span className="text-xs text-muted-foreground">giao dịch hoàn tất</span>
          </div>
          <div className="absolute -bottom-6 -right-6 size-24 bg-emerald-500/5 rounded-full blur-xl"></div>
        </div>

        {/* Points Redeemed Card */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E10600]/10 bg-gradient-to-br from-[#241010]/90 to-[#190C0C]/90 p-5 shadow-2xl transition duration-300 hover:border-[#E10600]/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-[#E10600]/80">Tổng Điểm Đổi Quà</p>
            <Gift className="size-5 text-[#E10600]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-black text-[#E10600]">
              {loading ? "—" : stats.totalPoints.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">điểm</span>
          </div>
          <div className="absolute -bottom-6 -right-6 size-24 bg-[#E10600]/5 rounded-full blur-xl"></div>
        </div>
      </div>

      {/* Grid Quick Action Buttons */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Action Redemptions */}
        <Link
          href="/counter-staff/redemptions"
          className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#15151E]/60 p-6 transition duration-300 hover:border-[#E10600]/30 hover:bg-[#15151E]/95 hover:shadow-[0_8px_32px_rgba(225,6,0,0.08)]"
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-[#E10600]/10 border border-[#E10600]/20 text-[#E10600] group-hover:scale-110 transition duration-300">
            <Gift className="size-6" />
          </div>
          <h3 className="mt-5 text-lg font-black uppercase tracking-wider text-white group-hover:text-[#E10600] transition">
            Đổi Thưởng Vật Lý
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Tra cứu mã đổi thưởng dạng <code className="text-[#E10600] font-mono">RWD-XXXXXX</code> do khán giả/người dùng cung cấp tại quầy, đối soát thông tin quà và cập nhật trạng thái đã trao quà thành công.
          </p>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E10600]">
            Mở hàng đợi đổi thưởng <ArrowRight className="size-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </Link>

        {/* Action Deposit */}
        <Link
          href="/counter-staff/deposit"
          className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#15151E]/60 p-6 transition duration-300 hover:border-[#E10600]/30 hover:bg-[#15151E]/95 hover:shadow-[0_8px_32px_rgba(225,6,0,0.08)]"
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition duration-300">
            <Wallet className="size-6" />
          </div>
          <h3 className="mt-5 text-lg font-black uppercase tracking-wider text-white group-hover:text-blue-400 transition">
            Nạp Tiền Cho Khách
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Hỗ trợ nạp tiền mặt đổi lấy điểm thưởng/số dư tài khoản ví tại quầy. Nhập email/ID tài khoản của khách hàng để thực hiện nạp trực tiếp nhanh chóng.
          </p>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400">
            Mở giao diện nạp ví <ArrowRight className="size-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Redemptions Table */}
      <div className="rounded-2xl border border-white/5 bg-[#15151E]/60 p-6 shadow-2xl">
        <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">Các lượt quy đổi gần đây</h3>
        {loading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Đang tải lịch sử đổi...</div>
        ) : recentCashouts.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Chưa có giao dịch quy đổi nào được thực hiện.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-muted-foreground uppercase font-black tracking-wider text-[10px]">
                  <th className="pb-3 pr-4">Mã Đổi Quà</th>
                  <th className="pb-3 pr-4">Khách hàng</th>
                  <th className="pb-3 text-center pr-4">Điểm đổi</th>
                  <th className="pb-3 pr-4">Trạng thái</th>
                  <th className="pb-3 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {recentCashouts.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.01]">
                    <td className="py-3 font-mono font-bold text-primary pr-4">{item.redemptionCode}</td>
                    <td className="py-3 pr-4">
                      {typeof item.userId === "object" ? item.userId.fullName : "Khách hàng"}
                      <span className="block text-[10px] text-muted-foreground">
                        {typeof item.userId === "object" ? item.userId.email : "—"}
                      </span>
                    </td>
                    <td className="py-3 text-center font-mono font-bold text-yellow-500 pr-4">
                      {item.pointsRedeemed.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                          item.status === "PENDING"
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : item.status === "APPROVED"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : item.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {item.status === "PAID" ? "ĐÃ TRAO QUÀ" : item.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-muted-foreground">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "—"}
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
