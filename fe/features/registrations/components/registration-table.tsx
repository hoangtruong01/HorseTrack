"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ApprovalDialog } from "@/features/registrations/components/approval-dialog";
import type {
  RaceRegistration,
  RegistrationStatus,
} from "@/features/registrations/mock-registrations";

const statusTone: Record<RegistrationStatus, "yellow" | "green" | "red"> = {
  pending: "yellow",
  approved: "green",
  rejected: "red",
};

const DEMO_ROW_LIMIT = 8;

export type RegistrationTableProps = {
  registrations: RaceRegistration[];
  limit?: number;
};

export function RegistrationTable({
  registrations,
  limit = DEMO_ROW_LIMIT,
}: RegistrationTableProps) {
  const { t } = useTranslation();
  const visibleRegistrations = registrations.slice(0, limit);
  const [selected, setSelected] = useState<RaceRegistration | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const openDialog = (
    registration: RaceRegistration,
    nextAction: "approve" | "reject",
  ) => {
    setSelected(registration);
    setAction(nextAction);
  };

  return (
    <section className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            {t("pages.admin.mockRegistrations.tableEyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight dark:text-white text-foreground">
            {t("pages.admin.mockRegistrations.tableTitle")}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("pages.admin.mockRegistrations.tableFooter", {
            shown: visibleRegistrations.length,
            total: registrations.length,
          })}
        </p>
      </div>
      <div className="mt-5 overflow-x-auto rounded-xl border dark:border-white/10 border-border">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="dark:bg-white/[0.04] bg-muted/50 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">{t("pages.admin.mockRegistrations.colHorse")}</th>
              <th className="px-4 py-3">{t("pages.admin.mockRegistrations.colOwner")}</th>
              <th className="px-4 py-3">{t("pages.admin.mockRegistrations.colRace")}</th>
              <th className="px-4 py-3">{t("pages.admin.mockRegistrations.colSubmitted")}</th>
              <th className="px-4 py-3">{t("pages.admin.mockRegistrations.colStatus")}</th>
              <th className="px-4 py-3">{t("pages.admin.mockRegistrations.colReviewNote")}</th>
              <th className="px-4 py-3">{t("pages.admin.mockRegistrations.colActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 dark:bg-black/10 bg-muted/20">
            {visibleRegistrations.map((registration) => (
              <tr
                key={registration.id}
                className="transition hover:dark:bg-white/[0.04] bg-muted/50"
              >
                <td className="px-4 py-4">
                  <p className="font-black uppercase dark:text-white text-foreground">
                    {registration.horse}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {registration.horseCode}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-bold dark:text-white/90 text-muted-foreground">
                    {registration.owner}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {registration.ownerEmail}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-bold dark:text-white/90 text-muted-foreground">{registration.race}</p>
                  <p className="text-xs text-muted-foreground">
                    {registration.tournament}
                  </p>
                </td>
                <td className="px-4 py-4 font-mono dark:text-white/80 text-muted-foreground">
                  {registration.submittedAt}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge
                    label={t(`pages.admin.mockRegistrations.status.${registration.status}`)}
                    tone={statusTone[registration.status]}
                    pulse={registration.status === "pending"}
                  />
                </td>
                <td className="max-w-[240px] px-4 py-4 text-muted-foreground">
                  {registration.reviewNote}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href={`/admin/registrations/${registration.id}`}>
                        {t("pages.admin.mockRegistrations.review")} <ArrowUpRight className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      className="rounded-full"
                      disabled={registration.status !== "pending"}
                      onClick={() => openDialog(registration, "approve")}
                      aria-label={`Approve ${registration.horse}`}
                    >
                      <CheckCircle2 className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="rounded-full"
                      disabled={registration.status !== "pending"}
                      onClick={() => openDialog(registration, "reject")}
                      aria-label={`Reject ${registration.horse}`}
                    >
                      <XCircle className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ApprovalDialog
        registration={selected}
        action={action}
        open={Boolean(selected && action)}
        onClose={() => {
          setSelected(null);
          setAction(null);
        }}
      />
    </section>
  );
}
