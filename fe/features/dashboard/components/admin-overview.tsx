"use client";

import Link from "next/link";
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

export function AdminOverview() {
  const { t } = useTranslation();
  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow={t("admin.hero.badge")}
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

      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6 lg:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(225,6,0,0.22),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(6,126,106,0.2),transparent_28rem)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="relative grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div>
         <p className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {t("admin.hero.badge")}
            </p>
            <h2 className="mt-5 max-w-4xl text-3xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-5xl">
              {t("admin.hero.title")}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {t("admin.hero.description")}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-primary/40 bg-primary/10 p-3 text-primary">
                <ShieldCheck className="size-6" />
              </div>
              <div>
               <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                   {t("admin.hero.scopeGuard")}
                 </p>
                 <p className="mt-1 text-sm font-semibold text-foreground">
                   {t("admin.hero.scopeGuardDesc")}
                 </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {adminStats.map((stat) => {
          const { key, ...rest } = stat;
          return (
            <StatCard
              key={key}
              {...rest}
              label={t(`admin.stats.${key}.label`)}
              helper={t(`admin.stats.${key}.helper`)}
              trend={t(`admin.stats.${key}.trend`)}
            />
          );
        })}
      </section>

      <QuickActionGrid actions={quickActions} />

      <RaceStatusOverview races={raceSummaries} counts={raceStatusCounts} />

      <section className="rounded-2xl border border-border bg-card/80 p-4 shadow-xl sm:p-6">
         <div className="flex items-center justify-between gap-4">
           <div>
             <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
               {t("admin.activity.eyebrow")}
             </p>
             <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-foreground">
               {t("admin.activity.title")}
             </h2>
           </div>
          <Activity
            className="size-5 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <div className="mt-5 divide-y divide-border rounded-xl border border-border bg-muted/30">
          {adminActivities.map((item) => (
            <article
              key={item.id}
              className="grid gap-3 p-4 sm:grid-cols-[5rem_1fr]"
            >
              <time className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {item.time}
              </time>
              <div>
                <h3 className="font-bold text-foreground">
                  {t(`admin.activity.items.${item.key}.title`)}
                </h3>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {t(`admin.activity.items.${item.key}.description`)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
