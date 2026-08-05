"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Loader2, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { OwnerRegistrationTable, type Registration } from "@/features/registrations/components/owner-registration-table";
import { toast } from "sonner";

export default function OwnerRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, PENDING, APPROVED, REJECTED, CANCELLED

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
          <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải lịch sử ghi danh...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search & Filter Toolbar (Glassmorphism) */}
          <div className="flex flex-col sm:flex-row gap-3 p-3 bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 dark:border-white/5 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
              <input
                type="text"
                placeholder="Tìm tên chiến mã, giải đấu, trận đua..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="size-4 text-muted-foreground/70 hidden sm:block" />
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none pr-8 relative cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' className='lucide lucide-chevron-down'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1rem' }}
              >
                <option value="ALL" className="bg-background text-foreground">Trạng thái: Tất cả</option>
                <option value="PENDING" className="bg-background text-foreground">Chờ duyệt (PENDING)</option>
                <option value="APPROVED" className="bg-background text-foreground">Đã duyệt (APPROVED)</option>
                <option value="REJECTED" className="bg-background text-foreground">Bị từ chối (REJECTED)</option>
                <option value="CANCELLED" className="bg-background text-foreground">Đã hủy (CANCELLED)</option>
                <option value="WITHDRAWN" className="bg-background text-foreground">Đã rút lui (WITHDRAWN)</option>
              </select>
            </div>
          </div>

          <OwnerRegistrationTable
            registrations={registrations.filter(r => {
              // Search
              if (searchQuery.trim() !== "") {
                const q = searchQuery.toLowerCase();
                const matchHorse = r.horseName?.toLowerCase().includes(q) || false;
                const matchRace = r.raceName?.toLowerCase().includes(q) || false;
                const matchTournament = r.tournamentName?.toLowerCase().includes(q) || false;
                if (!matchHorse && !matchRace && !matchTournament) return false;
              }
              // Status
              if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
              return true;
            })}
            onRefresh={fetchRegistrations}
          />
        </div>
      )}
    </main>
  );
}
