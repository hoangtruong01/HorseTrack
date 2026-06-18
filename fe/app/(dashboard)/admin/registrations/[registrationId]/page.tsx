"use client";
import Image from "next/image";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { RegistrationReviewPanel } from "@/features/registrations/components/registration-review-panel";
import { registrationsApi } from "@/lib/api-client";
import type { RaceRegistration, RegistrationStatus } from "@/features/registrations/mock-registrations";
import { toast } from "sonner";

export default function AdminRegistrationDetailPage() {
  const params = useParams();
  const registrationId = params?.registrationId as string;
  const [registration, setRegistration] = useState<RaceRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    if (!registrationId) return;
    setIsLoading(true);
    try {
      const item = await registrationsApi.get(registrationId);
      
      const statusVal = item.status || "PENDING";
      const statusLower = statusVal.toLowerCase();
      
      let statusMapped: RegistrationStatus = "pending";
      if (statusLower === "approved")  statusMapped = "approved";
      if (statusLower === "rejected")  statusMapped = "rejected";
      if (statusLower === "cancelled") statusMapped = "cancelled";
      if (statusLower === "withdrawn") statusMapped = "withdrawn";

      const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
      const formattedDate = createdDate.toLocaleDateString("vi-VN") + " · " + createdDate.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });

      setRegistration({
        id: item._id,
        horse: (typeof item.horseId === "object" ? item.horseId?.name : null) || "Không rõ chiến mã",
        horseCode: (typeof item.horseId === "object" ? item.horseId?.breed : null) || "HB-00",
        owner: (typeof item.ownerId === "object" ? item.ownerId?.fullName : null) || "Không rõ chủ ngựa",
        ownerEmail: (typeof item.ownerId === "object" ? item.ownerId?.email : null) || "",
        raceId: (typeof item.raceId === "object" ? item.raceId?._id : item.raceId) || "",
        race: (typeof item.raceId === "object" ? item.raceId?.name : null) || "Không rõ vòng đua",
        tournament: (typeof item.tournamentId === "object" ? item.tournamentId?.name : null) || "Không rõ giải đấu",
        submittedAt: formattedDate,
        status: statusMapped,
        eligibility: `Trạng thái thực tế: ${statusVal}. ${item.note || ""}`,
        reviewNote: item.rejectedReason || "Không có ghi chú từ chối.",
        adminTrail: [
          "Đã nộp hồ sơ",
          item.approvedAt ? `Được duyệt vào ${new Date(item.approvedAt).toLocaleString("vi-VN")}` : "Chờ duyệt",
        ],
      });
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Lỗi khi tải chi tiết hồ sơ đăng ký.");
    } finally {
      setIsLoading(false);
    }
  }, [registrationId]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
        <p className="mt-4 text-xs font-mono uppercase tracking-widest font-bold">Đang tải chi tiết hồ sơ...</p>
      </div>
    );
  }

  if (!registration) {
    return (
      <main className="space-y-6 text-center py-20">
        <p className="text-muted-foreground">Không tìm thấy hồ sơ đăng ký này hoặc đã bị xóa.</p>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/admin/registrations">Quay lại danh sách</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Chi tiết hồ sơ đăng ký"
        title={registration.horse}
        description="Bảng thẩm định chi tiết hồ sơ đăng ký tham gia thi đấu của ngựa chiến."
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin/registrations">Tất cả đăng ký</Link>
          </Button>
        }
      />
      <RegistrationReviewPanel registration={registration} />
    </main>
  );
}
