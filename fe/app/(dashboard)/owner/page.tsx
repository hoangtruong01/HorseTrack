"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  PlusCircle,
  Flag,
  Users,
  Wallet,
  ArrowRight,
  ClipboardCheck,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/data-display/stat-card";
import { PageHeader } from "@/components/layout/page-header";

type OwnerStats = {
  horses: { count: number };
  registrations: { count: number };
  winnings: { pending: number; paid: number; total: number };
};

export default function OwnerDashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/owner/dashboard");
        if (response.ok) {
          const resData = await response.json();
          if (resData.success) {
            setStats(resData.data);
          }
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin thống kê:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statsCards = [
    {
      label: t("owner.stats.horses.label"),
      value: isLoading ? "..." : (stats?.horses.count || 0).toString(),
      helper: t("owner.stats.horses.helper"),
      icon: Users,
      tone: "neutral" as const,
      trend: t("owner.stats.horses.trend"),
    },
    {
      label: t("owner.stats.registrations.label"),
      value: isLoading ? "..." : (stats?.registrations.count || 0).toString(),
      helper: t("owner.stats.registrations.helper"),
      icon: ClipboardCheck,
      tone: "yellow" as const,
      trend: t("owner.stats.registrations.trend"),
    },
    {
      label: t("owner.stats.winnings.label"),
      value: isLoading ? "..." : `${(stats?.winnings.total || 0).toLocaleString("vi-VN")} đ`,
      helper: `${t("owner.stats.winnings.helperPaid")}: ${(stats?.winnings.paid || 0).toLocaleString("vi-VN")} đ · ${t("owner.stats.winnings.helperPending")}: ${(stats?.winnings.pending || 0).toLocaleString("vi-VN")} đ`,
      icon: Award,
      tone: "teal" as const,
      trend: t("owner.stats.winnings.trend"),
    },
  ];

  return (
    <main className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        eyebrow={t("owner.header.eyebrow")}
        title={t("owner.header.title")}
        description={t("owner.header.description")}
        actions={
          <div className="flex gap-3">
            <Button asChild className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-white">
              <Link href="/owner/horses/new">
                {t("owner.actions.addHorse")}
                <PlusCircle className="size-4 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-border hover:bg-muted text-foreground">
              <Link href="/owner/races">
                {t("owner.actions.registerRace")}
                <Flag className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        }
      />

      {/* Hero Welcome banner */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card/85 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.2)] sm:p-8">
        <div className="absolute inset-0 dark:bg-[linear-gradient(120deg,rgba(225,6,0,0.18),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(6,126,106,0.15),transparent_28rem)] bg-card" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E10600] to-transparent" />

        <div className="relative grid gap-6 md:grid-cols-[1.4fr_0.6fr] md:items-center">
          <div>
            <span className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {t("owner.hero.badge")}
            </span>
            <h2 className="mt-4 text-3xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-4xl">
              {t("owner.hero.title")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t("owner.hero.description")}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-2.5 text-primary">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {t("owner.hero.rewardSplit")}
                </p>
                <p className="text-xs font-bold text-foreground mt-0.5">
                  {t("owner.hero.rewardSplitDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-2.5 text-teal-400">
                <Wallet className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {t("owner.hero.wallet")}
                </p>
                <p className="text-xs font-bold text-foreground mt-0.5">
                  {t("owner.hero.walletDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </section>

      {/* Quick Action Hub */}
      <section className="space-y-4">
        <h3 className="text-lg font-black uppercase tracking-wider text-foreground">{t("owner.quickActions.title")}</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Action 1: Danh sách ngựa */}
          <Link
            href="/owner/horses"
            className="group block rounded-2xl border border-border bg-card/80 p-5 hover:border-[#E10600]/30 hover:bg-muted transition shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
          >
            <div className="size-10 rounded-xl bg-muted group-hover:bg-[#E10600]/10 flex items-center justify-center border border-border group-hover:border-[#E10600]/25 transition mb-4">
              <Users className="size-5 text-muted-foreground group-hover:text-primary transition" />
            </div>
            <h4 className="font-black uppercase tracking-tight text-foreground group-hover:text-primary transition flex items-center justify-between">
              {t("owner.quickActions.horses.title")}
              <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
            </h4>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {t("owner.quickActions.horses.desc")}
            </p>
          </Link>

          {/* Action 2: Đăng ký trận đua */}
          <Link
            href="/owner/races"
            className="group block rounded-2xl border border-border bg-card/80 p-5 hover:border-[#E10600]/30 hover:bg-muted transition shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
          >
            <div className="size-10 rounded-xl bg-muted group-hover:bg-[#E10600]/10 flex items-center justify-center border border-border group-hover:border-[#E10600]/25 transition mb-4">
              <Flag className="size-5 text-muted-foreground group-hover:text-primary transition" />
            </div>
            <h4 className="font-black uppercase tracking-tight text-foreground group-hover:text-primary transition flex items-center justify-between">
              {t("owner.quickActions.races.title")}
              <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
            </h4>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {t("owner.quickActions.races.desc")}
            </p>
          </Link>

          {/* Action 3: Lịch sử đăng ký */}
          <Link
            href="/owner/registrations"
            className="group block rounded-2xl border border-border bg-card/80 p-5 hover:border-[#E10600]/30 hover:bg-muted transition shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
          >
            <div className="size-10 rounded-xl bg-muted group-hover:bg-[#E10600]/10 flex items-center justify-center border border-border group-hover:border-[#E10600]/25 transition mb-4">
              <ClipboardCheck className="size-5 text-muted-foreground group-hover:text-primary transition" />
            </div>
            <h4 className="font-black uppercase tracking-tight text-foreground group-hover:text-primary transition flex items-center justify-between">
              {t("owner.quickActions.registrations.title")}
              <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
            </h4>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {t("owner.quickActions.registrations.desc")}
            </p>
          </Link>

          {/* Action 4: Ví thưởng */}
          <Link
            href="/owner/wallet"
            className="group block rounded-2xl border border-border bg-card/80 p-5 hover:border-[#E10600]/30 hover:bg-muted transition shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
          >
            <div className="size-10 rounded-xl bg-muted group-hover:bg-[#E10600]/10 flex items-center justify-center border border-border group-hover:border-[#E10600]/25 transition mb-4">
              <Wallet className="size-5 text-muted-foreground group-hover:text-primary transition" />
            </div>
            <h4 className="font-black uppercase tracking-tight text-foreground group-hover:text-primary transition flex items-center justify-between">
              {t("owner.quickActions.wallet.title")}
              <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition -translate-x-2 group-hover:translate-x-0" />
            </h4>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {t("owner.quickActions.wallet.desc")}
            </p>
          </Link>

        </div>
      </section>
    </main>
  );
}
