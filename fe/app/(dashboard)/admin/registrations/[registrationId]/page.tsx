import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { RegistrationReviewPanel } from "@/features/registrations/components/registration-review-panel";
import { getRegistrationById } from "@/features/registrations/mock-registrations";

export default async function AdminRegistrationDetailPage({
  params,
}: {
  params: Promise<{ registrationId: string }>;
}) {
  const { registrationId } = await params;
  const registration = getRegistrationById(registrationId);

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Registration review"
        title={registration.horse}
        description="Single registration moderation panel with eligibility snapshot, note placeholder, approve/reject dialogs, and audit-style mock trail."
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin/registrations">All registrations</Link>
          </Button>
        }
      />
      <RegistrationReviewPanel registration={registration} />
    </main>
  );
}
