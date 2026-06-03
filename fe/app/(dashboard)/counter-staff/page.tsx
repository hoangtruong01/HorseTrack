"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gift, Wallet, ArrowRight, CheckCircle2, AlertCircle, Clock, ShieldAlert, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/page-header";
import { walletApi, type CashoutItem } from "@/lib/api-client";

export default function CounterStaffDashboard() {
  const { t } = useTranslation();
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
        eyebrow={t("counterStaff.header.eyebrow")}
        title={t("counterStaff.header.title")}
        description={t("counterStaff.header.description")}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pending Card */}
        <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 dark:bg-gradient-to-br dark:from-[#1A1813]/90 dark:to-[#12110D]/90 bg-yellow-50 p-5 shadow-2xl transition duration-300 hover:border-yellow-500/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-yellow-500/80">{t("counterStaff.stats.pending.title")}</p>
            <Clock className="size-5 text-yellow-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black dark:text-white text-foreground">{loading ? "—" : stats.pendingCount}</span>
            <span className="text-xs text-muted-foreground">{t("counterStaff.stats.pending.desc")}</span>
          </div>
          <div className="absolute -bottom-6 -right-6 size-24 bg-yellow-500/5 rounded-full blur-xl"></div>
        </div>

        {/* Approved Card */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 dark:bg-gradient-to-br dark:from-[#121724]/90 dark:to-[#0E121C]/90 bg-blue-50 p-5 shadow-2xl transition duration-300 hover:border-blue-500/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-blue-400/80">{t("counterStaff.stats.approved.title")}</p>
            <Sparkles className="size-5 text-blue-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black dark:text-white text-foreground">{loading ? "—" : stats.approvedCount}</span>
            <span className="text-xs text-muted-foreground">{t("counterStaff.stats.approved.desc")}</span>
          </div>
          <div className="absolute -bottom-6 -right-6 size-24 bg-blue-500/5 rounded-full blur-xl"></div>
        </div>

        {/* Paid Card */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 dark:bg-gradient-to-br dark:from-[#101C15]/90 dark:to-[#0A120E]/90 bg-emerald-50 p-5 shadow-2xl transition duration-300 hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400/80">{t("counterStaff.stats.paid.title")}</p>
            <CheckCircle2 className="size-5 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black dark:text-white text-foreground">{loading ? "—" : stats.paidCount}</span>
            <span className="text-xs text-muted-foreground">{t("counterStaff.stats.paid.desc")}</span>
          </div>
          <div className="absolute -bottom-6 -right-6 size-24 bg-emerald-500/5 rounded-full blur-xl"></div>
        </div>

        {/* Points Redeemed Card */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E10600]/20 dark:bg-gradient-to-br dark:from-[#241010]/90 dark:to-[#190C0C]/90 bg-red-50 p-5 shadow-2xl transition duration-300 hover:border-[#E10600]/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-[#E10600]/80">{t("counterStaff.stats.totalPoints.title")}</p>
            <Gift className="size-5 text-[#E10600]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black dark:text-white text-foreground">
              {loading ? "—" : stats.totalPoints.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">{t("counterStaff.stats.totalPoints.desc")}</span>
          </div>
          <div className="absolute -bottom-6 -right-6 size-24 bg-[#E10600]/5 rounded-full blur-xl"></div>
        </div>
      </div>

      {/* Grid Quick Action Buttons */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Action Redemptions */}
        <Link
          href="/counter-staff/redemptions"
          className="group relative overflow-hidden rounded-2xl border dark:border-white/5 border-border dark:bg-[#15151E]/60 bg-card p-6 transition duration-300 hover:border-[#E10600]/30 hover:dark:bg-[#15151E]/95 bg-card hover:shadow-[0_8px_32px_rgba(225,6,0,0.08)]"
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-[#E10600]/10 border border-[#E10600]/20 text-[#E10600] group-hover:scale-110 transition duration-300">
            <Gift className="size-6" />
          </div>
          <h3 className="mt-5 text-lg font-black uppercase tracking-wider dark:text-white text-foreground group-hover:text-[#E10600] transition">
            {t("counterStaff.actions.redemption.title")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {t("counterStaff.actions.redemption.desc")}
          </p>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E10600]">
            {t("counterStaff.actions.redemption.link")} <ArrowRight className="size-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </Link>

        {/* Action Deposit */}
        <Link
          href="/counter-staff/deposit"
          className="group relative overflow-hidden rounded-2xl border dark:border-white/5 border-border dark:bg-[#15151E]/60 bg-card p-6 transition duration-300 hover:border-[#E10600]/30 hover:dark:bg-[#15151E]/95 bg-card hover:shadow-[0_8px_32px_rgba(225,6,0,0.08)]"
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition duration-300">
            <Wallet className="size-6" />
          </div>
          <h3 className="mt-5 text-lg font-black uppercase tracking-wider dark:text-white text-foreground group-hover:text-blue-400 transition">
            {t("counterStaff.actions.deposit.title")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {t("counterStaff.actions.deposit.desc")}
          </p>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400">
            {t("counterStaff.actions.deposit.link")} <ArrowRight className="size-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Redemptions Table */}
      <div className="rounded-2xl border dark:border-white/5 border-border dark:bg-[#15151E]/60 bg-card p-6 shadow-2xl">
        <h3 className="text-sm font-black uppercase tracking-wider dark:text-white text-foreground mb-4">{t("counterStaff.recentRedemptions.title")}</h3>
        {loading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">{t("counterStaff.recentRedemptions.loading")}</div>
        ) : recentCashouts.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">{t("counterStaff.recentRedemptions.empty")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b dark:border-white/5 border-border text-muted-foreground uppercase font-black tracking-wider text-[10px]">
                  <th className="pb-3 pr-4">{t("counterStaff.recentRedemptions.columns.code")}</th>
                  <th className="pb-3 pr-4">{t("counterStaff.recentRedemptions.columns.customer")}</th>
                  <th className="pb-3 text-center pr-4">{t("counterStaff.recentRedemptions.columns.points")}</th>
                  <th className="pb-3 pr-4">{t("counterStaff.recentRedemptions.columns.status")}</th>
                  <th className="pb-3 text-right">{t("counterStaff.recentRedemptions.columns.time")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 dark:text-white/80 text-muted-foreground">
                {recentCashouts.map((item) => (
                  <tr key={item._id} className="hover:dark:bg-white/[0.01] bg-muted/50">
                    <td className="py-3 font-mono font-bold text-primary pr-4">{item.redemptionCode}</td>
                    <td className="py-3 pr-4">
                      {typeof item.userId === "object" ? item.userId.fullName : t("counterStaff.recentRedemptions.customerFallback")}
                      <span className="block text-[10px] text-muted-foreground">
                        {typeof item.userId === "object" ? item.userId.email : "—"}
                      </span>
                    </td>
                    <td className="py-3 text-center font-mono font-bold text-yellow-500 pr-4">
                      {item.pointsRedeemed.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${item.status === "PENDING"
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : item.status === "APPROVED"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : item.status === "PAID"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                      >
                        {item.status === "PAID"
                          ? t("counterStaff.recentRedemptions.statusPaid")
                          : item.status === "PENDING"
                            ? t("counterStaff.recentRedemptions.statusPending")
                            : item.status === "APPROVED"
                              ? t("counterStaff.recentRedemptions.statusApproved")
                              : item.status}
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
