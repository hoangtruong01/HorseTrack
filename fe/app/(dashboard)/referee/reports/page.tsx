import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { RefereeReportSummary } from "@/features/referee-reports/components/referee-report-summary";
import { mockRefereeReports } from "@/features/referee-reports/mock-referee-data";

export default function RefereeReportsPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Referee reports"
        title="Report summary"
        description="Race, referee, checks, violations, and result confirmation status in one review queue."
        actions={
          <Button asChild className="h-11 rounded-full">
            <Link href="/referee/assignments">
              Assignments <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />
      <section className="space-y-4">
        {mockRefereeReports.map((report) => (
          <div key={report.raceId} className="space-y-3">
            <RefereeReportSummary report={report} />
            <Button asChild variant="outline" className="h-11 rounded-full">
              <Link href={`/referee/races/${report.raceId}`}>
                Open race workflow <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        ))}
      </section>
    </main>
  );
}
