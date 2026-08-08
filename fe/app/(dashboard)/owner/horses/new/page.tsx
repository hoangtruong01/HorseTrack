"use client";
/**
 * ====================================================================
 * CHỨC NĂNG: ĐĂNG KÝ CHIẾN MÃ MỚI (ADD NEW HORSE)
 * QUYỀN SỬ DỤNG: OWNER (CHỦ NGỰA)
 * MÔ TẢ:
 * - Cung cấp biểu mẫu để chủ ngựa khai báo thông tin của chiến mã mới (tên, giống, tuổi, cân nặng...).
 * - Gửi dữ liệu qua API để lưu trữ thông tin ngựa đua trong chuồng ngựa của chủ sở hữu.
 * ====================================================================
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { HorseForm } from "@/features/horses/components/horse-form";
import { toast } from "sonner";

export default function NewHorsePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // CHỨC NĂNG: Xử lý gửi dữ liệu Form (thông tin ngựa, ảnh) qua API để thêm ngựa mới
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/owner/horses", {
        method: "POST",
        body: formData,
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Tạo chiến mã mới thất bại.");
      }

      toast.success("Chiến mã đã được thêm vào chuồng thành công!");
      router.push("/owner/horses");
    } catch (err) {
      toast.error((err as Error).message || "Đã xảy ra lỗi khi thêm chiến mã.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="space-y-6 max-w-4xl mx-auto">
      <div>
        {/* NÚT QUAY LẠI: Quay về danh sách chiến mã của chủ sở hữu */}
        <Link
          href="/owner/horses"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition mb-3"
        >
          <ChevronLeft className="size-4" /> Quay lại chuồng ngựa
        </Link>
        
        {/* TIÊU ĐỀ TRANG: Hướng dẫn khai báo chiến mã */}
        <PageHeader
          eyebrow="Đăng ký hồ sơ"
          title="Thêm Chiến Mã Mới"
          description="Khai báo thông số kỹ thuật của ngựa đua để lưu trữ trong danh mục. Hồ sơ này được sử dụng để kiểm duyệt điều kiện thi đấu."
        />
      </div>

      <section className="mt-4">
        {/* BIỂU MẪU ĐĂNG KÝ: Chứa các trường nhập thông tin như tên, tuổi, cân nặng, hình ảnh ngựa */}
        <HorseForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/owner/horses")}
          isSubmitting={isSubmitting}
        />
      </section>
    </main>
  );
}
