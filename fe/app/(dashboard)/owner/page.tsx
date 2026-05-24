import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function OwnerDashboardPage() {
  return (
    <RoutePlaceholder
      eyebrow="Owner dashboard"
      title="Stable operations"
      description="Owner shell placeholder for horses, race registration, and jockey assignment handoff."
      cards={[
        { label: "Horses", value: "Portfolio later" },
        { label: "Open races", value: "Mock only" },
        { label: "Registration", value: "Deferred" },
      ]}
    />
  );
}
