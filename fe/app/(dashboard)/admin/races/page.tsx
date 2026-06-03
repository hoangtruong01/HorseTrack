"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { RaceCard } from "@/features/races/components/race-card";
import { RaceTable } from "@/features/races/components/race-table";
import { mockRaces } from "@/features/races/mock-races";

export default function AdminRacesPage() {
  const { t } = useTranslation();
  const liveRace =
    mockRaces.find((race) => race.status === "live") ?? mockRaces[0];

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow={t("pages.admin.races.eyebrow")}
        title={t("pages.admin.races.title")}
        description={t("pages.admin.races.description")}
        actions={
          <Button asChild className="rounded-full">
            <Link href="/admin/races/new">
              {t("pages.admin.races.createRace")} <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <RaceCard race={liveRace} />
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("pages.admin.races.statusStack")}
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase dark:text-white text-foreground">
            {t("pages.admin.races.statusTitle")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {t("pages.admin.races.statusDesc")}
          </p>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {mockRaces.map((race) => (
          <RaceCard key={race.id} race={race} />
        ))}
      </section>
      <RaceTable races={mockRaces} />
    </main>
  );
}
