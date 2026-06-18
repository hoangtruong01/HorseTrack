"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ClipboardCheck, Trophy, Users, AlertCircle, RefreshCw, Flag, CheckCircle, CreditCard, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { StatCard } from "@/components/data-display/stat-card";
import { AttentionCenter, AttentionItem } from "@/features/dashboard/components/attention-center";
import { QuickActionGrid } from "@/features/dashboard/components/quick-action-grid";
import { RaceOpsTable } from "@/features/dashboard/components/race-ops-table";
import { quickActions } from "@/features/dashboard/mock-admin-dashboard";

import { cn } from "@/lib/utils";
import { dashboardApi, registrationsApi, racesApi, aiApi, RaceItem, type AiPaymentItem } from "@/lib/api-client";
import type { StatCardSemantic } from "@/components/data-display/stat-card";

type DashboardData = {
  usersTotal: number;
  tournamentsTotal: number;
  racesTotal: number;
  pendingRegistrations: number;
  liveRaces: number;
  finishedRaces: number;
  racesList: RaceItem[];
};

const statusColors: Record<string, string> = {
  SUCCESS: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  PENDING: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  FAILED: "text-red-400 bg-red-400/10 border-red-400/20",
};

function getPaymentName(field: AiPaymentItem["userId"] | AiPaymentItem["packageId"]) {
  if (!field) return "—";
  if (typeof field === "object") {
    if ("fullName" in field) return field.fullName;
    if ("name" in field) return field.name;
  }
  return String(field);
}

export function AdminOverview() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [aiPayments, setAiPayments] = useState<AiPaymentItem[]>([]);
  const [aiRevenueTotal, setAiRevenueTotal] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [adminStats, registrations, races] = await Promise.all([
        dashboardApi.getAdminStats(),
        registrationsApi.list({ status: "PENDING", limit: 1 }),
        racesApi.list({ limit: 100 }),
      ]);

      type AdminStatsResponse = {
        users?: { total: number };
        tournaments?: { total: number };
        races?: { total: number };
      };
      
      const adminStatsTyped = adminStats as AdminStatsResponse;

      const usersTotal = adminStatsTyped.users?.total || 0;
      const tournamentsTotal = adminStatsTyped.tournaments?.total || 0;
      const racesTotal = adminStatsTyped.races?.total || 0;
      const pendingRegistrations = registrations.meta.total;

      const racesList = races.data || [];
      const liveRaces = racesList.filter((r) => r.status.toUpperCase() === "LIVE").length;
      const finishedRaces = racesList.filter((r) => r.status.toUpperCase() === "FINISHED").length;

      setData({
        usersTotal,
        tournamentsTotal,
        racesTotal,
        pendingRegistrations,
        liveRaces,
        finishedRaces,
        racesList,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    aiApi.listRevenue().then((items) => {
      const list = items ?? [];
      setAiPayments(list.slice(0, 5));
      setAiRevenueTotal(
        list.filter((p) => p.status === "SUCCESS").reduce((sum, p) => sum + p.amount, 0)
      );
    }).catch(() => {});
  }, [fetchData]);

  // Calculate KPI stats based on real data
  const statCards = data
    ? [
        {
          key: "pendingRegistrations",
          label: "Đăng ký chờ duyệt",
          value: data.pendingRegistrations.toString(),
          helper: "Cần admin xem xét",
          semantic: "danger" as StatCardSemantic,
          icon: ClipboardCheck,
          href: "/admin/registrations",
        },
        {
          key: "liveRaces",
          label: "Cuộc đua đang diễn ra",
          value: data.liveRaces.toString(),
          helper: "Giám sát hệ thống",
          semantic: "success" as StatCardSemantic,
          icon: Flag,
          href: "/admin/races",
        },
        {
          key: "finishedRaces",
          label: "Cuộc đua đã kết thúc",
          value: data.finishedRaces.toString(),
          helper: "Đang chờ xử lý kết quả",
          semantic: "warning" as StatCardSemantic,
          icon: CheckCircle,
          href: "/admin/results",
        },
        {
          key: "totalRaces",
          label: "Tổng cuộc đua",
          value: data.racesTotal.toString(),
          helper: "Toàn bộ hệ thống",
          semantic: "neutral" as StatCardSemantic,
          icon: Flag,
          href: "/admin/races",
        },
        {
          key: "totalTournaments",
          label: "Tổng giải đấu",
          value: data.tournamentsTotal.toString(),
          helper: "Đang và đã diễn ra",
          semantic: "neutral" as StatCardSemantic,
          icon: Trophy,
          href: "/admin/tournaments",
        },
        {
          key: "totalUsers",
          label: "Tổng người dùng",
          value: data.usersTotal.toString(),
          helper: "Tất cả vai trò",
          semantic: "neutral" as StatCardSemantic,
          icon: Users,
          href: "/admin/users",
        },
      ]
    : [];

  // Construct Attention items
  const attentionItems: AttentionItem[] = [];
  if (data) {
    if (data.pendingRegistrations > 0) {
      attentionItems.push({
        id: "att-pending-reg",
        severity: "critical",
        title: "Đăng ký chờ duyệt",
        description: `${data.pendingRegistrations} horse entries đang chờ admin xem xét.`,
        count: data.pendingRegistrations,
        actionLabel: "Duyệt ngay",
        actionHref: "/admin/registrations",
      });
    }
    if (data.liveRaces > 0) {
      attentionItems.push({
        id: "att-live-races",
        severity: "info",
        title: `${data.liveRaces} cuộc đua đang diễn ra`,
        description: "Cần giám sát race-control.",
        count: data.liveRaces,
        actionLabel: "Giám sát",
        actionHref: "/admin/races",
      });
    }
    if (data.finishedRaces > 0) {
      attentionItems.push({
        id: "att-finished-races",
        severity: "warning",
        title: `${data.finishedRaces} cuộc đua đã kết thúc`,
        description: "Chờ cập nhật hoặc công bố kết quả.",
        count: data.finishedRaces,
        actionLabel: "Xem cuộc đua",
        actionHref: "/admin/races",
      });
    }
  }

  const pendingCount = data?.pendingRegistrations ?? "0";

  return (
    <main className="space-y-5">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Admin / Dashboard</p>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {t("admin.overview.title", "Trung tâm Quản trị")}
            </h1>
            {loading && !data && <RefreshCw className="size-4 animate-spin text-muted-foreground" />}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("admin.overview.subtitle", "Giám sát giải đấu, cuộc đua và tình trạng hệ thống.")}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {error && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 mr-2">
              <AlertCircle className="size-3.5" />
              Lỗi tải dữ liệu
            </span>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors duration-150 hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            Làm mới
          </button>
          <Link
            href="/admin/registrations"
            className="inline-flex items-center gap-1.5 rounded-md border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 text-xs font-semibold text-yellow-300 transition-colors duration-150 hover:bg-yellow-400/15"
          >
            <ClipboardCheck className="size-3.5" />
            Duyệt đăng ký
            <span className="inline-flex min-w-4 items-center justify-center rounded bg-yellow-400/20 px-1 text-[10px] font-bold">
              {pendingCount}
            </span>
          </Link>
          <Link
            href="/admin/tournaments/new"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors duration-150 hover:bg-muted"
          >
            <Trophy className="size-3.5" />
            Tạo giải đấu
          </Link>
        </div>
      </div>

      {/* ── KPI Row — 6 cards ──────────────────────────────────────── */}
      <section aria-label="KPI tổng quan" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {loading && !data
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg border border-border bg-muted/20"
              />
            ))
          : statCards.map((stat) => (
              <Link href={stat.href} key={stat.key} className="block h-full">
                <StatCard
                  label={stat.label}
                  value={stat.value}
                  helper={stat.helper}
                  icon={stat.icon}
                  semantic={stat.semantic}
                  className="h-full hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-colors"
                />
              </Link>
            ))}
      </section>

      {/* ── Attention Center ───────────────────────────────────────── */}
      {!loading || data ? <AttentionCenter items={attentionItems} /> : null}

      {/* ── Main Grid: Quick Actions + Race Ops ───────────────────── */}
      <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
        <QuickActionGrid actions={quickActions} />
        <RaceOpsTable
          races={data?.racesList || []}
          isLoading={loading}
          error={error}
          onRefresh={fetchData}
        />
      </div>

      {/* ── AI Revenue Section ─────────────────────────────────────── */}
      <section aria-label="Doanh thu AI">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Doanh Thu AI</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="size-3.5 text-emerald-400" />
              <span className="font-mono font-bold text-emerald-400">{aiRevenueTotal.toLocaleString("vi-VN")} đ</span>
              <span className="text-muted-foreground/60">từ giao dịch thành công</span>
            </div>
            <Link href="/admin/ai/payments" className="text-xs font-semibold text-primary hover:underline">
              Xem tất cả →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {aiPayments.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              Chưa có giao dịch nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Người dùng</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Gói AI</th>
                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Số tiền (VND)</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Trạng thái</th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {aiPayments.map((p) => (
                    <tr key={p._id} className="hover:bg-muted transition-colors">
                      <td className="px-5 py-3.5 text-sm text-foreground">{getPaymentName(p.userId)}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{getPaymentName(p.packageId)}</td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-primary">{p.amount.toLocaleString("vi-VN")}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${statusColors[p.status] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString("vi-VN") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
