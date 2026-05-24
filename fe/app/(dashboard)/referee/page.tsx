import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function RefereeDashboardPage() {
  return (
    <RoutePlaceholder
      eyebrow="Referee dashboard"
      title="Race desk"
      description="Referee shell placeholder for assigned races, checklists, violations, and race result confirmation."
      cards={[
        { label: "Assigned races", value: "Tablet shell" },
        { label: "Result entry", value: "Deferred" },
        { label: "Reports", value: "Later" },
      ]}
    />
  );
}
