import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <main className="f1-container flex min-h-screen items-center py-10">
      <EmptyState
        icon={<ShieldAlert className="size-8" aria-hidden="true" />}
        title="Forbidden placeholder"
        description="Real RBAC is intentionally deferred. This route documents the future 403 destination."
        action={
          <Button
            asChild
            className="rounded-full bg-primary font-bold hover:bg-[#B80500]"
          >
            <Link href="/login">Go to mock login</Link>
          </Button>
        }
      />
    </main>
  );
}
