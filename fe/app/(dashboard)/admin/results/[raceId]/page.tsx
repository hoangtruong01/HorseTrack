import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ResultReviewPanel } from "@/features/results/components/result-review-panel";
import { getRaceResultById } from "@/features/results/mock-results";

export default async function AdminResultDetailPage({
  params,
}: {
  params: Promise<{ raceId: string }>;
}) {
  const { raceId } = await params;
  const result = getRaceResultById(raceId);

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Result review"
        title={result.race}
        description="Ranking preview, referee summary placeholder, publish state, and publish confirmation. Result belongs to this race only."
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin/results">All results</Link>
          </Button>
        }
      />
      <ResultReviewPanel result={result} />
    </main>
  );
}
