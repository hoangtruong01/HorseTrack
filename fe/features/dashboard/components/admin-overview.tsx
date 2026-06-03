"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Activity, ArrowRight, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { StatCard } from "@/components/data-display/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { QuickActionGrid } from "@/features/dashboard/components/quick-action-grid";
import { RaceStatusOverview } from "@/features/dashboard/components/race-status-overview";
import {
  adminActivities,
  adminStats,
  quickActions,
  raceStatusCounts,
  raceSummaries,
} from "@/features/dashboard/mock-admin-dashboard";

const quickActionKeys = [
  "createTournament",
  "createRace",
  "reviewRegistrations",
  "reviewResults",
] as const;

const statKeys = [
  "tournaments",
  "races",
  "liveRaces",
  "pendingRegistrations",
  "upcomingRaces",
  "resultsWaiting",
] as const;

const activityKeys = ["act01", "act02", "act03"] as const;

export function AdminOverview() {
  const { t } = useTranslation();

  const translatedStats = useMemo(
    () =>
      adminStats.map((stat, index) => ({
        ...stat,
        label: t(`admin.stats.${statKeys[index]}.label`),
        helper: t(`admin.stats.${statKeys[index]}.helper`),
        trend: t(`admin.stats.${statKeys[index]}.trend`),
      })),
    [t],
  );

  const translatedQuickActions = useMemo(
    () =>
      quickActions.map((action, index) => ({
        ...action,
        title: t(`admin.quickActionsItems.${quickActionKeys[index]}.title`),
        description: t(`admin.quickActionsItems.${quickActionKeys[index]}.description`),
        label: t(`admin.quickActionsItems.${quickActionKeys[index]}.label`),
      })),
    [t],
  );

  const translatedActivities = useMemo(
    () =>
      adminActivities.map((item, index) => ({
        ...item,
        title: t(`admin.activity.items.${activityKeys[index]}.title`),
        description: t(`admin.activity.items.${activityKeys[index]}.description`),
      })),
    [t],
  );

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow={t("admin.overview.systemOverview")}
        title={t("admin.overview.title")}
        description={t("admin.overview.subtitle")}
        actions={
          <>
            <Button asChild className="rounded-full">
              <Link href="/admin/races/new">
                {t("admin.actions.createRace")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/admin/registrations">{t("admin.actions.reviewQueue")}</Link>
            </Button>
          </>
        }
      />

      <section className="relative overflow-hidden rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E] bg-card p-5 shadow-[0_22px_70px_rgba(0,0,0,0.34)] sm:p-6 lg:p-8">
        <div className="absolute inset-0 dark:bg-[linear-gradient(120deg,rgba(225,6,0,0.22),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(6,126,106,0.2),transparent_28rem)] bg-card" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="relative grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div>
            <p className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {t("admin.hero.badge")}
            </p>
            <h2 className="mt-5 max-w-4xl text-3xl font-black uppercase leading-tight tracking-tight dark:text-white text-foreground sm:text-5xl">
              {t("admin.overview.title")}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {t("admin.overview.subtitle")}
            </p>
          </div>
          <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-black/25 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-primary/40 bg-primary/10 p-3 text-primary">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {t("admin.hero.scopeGuard")}
                </p>
                <p className="mt-1 text-sm font-semibold dark:text-white text-foreground">
                  {t("admin.hero.scopeGuardDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {translatedStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <QuickActionGrid actions={translatedQuickActions} />

      <RaceStatusOverview races={raceSummaries} counts={raceStatusCounts} />

      <section className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/80 bg-card p-4 shadow-[0_18px_56px_rgba(0,0,0,0.24)] sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              {t("admin.activity.eyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-tight dark:text-white text-foreground">
              {t("admin.activity.title")}
            </h2>
          </div>
          <Activity
            className="size-5 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <div className="mt-5 divide-y divide-white/10 rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50">
          {translatedActivities.map((item) => (
            <article
              key={item.id}
              className="grid gap-3 p-4 sm:grid-cols-[5rem_1fr]"
            >
              <time className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {item.time}
              </time>
              <div>
                <h3 className="font-bold dark:text-white text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
