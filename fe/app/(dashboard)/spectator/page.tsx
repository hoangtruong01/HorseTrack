import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function SpectatorDashboardPage() {
  return (
    <RoutePlaceholder
      eyebrow="Spectator dashboard"
      title="Race view hub"
      description="Spectator shell placeholder for race browsing, prediction status, and notification handoff."
      cards={[
        { label: "Public race data", value: "Ready" },
        { label: "Prediction", value: "Deferred" },
        { label: "Payment", value: "Out" },
      ]}
      ctaHref="/races"
      ctaLabel="Browse public races"
    />
  );
}
