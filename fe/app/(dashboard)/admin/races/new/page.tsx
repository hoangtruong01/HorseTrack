"use client";
import Image from "next/image";

import Link from "next/link";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { RaceForm } from "@/features/races/components/race-form";

export default function NewAdminRacePage() {
  return (
    <main className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Tạo trận đua"
        title="Khởi Tạo Trận Đua Mới"
        description="Thiết lập lịch trình, cự ly, bề mặt đường đua và phân bổ giải thưởng cho một vòng đua thuộc giải đấu chính."
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin/races">Quay lại danh sách</Link>
          </Button>
        }
      />
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
        </div>
      }>
        <RaceForm />
      </Suspense>
    </main>
  );
}
