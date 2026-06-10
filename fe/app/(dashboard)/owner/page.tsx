"use client";

import { StatCard } from "@/components/data-display/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Award,
  ChevronRight,
  ClipboardCheck,
  Flag,
  PlusCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type OwnerStats = {
  horses: { count: number };
  registrations: { count: number };
  winnings: { pending: number; paid: number; total: number };
};

type Profile = {
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
};

type Inv = {
  id: string;
  _id?: string;
  jockeyUserId: { fullName: string } | string;
  raceId: { name: string; startTime: string };
  horseId: { name: string };
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "EXPIRED";
  createdAt?: string;
};

type Reg = {
  id: string;
  _id?: string;
  raceId: { name: string; startTime: string };
  horseId: { name: string };
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
};

type Horse = {
  id: string;
  _id?: string;
  name: string;
  healthStatus: "HEALTHY" | "INJURED" | "SICK";
};

export function OwnerDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [invitations, setInvitations] = useState<Inv[]>([]);
  const [registrations, setRegistrations] = useState<Reg[]>([]);
  const [horses, setHorses] = useState<Horse[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [statsRes, profileRes, invRes, regRes, horsesRes] =
          await Promise.all([
            fetch("/api/owner/dashboard"),
            fetch("/api/auth/me"),
            fetch("/api/owner/jockey-invitations"),
            fetch("/api/owner/registrations"),
            fetch("/api/owner/horses"),
          ]);

        if (statsRes.ok) {
          const resData = await statsRes.json();
          if (resData.success) setStats(resData.data);
        }
        if (profileRes.ok) {
          const pData = await profileRes.json();
          if (pData.success) setProfile(pData.user);
        }
        if (invRes.ok) {
          const iData = await invRes.json();
          if (iData.success) setInvitations(iData.data);
        }
        if (regRes.ok) {
          const rData = await regRes.json();
          if (rData.success) setRegistrations(rData.data);
        }
        if (horsesRes.ok) {
          const hData = await horsesRes.json();
          if (hData.success) setHorses(hData.data);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const statsCards = [
    {
      label: "Chiến mã trong chuồng",
      value: isLoading ? "..." : (stats?.horses.count || 0).toString(),
      helper: "Tổng số lượng chiến mã đã đăng ký.",
      icon: Users,
      tone: "neutral" as const,
      trend: "Chuồng đua",
    },
    {
      label: "Lượt đăng ký trận đua",
      value: isLoading ? "..." : (stats?.registrations.count || 0).toString(),
      helper: "Lượt ghi danh (chờ duyệt, đã duyệt, đã hủy).",
      icon: ClipboardCheck,
      tone: "yellow" as const,
      trend: "Ghi danh",
    },
    {
      label: "Tổng tiền thưởng",
      value: isLoading
        ? "..."
        : `${(stats?.winnings.total || 0).toLocaleString("vi-VN")} đ`,
      helper: `Đã trả: ${(stats?.winnings.paid || 0).toLocaleString("vi-VN")} đ · Chờ xử lý: ${(stats?.winnings.pending || 0).toLocaleString("vi-VN")} đ`,
      icon: Award,
      tone: "teal" as const,
      trend: "Thu nhập 70/30",
    },
  ];

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "Chưa xác định";
    const d = new Date(dateStr);
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ngày ${d.toLocaleDateString("vi-VN")}`;
  };

  // Process data for UI
  const recentInvs = [...invitations]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    )
    .slice(0, 4);
  const upcomingRaces = registrations
    .filter((r) => r.status === "APPROVED")
    .slice(0, 3);
  const sickHorses = horses.filter(
    (h) => h.healthStatus === "SICK" || h.healthStatus === "INJURED",
  );

  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <PageHeader
        eyebrow="Bảng điều khiển chủ chuồng"
        title="Quản Lý Chuồng Đua"
        description="Trung tâm điều hành của chủ ngựa độc lập. Theo dõi chiến mã, tình trạng lời mời nài ngựa và lịch trình các trận đua."
        actions={
          <div className="flex gap-3">
            <Button
              asChild
              className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-white font-bold transition"
            >
              <Link href="/owner/horses/new">
                Thêm chiến mã
                <PlusCircle className="size-4 ml-1.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-border hover:bg-muted text-foreground font-bold transition"
            >
              <Link href="/owner/races">
                Đăng ký thi đấu
                <Flag className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        }
      />

      <section className="space-y-6">
        {/* ROW 1: Profile & KPI Stats */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Profile Block (1/3) */}
          <div className="lg:w-1/3 rounded-2xl border border-border bg-card p-5 shadow-sm relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Đang trực tuyến
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center gap-4 animate-pulse mt-2">
                <div className="size-14 rounded-full bg-muted/50 shrink-0" />
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-muted/50 rounded" />
                  <div className="h-4 w-40 bg-muted/50 rounded" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 mt-2">
                <div className="size-14 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.fullName}
                      className="size-full object-cover"
                    />
                  ) : (
                    <User className="size-6 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase text-foreground">
                    {profile?.fullName}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5 flex flex-col gap-0.5">
                    <span>{profile?.email}</span>
                    {profile?.phone && <span>{profile.phone}</span>}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Stats Block (2/3) */}
          <div className="lg:w-2/3 grid sm:grid-cols-3 gap-4">
            {statsCards.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>
        </div>

        {/* ROW 2: Actionable Data */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Column 1: Jockey Invitations Status */}
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col h-full shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                Trạng thái Lời mời Nài ngựa
              </h3>
              <button
                onClick={() => router.push("/owner/jockey-invitations")}
                className="text-xs text-primary font-bold hover:underline flex items-center"
              >
                Xem tất cả <ChevronRight className="size-3.5" />
              </button>
            </div>

            <div className="flex-1">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted/50 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : recentInvs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-xl text-muted-foreground">
                  <Users className="size-8 opacity-20 mb-2" />
                  <p className="text-xs">Chưa có lời mời nài ngựa nào.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentInvs.map((inv) => (
                    <div
                      key={inv.id || inv._id}
                      className="p-3 rounded-xl border border-border bg-muted/20 flex justify-between items-center hover:bg-muted/40 transition"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-foreground">
                            {typeof inv.jockeyUserId === "object"
                              ? (inv.jockeyUserId as any)?.fullName
                              : "Jockey"}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="font-medium text-muted-foreground flex items-center gap-1">
                            <Sparkles className="size-3" /> {inv.horseId?.name}
                          </span>
                        </div>
                        <span
                          className="text-[10px] text-foreground font-bold uppercase truncate max-w-[200px]"
                          title={inv.raceId?.name}
                        >
                          {inv.raceId?.name}
                        </span>
                      </div>

                      <div className="shrink-0 pl-2">
                        {inv.status === "PENDING" && (
                          <StatusBadge label="Đang chờ" tone="yellow" />
                        )}
                        {inv.status === "ACCEPTED" && (
                          <StatusBadge label="Đã nhận" tone="green" />
                        )}
                        {inv.status === "REJECTED" && (
                          <StatusBadge label="Từ chối" tone="red" />
                        )}
                        {inv.status === "CANCELLED" && (
                          <StatusBadge label="Đã hủy" tone="slate" />
                        )}
                        {inv.status === "EXPIRED" && (
                          <StatusBadge label="Hết hạn" tone="slate" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Upcoming Races & Horse Health */}
          <div className="flex flex-col gap-4">
            {/* Health Alert (Only shows if sick horses exist) */}
            {!isLoading && sickHorses.length > 0 && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 shadow-sm flex items-start gap-3">
                <AlertTriangle className="size-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-black text-red-500 uppercase">
                    Cảnh báo Sức khỏe Chiến mã
                  </h4>
                  <p className="text-xs text-red-500/80 mt-1">
                    Bạn có {sickHorses.length} chiến mã đang không khỏe mạnh (
                    {sickHorses.map((h) => h.name).join(", ")}). Vui lòng kiểm
                    tra tab Chiến mã.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/owner/horses")}
                  size="sm"
                  className="ml-auto shrink-0 bg-red-500 hover:bg-red-600 text-white text-xs h-8"
                >
                  Kiểm tra
                </Button>
              </div>
            )}

            {/* Upcoming Races */}
            <div className="rounded-2xl border border-border bg-card p-5 flex flex-col flex-1 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Flag className="size-4 text-teal-400" />
                  Lịch thi đấu sắp tới
                </h3>
                <button
                  onClick={() => router.push("/owner/registrations")}
                  className="text-xs text-primary font-bold hover:underline flex items-center"
                >
                  Xem chi tiết <ChevronRight className="size-3.5" />
                </button>
              </div>

              <div className="flex-1">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-20 bg-muted/50 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : upcomingRaces.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-xl text-muted-foreground">
                    <Flag className="size-8 opacity-20 mb-2" />
                    <p className="text-xs">Chưa có trận đua nào sắp diễn ra.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingRaces.map((reg) => (
                      <div
                        key={reg.id || reg._id}
                        className="relative overflow-hidden rounded-xl border border-border bg-muted/20 p-3 hover:border-teal-500/30 transition"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500" />
                        <div className="pl-2 flex flex-col gap-2">
                          <h4
                            className="text-xs font-black uppercase text-foreground truncate"
                            title={reg.raceId?.name}
                          >
                            {reg.raceId?.name}
                          </h4>
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="size-3.5 text-teal-400" />
                              {formatDateTime(reg.raceId?.startTime)}
                            </span>
                            <span className="font-bold flex items-center gap-1.5 text-foreground bg-background border border-border px-2 py-0.5 rounded-md">
                              <Sparkles className="size-3 text-primary" />{" "}
                              {reg.horseId?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function OwnerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="size-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
          <p className="mt-4 text-xs font-mono uppercase tracking-widest">
            Đang tải trạm điều hành...
          </p>
        </div>
      }
    >
      <OwnerDashboard />
    </Suspense>
  );
}
