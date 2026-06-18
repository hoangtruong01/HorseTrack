"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ApprovalDialog } from "@/features/registrations/components/approval-dialog";
import type {
  RaceRegistration,
  RegistrationStatus,
} from "@/features/registrations/mock-registrations";

const meta: Record<
  RegistrationStatus,
  { label: string; tone: "yellow" | "green" | "red" | "slate" }
> = {
  pending:   { label: "Chờ duyệt",  tone: "yellow" },
  approved:  { label: "Đã duyệt",   tone: "green" },
  rejected:  { label: "Từ chối",    tone: "red" },
  cancelled: { label: "Đã hủy",     tone: "slate" },
  withdrawn: { label: "Đã rút",     tone: "slate" },
};

const DEMO_ROW_LIMIT = 8;

export type RegistrationTableProps = {
  registrations: RaceRegistration[];
  limit?: number;
  onRefresh?: () => void;
};

export function RegistrationTable({
  registrations,
  limit = DEMO_ROW_LIMIT,
  onRefresh,
}: RegistrationTableProps) {
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
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Registration queue
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-foreground">
            Admin moderation board
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Đang hiển thị {visibleRegistrations.length}/{registrations.length} đơn đăng ký
        </p>
      </div>
      <div className="mt-5 overflow-x-auto rounded-xl border border-border">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="bg-muted/[0.04] text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Horse</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Race</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Review note</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-muted/[0.02]">
            {visibleRegistrations.map((registration) => (
              <tr
                key={registration.id}
                className="transition hover:bg-muted/[0.04]"
              >
                <td className="px-4 py-4">
                  <p className="font-black uppercase text-foreground">
                    {registration.horse}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {registration.horseCode}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-bold text-foreground/90">
                    {registration.owner}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {registration.ownerEmail}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-bold text-foreground/90">{registration.race}</p>
                  <p className="text-xs text-muted-foreground">
                    {registration.tournament}
                  </p>
                </td>
                <td className="px-4 py-4 font-mono text-foreground/80">
                  {registration.submittedAt}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge
                    label={meta[registration.status].label}
                    tone={meta[registration.status].tone}
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
                        Review <ArrowUpRight className="size-4" />
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
        onSuccess={() => {
          setSelected(null);
          setAction(null);
          onRefresh?.();
        }}
      />
    </section>
  );
}
