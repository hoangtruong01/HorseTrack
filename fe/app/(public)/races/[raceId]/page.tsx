import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default async function PublicRaceDetailPage({
  params,
}: {
  params: Promise<{ raceId: string }>;
}) {
  const { raceId } = await params;

  return (
    <RoutePlaceholder
      eyebrow="Public race detail"
      title={`Race ${raceId}`}
      description="Public-only race detail placeholder. Future UI shows public schedule, status, participants, and published race result."
      cards={[
        { label: "Race unit", value: "Independent" },
        { label: "Prediction", value: "Login CTA later" },
        { label: "Mock id", value: raceId },
      ]}
      ctaHref="/races"
      ctaLabel="Back to races"
    />
  );
}
