import { PageHeader } from "@/components/layout/page-header";
import { RefereeActionCenter } from "@/features/referee-reports/components/referee-action-center";
import {
  assignedRaces,
  refereeProfile,
} from "@/features/referee-reports/mock-referee-data";

export default function RefereeDashboardPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Referee dashboard"
        title="Race desk"
        description="Tablet-first referee action center for assigned races, checklists, violations, and mock result entry. No backend calls."
      />
      <RefereeActionCenter
        assignments={assignedRaces}
        profile={refereeProfile}
      />
    </main>
  );
}
