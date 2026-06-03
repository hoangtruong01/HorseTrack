"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { RaceForm } from "@/features/races/components/race-form";

export default function NewAdminRacePage() {
  const { t } = useTranslation();

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow={t("pages.admin.racesNew.eyebrow")}
        title={t("pages.admin.racesNew.title")}
        description={t("pages.admin.racesNew.description")}
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin/races">{t("pages.admin.racesNew.backToRaces")}</Link>
          </Button>
        }
      />
      <RaceForm />
    </main>
  );
}
