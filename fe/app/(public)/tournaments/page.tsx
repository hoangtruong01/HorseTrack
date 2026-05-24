import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function PublicTournamentsPage() {
  return (
    <RoutePlaceholder
      eyebrow="Public shell"
      title="Tournaments"
      description="Published tournament containers will live here. Phase 2 only confirms the public route shell."
      cards={[
        { label: "Mock containers", value: "3" },
        { label: "Race-first links", value: "Ready" },
        { label: "Backend", value: "Off" },
      ]}
      ctaHref="/races"
      ctaLabel="Browse races"
    />
  );
}
