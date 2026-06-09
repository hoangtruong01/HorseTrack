"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { OwnerRegistrationTable, type Registration } from "@/features/registrations/components/owner-registration-table";
import { toast } from "sonner";

export default function OwnerRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/owner/registrations");
      if (response.ok) {
        const resData = await response.json();
        if (resData.success) {
          // Map backend objects to our Registration table structure
          const rawList = resData.data?.data || resData.data || [];
          const mapped: Registration[] = (rawList as Record<string, unknown>[]).map((item) => {
            const tournamentId = item.tournamentId as Record<string, unknown> | null | undefined;
            const raceId = item.raceId as Record<string, unknown> | null | undefined;
            const horseId = item.horseId as Record<string, unknown> | null | undefined;
            const ownerId = item.ownerId as Record<string, unknown> | string | null | undefined;
            return {
              id: (item.id || item._id) as string,
              tournamentId: ((tournamentId?._id || tournamentId?.id) as string) || "",
              tournamentName: (tournamentId?.name as string) || "Giải đấu tự do",
              raceId: ((raceId?._id || raceId?.id) as string) || "",
              raceName: (raceId?.name as string) || "Không rõ trận đua",
              horseId: ((horseId?._id || horseId?.id) as string) || "",
              horseName: (horseId?.name as string) || "Không rõ chiến mã",
              ownerId: (typeof ownerId === "object" && ownerId !== null ? ((ownerId._id || ownerId.id) as string) : ownerId as string) || "",
              status: item.status as "APPROVED" | "REJECTED" | "PENDING" | "CANCELLED" | "WITHDRAWN",
              note: item.note as string | undefined,
              rejectedReason: item.rejectedReason as string | undefined,
              createdAt: (item.createdAt as string) || new Date().toISOString(),
            };
          });
          setRegistrations(mapped);
        }
      } else {
        toast.error("Không thể tải danh sách đăng ký trận đua.");
      }
    } catch (err) {
      console.error("Lỗi lấy lịch sử đăng ký:", err);
      toast.error("Lỗi kết nối tới Backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  return (
    <main className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Theo dõi thủ tục"
        title="Lịch Sử Ghi Danh"
        description="Giám sát tiến độ phê duyệt hồ sơ tham dự giải đấu của chiến mã từ Ban Tổ Chức. Bạn có thể tự do hủy hoặc rút tên tùy theo trạng thái hồ sơ."
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-foreground/55">
          <Loader2 className="size-8 animate-spin text-[#E10600]" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải lịch sử ghi danh...</p>
        </div>
      ) : (
        <OwnerRegistrationTable
          registrations={registrations}
          onRefresh={fetchRegistrations}
        />
      )}
    </main>
  );
}
