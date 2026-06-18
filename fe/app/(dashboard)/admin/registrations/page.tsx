"use client";
import Image from "next/image";

import { useEffect, useState, useCallback } from "react";
import { ClipboardCheck, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { RegistrationTable } from "@/features/registrations/components/registration-table";
import { registrationsApi } from "@/lib/api-client";
import type { RaceRegistration, RegistrationStatus } from "@/features/registrations/mock-registrations";
import { toast } from "sonner";

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RaceRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRegistrations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await registrationsApi.list({ limit: 100 });
      const rawList = res.data || [];
      
      const mapped = rawList.map((item): RaceRegistration => {
        const statusVal = item.status || "PENDING";
        const statusLower = statusVal.toLowerCase();
        
        let statusMapped: RegistrationStatus = "pending";
        if (statusLower === "approved")  statusMapped = "approved";
        if (statusLower === "rejected")  statusMapped = "rejected";
        if (statusLower === "cancelled") statusMapped = "cancelled";
        if (statusLower === "withdrawn") statusMapped = "withdrawn";

        const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
        const formattedDate = createdDate.toLocaleDateString("vi-VN") + " · " + createdDate.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });

        return {
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
        };
      });

      setRegistrations(mapped);
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Lỗi khi tải danh sách đăng ký.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRegistrations();
  }, [fetchRegistrations]);

  const counts = registrations.reduce(
    (acc, reg) => {
      if (reg.status === "approved") acc.approved += 1;
      else if (reg.status === "rejected") acc.rejected += 1;
      else acc.pending += 1;
      return acc;
    },
    { approved: 0, pending: 0, rejected: 0 }
  );

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Phê duyệt ghi danh"
        title="Quản lý yêu cầu đăng ký trận đua"
        description="Duyệt hồ sơ đăng ký tham gia vòng đua từ các chủ ngựa. Phê duyệt hoặc từ chối dựa trên điều lệ giải đấu."
      />
      
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <ClipboardCheck className="size-5 text-primary" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Chờ duyệt (PENDING)
          </p>
          <p className="mt-2 font-mono text-4xl font-black text-foreground">
            {isLoading ? "..." : counts.pending}
          </p>
          <StatusBadge
            className="mt-3"
            label="Cần xem xét"
            tone="yellow"
            pulse={counts.pending > 0}
          />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Đã duyệt (APPROVED)
          </p>
          <p className="mt-2 font-mono text-4xl font-black text-foreground">
            {isLoading ? "..." : counts.approved}
          </p>
          <StatusBadge className="mt-3" label="Sẵn sàng thi đấu" tone="green" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Từ chối (REJECTED)
          </p>
          <p className="mt-2 font-mono text-4xl font-black text-foreground">
            {isLoading ? "..." : counts.rejected}
          </p>
          <StatusBadge className="mt-3" label="Đã từ chối" tone="red" />
        </div>
      </section>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải danh sách đăng ký...</p>
        </div>
      ) : (
        <RegistrationTable 
          registrations={registrations} 
          limit={100} 
          onRefresh={fetchRegistrations} 
        />
      )}
    </main>
  );
}


