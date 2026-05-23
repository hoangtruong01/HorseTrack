import Link from "next/link";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <EmptyState
      title="Login shell"
      description="Mock-first auth route only. Real form, validation, session hydrate, and role redirect are Phase 3."
      action={
        <Button
          asChild
          className="rounded-full bg-primary font-bold hover:bg-[#B80500]"
        >
          <Link href="/register">View register shell</Link>
        </Button>
      }
    />
  );
}
