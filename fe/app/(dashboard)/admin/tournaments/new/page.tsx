/**
 * ====================================================================
 * CHỨC NĂNG: TẠO GIẢI ĐẤU MỚI (CREATE TOURNAMENT)
 * QUYỀN SỬ DỤNG: ADMIN
 * MÔ TẢ:
 * - Cung cấp giao diện biểu mẫu (Form) để Admin điền thông tin thiết lập một giải đấu mới.
 * - Giải đấu sau khi tạo thành công sẽ ở trạng thái Nháp (DRAFT).
 * ====================================================================
 */
import Link from "next/link";


import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TournamentForm } from "@/features/tournaments/components/tournament-form";

export default function NewAdminTournamentPage() {
  return (
    <main className="space-y-6">
      {/* TIÊU ĐỀ TRANG: Thiết lập thông tin giải đấu và nút quay lại dashboard */}
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
      {/* FORM NHẬP LIỆU: Biểu mẫu điền thông tin chi tiết và gửi dữ liệu tạo giải đấu */}
      <TournamentForm />
    </main>
  );
}
