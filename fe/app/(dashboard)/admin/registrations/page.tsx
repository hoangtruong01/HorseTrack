"use client";

import { ClipboardCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { StatusBadge } from "@/components/ui/status-badge";
import { RegistrationTable } from "@/features/registrations/components/registration-table";
import { mockRegistrations } from "@/features/registrations/mock-registrations";

export default function AdminRegistrationsPage() {
  const { t } = useTranslation();
  const counts = mockRegistrations.reduce(
    (acc, registration) => {
      acc[registration.status] += 1;
      return acc;
    },
    { approved: 0, pending: 0, rejected: 0 },
  );

  return (
    <main className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5">
          <ClipboardCheck className="size-5 text-primary" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("pages.admin.registrations.pending")}
          </p>
          <p className="mt-2 font-mono text-4xl font-black dark:text-white text-foreground">
            {counts.pending}
          </p>
          <StatusBadge
            className="mt-3"
            label={t("pages.admin.registrations.needsReview")}
            tone="yellow"
            pulse
          />
        </div>
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("pages.admin.registrations.approved")}
          </p>
          <p className="mt-2 font-mono text-4xl font-black dark:text-white text-foreground">
            {counts.approved}
          </p>
          <StatusBadge className="mt-3" label={t("pages.admin.registrations.readyQueue")} tone="green" />
        </div>
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("pages.admin.registrations.rejected")}
          </p>
          <p className="mt-2 font-mono text-4xl font-black dark:text-white text-foreground">
            {counts.rejected}
          </p>
          <StatusBadge className="mt-3" label={t("pages.admin.registrations.reasonRequired")} tone="red" />
        </div>
      </section>
      <RegistrationTable registrations={mockRegistrations} />
    </main>
  );
}
