import { RoutePlaceholder } from "@/components/layout/route-placeholder";

export default function JockeyDashboardPage() {
  return (
    <RoutePlaceholder
      eyebrow="Jockey dashboard"
      title="Mobile action center"
      description="Jockey shell placeholder for assignment inbox and personal race schedule."
      cards={[
        { label: "Assignments", value: "Inbox later" },
        { label: "Schedule", value: "Mobile-first" },
        { label: "Actions", value: "Mock only" },
      ]}
    />
  );
}
