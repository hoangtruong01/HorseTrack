import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { RaceCard } from "@/features/races/components/race-card";
import { assignedRaces } from "@/features/referee-reports/mock-referee-data";

export default function RefereeAssignmentsPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Assigned races"
        title="Referee assignment board"
        description="All assigned races remain independent. Open checklist, violation log, or result entry per race."
      />
      <section className="grid gap-4 lg:grid-cols-2">
        {assignedRaces.map((assignment) => (
          <article
            key={assignment.race.id}
            className="rounded-2xl border border-white/10 bg-[#15151E]/85 p-4"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <StatusBadge
                label={assignment.callout}
                tone={
                  assignment.priority === "now"
                    ? "red"
                    : assignment.priority === "next"
                      ? "yellow"
                      : assignment.priority === "closed"
                        ? "teal"
                        : "green"
                }
                pulse={assignment.priority === "now"}
              />
              <Button asChild variant="outline" className="h-11 rounded-full">
                <Link href={`/referee/races/${assignment.race.id}`}>
                  Open workflow <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <RaceCard race={assignment.race} />
          </article>
        ))}
      </section>
    </main>
  );
}
