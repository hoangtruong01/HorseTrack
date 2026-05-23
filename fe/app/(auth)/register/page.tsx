import Link from "next/link";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <EmptyState
      title="Register shell"
      description="Role-aware registration UI is deferred to Phase 3. No account creation, no backend call."
      action={
        <Button
          asChild
          className="rounded-full bg-primary font-bold hover:bg-[#B80500]"
        >
          <Link href="/login">View login shell</Link>
        </Button>
      }
    />
  );
}
