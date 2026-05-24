import Link from "next/link";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="f1-container flex min-h-screen items-center py-10">
      <EmptyState
        title="Route not found"
        description="This shell only exposes Phase 2 public, auth, and role dashboard entry routes."
        action={
          <Button
            asChild
            className="rounded-full bg-primary font-bold hover:bg-[#B80500]"
          >
            <Link href="/">Back home</Link>
          </Button>
        }
      />
    </main>
  );
}
