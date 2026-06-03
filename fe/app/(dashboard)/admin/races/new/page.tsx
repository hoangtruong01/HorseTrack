"use client";

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
          <Button asChild variant="outline" className="rounded-full border-white/10 hover:bg-white/5 text-white">
            <Link href="/admin/races">Quay lại danh sách</Link>
          </Button>
        }
      />
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      }>
        <RaceForm />
      </Suspense>
    </main>
  );
}
