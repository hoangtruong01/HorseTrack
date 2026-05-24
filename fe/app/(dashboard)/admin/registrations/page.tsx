import { ClipboardCheck } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { RegistrationTable } from "@/features/registrations/components/registration-table";
import { mockRegistrations } from "@/features/registrations/mock-registrations";

export default function AdminRegistrationsPage() {
  const counts = mockRegistrations.reduce(
    (acc, registration) => {
      acc[registration.status] += 1;
      return acc;
    },
    { approved: 0, pending: 0, rejected: 0 },
  );

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Registration approval"
        title="Race registration moderation"
        description="Review horse, owner, race target, submission time, and mock eligibility notes before approving or rejecting. FE-first; no backend calls."
      />
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#15151E]/85 p-5">
          <ClipboardCheck className="size-5 text-primary" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Pending
          </p>
          <p className="mt-2 font-mono text-4xl font-black text-white">
            {counts.pending}
          </p>
          <StatusBadge
            className="mt-3"
            label="Needs review"
            tone="yellow"
            pulse
          />
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#15151E]/85 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Approved
          </p>
          <p className="mt-2 font-mono text-4xl font-black text-white">
            {counts.approved}
          </p>
          <StatusBadge className="mt-3" label="Ready queue" tone="green" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#15151E]/85 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Rejected
          </p>
          <p className="mt-2 font-mono text-4xl font-black text-white">
            {counts.rejected}
          </p>
          <StatusBadge className="mt-3" label="Reason required" tone="red" />
        </div>
      </section>
      <RegistrationTable registrations={mockRegistrations} />
    </main>
  );
}
