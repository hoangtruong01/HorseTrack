"use client";

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
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi thêm chiến mã.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/owner/horses"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition mb-3"
        >
          <ChevronLeft className="size-4" /> Quay lại chuồng ngựa
        </Link>
        
        <PageHeader
          eyebrow="Đăng ký hồ sơ"
          title="Thêm Chiến Mã Mới"
          description="Khai báo thông số kỹ thuật của ngựa đua để lưu trữ trong danh mục. Hồ sơ này được sử dụng để kiểm duyệt điều kiện thi đấu."
        />
      </div>

      <section className="mt-4">
        <HorseForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/owner/horses")}
          isSubmitting={isSubmitting}
        />
      </section>
    </main>
  );
}
