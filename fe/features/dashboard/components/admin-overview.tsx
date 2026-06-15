"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ClipboardCheck, Trophy, Users, AlertCircle, RefreshCw, Flag, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { StatCard } from "@/components/data-display/stat-card";
import { AttentionCenter, AttentionItem } from "@/features/dashboard/components/attention-center";
import { QuickActionGrid } from "@/features/dashboard/components/quick-action-grid";
import { RaceOpsTable } from "@/features/dashboard/components/race-ops-table";
import { quickActions } from "@/features/dashboard/mock-admin-dashboard";

import { cn } from "@/lib/utils";
import { dashboardApi, registrationsApi, racesApi, RaceItem } from "@/lib/api-client";
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

export function AdminOverview() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

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
    </main>
  );
}
