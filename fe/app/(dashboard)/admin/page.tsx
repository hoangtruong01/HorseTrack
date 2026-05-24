import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function AdminDashboardPage() {
  return (
    <RoutePlaceholder
      eyebrow="Admin dashboard"
      title="Race control overview"
      description="Admin shell placeholder for tournament containers, independent races, registrations, and result publishing."
      cards={[
        { label: "Races", value: "12 mock" },
        { label: "Registrations", value: "Pending" },
        { label: "Results", value: "Per race" },
      ]}
      ctaHref="/races"
      ctaLabel="View public races"
    />
  );
}
