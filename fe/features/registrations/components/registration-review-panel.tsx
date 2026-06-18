"use client";

import { ClipboardCheck, ShieldAlert, Trophy } from "lucide-react";
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

export type RegistrationReviewPanelProps = { registration: RaceRegistration };

export function RegistrationReviewPanel({
  registration,
}: RegistrationReviewPanelProps) {
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-lg sm:p-6 lg:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(225,6,0,0.1),transparent_38%),radial-gradient(circle_at_82%_18%,rgba(6,126,106,0.08),transparent_26rem)] dark:bg-[linear-gradient(120deg,rgba(225,6,0,0.22),transparent_38%),radial-gradient(circle_at_82%_18%,rgba(6,126,106,0.2),transparent_26rem)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <StatusBadge
              label={meta[registration.status].label}
              tone={meta[registration.status].tone}
              pulse={registration.status === "pending"}
            />
            <h1 className="mt-5 text-3xl font-black uppercase leading-tight tracking-tight text-foreground sm:text-5xl">
              {registration.horse}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Controlled registration moderation view: owner identity, race
              target, eligibility snapshot, notes placeholder, approval trail.
            </p>
          </div>
          <div className="grid gap-3 rounded-2xl border border-border bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <Trophy className="size-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Tournament
                </p>
                <p className="font-black text-foreground">{registration.tournament}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ClipboardCheck className="size-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Race
                </p>
                <p className="font-black text-foreground">{registration.race}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldAlert className="size-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Eligibility
                </p>
                <p className="font-black text-foreground">Review required</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Registration detail
          </p>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Horse</dt>
              <dd className="font-black uppercase text-foreground">
                {registration.horse} · {registration.horseCode}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Owner</dt>
              <dd className="font-bold text-foreground">{registration.owner}</dd>
              <dd className="text-muted-foreground">
                {registration.ownerEmail}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tournament</dt>
              <dd className="font-bold text-foreground">
                {registration.tournament}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Race</dt>
              <dd className="font-bold text-foreground">
                {registration.race}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Submitted</dt>
              <dd className="font-mono font-bold text-foreground">
                {registration.submittedAt}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Eligibility snapshot</dt>
              <dd className="font-bold text-foreground">
                {registration.eligibility}
              </dd>
            </div>
          </dl>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Review notes
          </p>
          <label
            className="mt-4 block text-sm font-bold text-foreground"
            htmlFor="review-note"
          >
            Admin note placeholder
          </label>
          <textarea
            id="review-note"
            className="mt-2 min-h-32 w-full rounded-xl border border-border bg-muted/50 p-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="Add internal moderation note. Mock-only; not saved."
            defaultValue={registration.reviewNote}
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              className="min-h-11 rounded-full"
              disabled={registration.status !== "pending"}
              onClick={() => setAction("approve")}
            >
              Approve registration
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11 rounded-full"
              disabled={registration.status !== "pending"}
              onClick={() => setAction("reject")}
            >
              Reject with reason
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
          Moderation trail
        </p>
        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          {registration.adminTrail.map((item) => (
            <li
              key={item}
              className="rounded-xl border border-border bg-muted/50 p-4 text-sm font-bold text-foreground"
            >
              {item}
            </li>
          ))}
        </ol>
      </section>

      <ApprovalDialog
        registration={registration}
        action={action}
        open={Boolean(action)}
        onClose={() => setAction(null)}
        onSuccess={() => {
          setAction(null);
          window.location.href = "/admin/registrations";
        }}
      />
    </div>
  );
}
