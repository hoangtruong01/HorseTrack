import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TournamentForm } from "@/features/tournaments/components/tournament-form";

export default function NewAdminTournamentPage() {
  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Tạo giải đấu"
        title="Thiết lập giải đấu mới"
        description="Điền thông tin bên dưới để tạo một giải đấu mới. Giải đấu sẽ khởi tạo ở trạng thái nháp (DRAFT)."
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin">Quay lại Dashboard</Link>
          </Button>
        }
      />
      <TournamentForm />
    </main>
  );
}
