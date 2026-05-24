import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { RaceForm } from "@/features/races/components/race-form";

export default function NewAdminRacePage() {
  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Create race"
        title="New race setup"
        description="Mock-first race creation UI for schedule, course, capacity, and referee planning. No backend submit."
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin/races">Back to races</Link>
          </Button>
        }
      />
      <RaceForm />
    </main>
  );
}
