import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default async function PublicTournamentDetailPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const { tournamentId } = await params;

  return (
    <RoutePlaceholder
      eyebrow="Public tournament detail"
      title={`Tournament ${tournamentId}`}
      description="Container detail placeholder. Later phases list independent races inside this tournament."
      cards={[
        { label: "Tournament role", value: "Container" },
        { label: "Race list", value: "Deferred" },
        { label: "Mock id", value: tournamentId },
      ]}
      ctaHref="/tournaments"
      ctaLabel="Back to tournaments"
    />
  );
}
