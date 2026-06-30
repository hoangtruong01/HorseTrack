import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <main className="f1-container flex min-h-screen items-center py-10">
      <EmptyState
        icon={<ShieldAlert className="size-8" aria-hidden="true" />}
        title="Truy cập bị từ chối"
        description="Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản có quyền phù hợp."
        action={
          <Button
            asChild
            className="rounded-full bg-primary font-bold hover:bg-[#B80500]"
          >
            <Link href="/login">Quay lại trang đăng nhập</Link>
          </Button>
        }
      />
    </main>
  );
}
