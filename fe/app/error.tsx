"use client";

import { ErrorState } from "@/components/feedback/error-state";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="f1-container flex min-h-screen items-center py-10">
      <ErrorState reset={reset} />
    </main>
  );
}
