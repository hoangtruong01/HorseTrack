import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";

export default function Loading() {
  return (
    <main className="f1-container py-10">
      <LoadingSkeleton rows={3} />
    </main>
  );
}
