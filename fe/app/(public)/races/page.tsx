import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function PublicRacesPage() {
  return (
    <RoutePlaceholder
      eyebrow="Public shell"
      title="Races"
      description="Race discovery shell with upcoming, live, and published-result placeholders. No live tracking yet."
      cards={[
        { label: "Upcoming", value: "4 mock" },
        { label: "Live", value: "1 mock" },
        { label: "Result scope", value: "Per race" },
      ]}
      ctaHref="/races/race-01"
      ctaLabel="Open mock race"
    />
  );
}
