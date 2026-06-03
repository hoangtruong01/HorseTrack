"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { TournamentForm } from "@/features/tournaments/components/tournament-form";

export default function NewAdminTournamentPage() {
  const { t } = useTranslation();

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow={t("pages.admin.tournamentsNew.eyebrow")}
        title={t("pages.admin.tournamentsNew.title")}
        description={t("pages.admin.tournamentsNew.description")}
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin">{t("pages.admin.tournamentsNew.backToDashboard")}</Link>
          </Button>
        }
      />
      <TournamentForm />
    </main>
  );
}
