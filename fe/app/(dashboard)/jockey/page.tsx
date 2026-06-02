"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Award,
  Calendar,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Eye,
  Flag,
  Info,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Users,
  X,
  XCircle,
  TrendingDown,
  CheckCircle,
  HelpCircle,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/data-display/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

// Types
type JockeyStats = {
  races: {
    participated: number;
    wins: number;
    winRate: number;
  };
  totalPoints: number;
  invitations: {
    pendingCount: number;
  };
};

type OwnerInfo = {
  fullName: string;
  email: string;
  phone?: string;
};

type HorseInfoCompact = {
  _id: string;
  name: string;
  breed: string;
};

type RaceInfoCompact = {
  _id: string;
  name: string;
  startTime: string;
  status: string;
};

type Invitation = {
  _id: string;
  registrationId: string;
  raceId: RaceInfoCompact;
  horseId: HorseInfoCompact;
  ownerId: OwnerInfo;
  jockeyUserId: string;
  message?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "EXPIRED";
  expiredAt?: string;
  createdAt: string;
  respondedAt?: string;
};

type HorseDetail = {
  _id: string;
  name: string;
  breed: string;
  age: number;
  gender: string;
  color?: string;
  weightKg: number;
  heightCm: number;
  healthStatus: "HEALTHY" | "INJURED" | "SICK";
  status: "active" | "inactive";
  description?: string;
  image?: string;
  baseSpeed?: number;
  staminaScore?: number;
  ownerId?: string | { _id: string; fullName: string };
};

export function JockeyDashboard() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "invitations" | "assigned" | "horses" | "performance">("dashboard");

  useEffect(() => {
    if (tabParam === "invitations" || tabParam === "assigned" || tabParam === "horses" || tabParam === "performance") {
      setActiveTab(tabParam);
    } else {
      setActiveTab("dashboard");
    }
  }, [tabParam]);

  // State variables
  const [stats, setStats] = useState<JockeyStats | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingInvs, setIsLoadingInvs] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Profile status
  const [profile, setProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Selected horse detail for Modal
  const [selectedHorseId, setSelectedHorseId] = useState<string | null>(null);
  const [horseDetail, setHorseDetail] = useState<HorseDetail | null>(null);
  const [isLoadingHorse, setIsLoadingHorse] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    setIsLoadingStats(true);
    setIsLoadingInvs(true);
    setIsLoadingProfile(true);

    try {
      // 1. Fetch Stats
      const statsRes = await fetch("/api/jockey/dashboard");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      // 2. Fetch Invitations
      const invsRes = await fetch("/api/jockey/invitations");
      if (invsRes.ok) {
        const invsData = await invsRes.json();
        if (invsData.success) {
          setInvitations(invsData.data || []);
        }
      }

      // 3. Fetch Profile
      const profileRes = await fetch("/api/auth/me");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          setProfile(profileData.user);
        }
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu Jockey:", err);
      toast.error("Không thể kết nối đến server. Vui lòng thử lại.");
    } finally {
      setIsLoadingStats(false);
      setIsLoadingInvs(false);
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle invitation response (ACCEPT / REJECT)
  const handleRespondInvitation = async (id: string, responseStatus: "ACCEPTED" | "REJECTED") => {
    setSubmittingId(id);
    const actionLabel = responseStatus === "ACCEPTED" ? "Chấp nhận" : "Từ chối";

    try {
      const res = await fetch(`/api/jockey/invitations/${id}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: responseStatus }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || `Thao tác ${actionLabel.toLowerCase()} lời mời thất bại.`);
      }

      toast.success(`${actionLabel} lời mời thành công!`);
      // Reload data to reflect change
      await fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || `Lỗi khi thực hiện thao tác.`);
    } finally {
      setSubmittingId(null);
    }
  };

  // Fetch Horse details and open modal
  const handleViewHorseDetail = async (horseId: string) => {
    setSelectedHorseId(horseId);
    setIsLoadingHorse(true);
    setHorseDetail(null);

    try {
      const res = await fetch(`/api/jockey/horses/${horseId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setHorseDetail(data.data);
        }
      } else {
        toast.error("Không thể lấy thông tin chi tiết của ngựa.");
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin chiến mã:", err);
      toast.error("Lỗi kết nối.");
    } finally {
      setIsLoadingHorse(false);
    }
  };

  // Filtering invitations for specific sections
  const pendingInvs = invitations.filter((inv) => inv.status === "PENDING");
  const acceptedInvs = invitations.filter((inv) => inv.status === "ACCEPTED");
  
  // Format Date utility
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "Chưa xác định";
    const d = new Date(dateStr);
    return `${d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })} ngày ${d.toLocaleDateString("vi-VN")}`;
  };

  // Stats Card Grid Config
  const statsCards = [
    {
      label: "Số trận đã tham gia",
      value: isLoadingStats ? "..." : (stats?.races.participated || 0).toString(),
      helper: "Tổng số cuộc đua chính thức bạn đã điều khiển ngựa hoàn thành.",
      icon: Flag,
      tone: "neutral" as const,
      trend: "Sự nghiệp",
    },
    {
      label: "Chiến thắng (Hạng 1)",
      value: isLoadingStats ? "..." : (stats?.races.wins || 0).toString(),
      helper: `Tỷ lệ giành chức vô địch: ${isLoadingStats ? "..." : (stats?.races.winRate || 0)}%`,
      icon: Award,
      tone: "red" as const,
      trend: "Vô địch",
    },
    {
      label: "Tổng điểm thi đấu",
      value: isLoadingStats ? "..." : `${stats?.totalPoints || 0} Điểm`,
      helper: "Quy đổi thứ hạng: Hạng 1 nhận 10đ, Hạng 2 nhận 7đ, Hạng 3 nhận 5đ...",
      icon: ClipboardCheck,
      tone: "teal" as const,
      trend: "Điểm tích lũy",
    },
  ];

  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Page Header */}
      <PageHeader
        eyebrow="Giao diện nài ngựa chuyên nghiệp"
        title={isLoadingProfile ? "Nài Ngựa" : `Trạm Của Jockey: ${profile?.fullName}`}
        description="Chào mừng bạn đến với khu vực quản lý nài ngựa. Tiếp nhận lời mời thi đấu phân chia lợi nhuận 70/30 từ chủ chuồng, xem chi tiết chiến mã, quản lý lịch thi đấu và theo dõi bảng thành tích cá nhân của bạn."
      />

      {/* Profile/Status Alert Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#15151E] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.34)] sm:p-6">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(225,6,0,0.1),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(6,126,106,0.1),transparent_25rem)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E10600] to-transparent" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                CÔNG CỤ NÀI NGỰA
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Đang trực tuyến
              </span>
            </div>
            <h2 className="mt-3 text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
              Cam kết 30% quỹ thưởng trận đấu
            </h2>
            <p className="mt-1 text-xs text-white/50 leading-relaxed max-w-xl">
              Hợp đồng mặc định giữa chủ ngựa và Jockey: 70% thuộc về chủ chuồng, 30% thuộc về Jockey chiến thắng. Mọi lời mời chấp nhận sẽ được hệ thống kiểm tra xung đột thời gian 4 tiếng để bảo đảm an toàn.
            </p>
          </div>

          {pendingInvs.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3 text-white max-w-sm self-start md:self-auto animate-bounce">
              <ShieldAlert className="size-5 text-primary shrink-0" />
              <div>
                <h4 className="text-xs font-black uppercase text-white">Lời mời mới chờ duyệt!</h4>
                <p className="text-[10px] text-white/70 mt-0.5">Bạn đang có {pendingInvs.length} lời mời tham gia từ các chủ ngựa chưa phản hồi.</p>
              </div>
            </div>
          )}
        </div>
      </section>



      {/* Main Tab Content */}
      <section className="min-h-[400px]">
        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {statsCards.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Box 1: Upcoming Schedule */}
              <div className="rounded-2xl border border-white/5 bg-[#15151E] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Calendar className="size-4 text-teal-400" />
                    Lịch thi đấu gần nhất
                  </h3>
                  <button 
                    onClick={() => setActiveTab("assigned")} 
                    className="text-xs text-primary font-bold hover:underline flex items-center"
                  >
                    Tất cả <ChevronRight className="size-3.5" />
                  </button>
                </div>

                {isLoadingInvs ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : acceptedInvs.length === 0 ? (
                  <div className="text-center py-8 rounded-xl border border-dashed border-white/10 text-white/40 text-xs">
                    Không có cuộc đua nào được chấp nhận sắp tới.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {acceptedInvs.slice(0, 3).map((inv) => (
                      <div key={inv._id} className="flex justify-between items-center p-3 rounded-xl border border-white/5 bg-black/20 hover:border-white/10 transition">
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase">{inv.raceId?.name || "Tên trận đấu"}</h4>
                          <p className="text-[10px] text-white/50 mt-1 flex items-center gap-1">
                            <Clock className="size-3 shrink-0" />
                            {formatDateTime(inv.raceId?.startTime)}
                          </p>
                        </div>
                        <div className="text-right">
                          <button
                            onClick={() => handleViewHorseDetail(inv.horseId._id)}
                            className="text-[10px] px-2 py-1 rounded bg-[#E10600]/10 hover:bg-[#E10600]/20 text-primary border border-[#E10600]/20 transition flex items-center gap-1"
                          >
                            <Eye className="size-3" />
                            Chiến mã: {inv.horseId?.name}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Box 2: Pending Invitations summary */}
              <div className="rounded-2xl border border-white/5 bg-[#15151E] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <Mail className="size-4 text-primary" />
                    Hòm thư lời mời ({pendingInvs.length})
                  </h3>
                  <button 
                    onClick={() => setActiveTab("invitations")} 
                    className="text-xs text-primary font-bold hover:underline flex items-center"
                  >
                    Xem hết <ChevronRight className="size-3.5" />
                  </button>
                </div>

                {isLoadingInvs ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : pendingInvs.length === 0 ? (
                  <div className="text-center py-8 rounded-xl border border-dashed border-white/10 text-white/40 text-xs">
                    Hòm thư trống. Hiện tại không có lời mời mới nào.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingInvs.slice(0, 3).map((inv) => (
                      <div key={inv._id} className="flex justify-between items-center p-3 rounded-xl border border-[#E10600]/20 bg-[#E10600]/5 hover:border-[#E10600]/40 transition">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-primary">Lời mời</span>
                            <span className="text-[10px] text-white/40">• {inv.ownerId?.fullName}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white mt-1 uppercase">Cuộc đua: {inv.raceId?.name}</h4>
                          <p className="text-[10px] text-white/50 mt-0.5">Chiến mã: {inv.horseId?.name}</p>
                        </div>
                        <button
                          onClick={() => setActiveTab("invitations")}
                          className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 hover:bg-primary hover:text-white transition"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVITATIONS */}
        {activeTab === "invitations" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase tracking-wider text-white">Danh sách lời mời từ Chủ chuồng</h3>
              <span className="px-2.5 py-0.5 text-xs bg-primary/10 text-primary border border-primary/20 rounded font-bold uppercase">
                {pendingInvs.length} Lời mời mới
              </span>
            </div>

            {isLoadingInvs ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-44 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
                ))}
              </div>
            ) : pendingInvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-white/10 bg-[#15151E] max-w-lg mx-auto space-y-3">
                <div className="size-12 rounded-full border border-white/10 flex items-center justify-center text-white/30">
                  <Mail className="size-6" />
                </div>
                <h4 className="font-bold text-white">Hòm thư trống</h4>
                <p className="text-xs text-white/40 leading-relaxed">
                  Hiện tại không có lời mời thi đấu nào từ chủ chuồng gửi cho bạn. Khi các chủ ngựa cần nài ngựa chuyên nghiệp, thông tin lời mời sẽ hiển thị tại đây.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingInvs.map((inv) => (
                  <div key={inv._id} className="group relative rounded-2xl border border-white/5 bg-[#15151E] p-5 hover:border-primary/25 hover:bg-[#1C1C25] transition flex flex-col justify-between shadow-xl">
                    <div className="absolute top-4 right-4">
                      <StatusBadge label="Chờ duyệt" tone="yellow" pulse />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Chủ chuồng gửi</p>
                        <h4 className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                          <User className="size-3.5 text-primary" />
                          {inv.ownerId?.fullName}
                          <span className="text-[10px] text-white/35 font-normal">({inv.ownerId?.phone || "Không có SĐT"})</span>
                        </h4>
                      </div>

                      <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-2">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Tên trận đấu</p>
                          <p className="text-xs font-black uppercase text-white mt-0.5">{inv.raceId?.name}</p>
                          <p className="text-[10px] text-white/50 mt-1 flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatDateTime(inv.raceId?.startTime)}
                          </p>
                        </div>

                        <div className="h-px bg-white/5" />

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Ngựa được chỉ định</p>
                            <button
                              onClick={() => handleViewHorseDetail(inv.horseId._id)}
                              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 text-left mt-0.5"
                            >
                              {inv.horseId?.name} ({inv.horseId?.breed})
                              <Eye className="size-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {inv.message && (
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Tin nhắn đính kèm</p>
                          <p className="text-xs italic text-white/60 mt-1 bg-white/5 p-2 rounded-lg leading-relaxed">
                            "{inv.message}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
                      <Button
                        onClick={() => handleRespondInvitation(inv._id, "REJECTED")}
                        disabled={submittingId !== null}
                        variant="outline"
                        className="rounded-full border-white/10 hover:bg-white/5 text-xs h-9 uppercase font-bold text-white hover:text-white"
                      >
                        {submittingId === inv._id ? "Đang xử lý..." : "Từ chối"}
                      </Button>
                      <Button
                        onClick={() => handleRespondInvitation(inv._id, "ACCEPTED")}
                        disabled={submittingId !== null}
                        className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-xs h-9 uppercase font-bold text-white"
                      >
                        {submittingId === inv._id ? "Đang xử lý..." : "Chấp nhận"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ASSIGNED RACES */}
        {activeTab === "assigned" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase tracking-wider text-white">Lịch thi đấu đã nhận lời cưỡi</h3>
              <span className="px-2.5 py-0.5 text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded font-bold uppercase">
                {acceptedInvs.length} Cuộc đua sắp diễn ra
              </span>
            </div>

            {isLoadingInvs ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
                ))}
              </div>
            ) : acceptedInvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-white/10 bg-[#15151E] max-w-lg mx-auto space-y-3">
                <div className="size-12 rounded-full border border-white/10 flex items-center justify-center text-white/30">
                  <Calendar className="size-6" />
                </div>
                <h4 className="font-bold text-white">Chưa có lịch thi đấu</h4>
                <p className="text-xs text-white/40 leading-relaxed">
                  Lịch thi đấu trống. Khi bạn đồng ý chấp nhận các lời mời thi đấu từ chủ ngựa, lịch xuất phát chi tiết của bạn sẽ được hiển thị tại đây để theo dõi.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {acceptedInvs.map((inv) => (
                  <div key={inv._id} className="rounded-2xl border border-white/5 bg-[#15151E] p-5 shadow-xl hover:border-teal-500/30 hover:bg-[#1C1C25] transition flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-teal-400">ĐÃ GÁN PHÂN CÔNG</span>
                          <h4 className="text-sm font-black uppercase text-white mt-1">{inv.raceId?.name}</h4>
                        </div>
                        <StatusBadge
                          label={
                            inv.raceId?.status === "PENDING" ? "Chờ chạy" : 
                            inv.raceId?.status === "READY" ? "Sẵn sàng" : 
                            inv.raceId?.status === "LIVE" ? "ĐANG CHẠY" : 
                            inv.raceId?.status === "FINISHED" ? "Đã xong" : 
                            inv.raceId?.status === "RESULT_PUBLISHED" ? "Đã có kết quả" : inv.raceId?.status
                          }
                          tone={
                            inv.raceId?.status === "LIVE" ? "red" :
                            inv.raceId?.status === "READY" ? "green" :
                            inv.raceId?.status === "PENDING" ? "yellow" : "slate"
                          }
                          pulse={inv.raceId?.status === "LIVE"}
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-black/20 border border-white/5 grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Giờ xuất phát</p>
                          <p className="text-xs font-bold text-white mt-0.5 flex items-center gap-1.5">
                            <Clock className="size-3.5 text-teal-400" />
                            {formatDateTime(inv.raceId?.startTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Chủ sở hữu chiến mã</p>
                          <p className="text-xs font-bold text-white mt-0.5">{inv.ownerId?.fullName}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 rounded-xl border border-white/5 bg-black/10">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Ngựa điều khiển</p>
                          <p className="text-xs font-black text-white mt-0.5">{inv.horseId?.name}</p>
                        </div>
                        <Button
                          onClick={() => handleViewHorseDetail(inv.horseId._id)}
                          className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-[10px] h-8 font-black uppercase tracking-wider text-white"
                        >
                          <Eye className="size-3 ml-1" />
                          Xem chi tiết ngựa
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* TAB 4: HORSES */}
        {activeTab === "horses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase tracking-wider text-white">Chiến mã đang điều khiển</h3>
              <span className="px-2.5 py-0.5 text-xs bg-[#067E6A]/10 text-teal-300 border border-[#067E6A]/20 rounded font-bold uppercase">
                {Array.from(new Set(acceptedInvs.map(inv => inv.horseId?._id))).length} Ngựa đang cưỡi
              </span>
            </div>

            {isLoadingInvs ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
                ))}
              </div>
            ) : acceptedInvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-white/10 bg-[#15151E] max-w-lg mx-auto space-y-3">
                <div className="size-12 rounded-full border border-white/10 flex items-center justify-center text-white/30">
                  <ShieldCheck className="size-6" />
                </div>
                <h4 className="font-bold text-white">Chưa được gán ngựa</h4>
                <p className="text-xs text-white/40 leading-relaxed">
                  Danh sách trống. Khi bạn đồng ý chấp nhận các lời mời từ chủ ngựa, thông tin chi tiết và thể trạng của chú ngựa bạn được phân công điều khiển sẽ hiển thị tại đây.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Lấy danh sách ngựa duy nhất (unique) từ các lời mời đã chấp nhận */}
                {Array.from(new Map(acceptedInvs.map(inv => [inv.horseId?._id, inv.horseId])).values()).map((horse) => {
                  if (!horse) return null;
                  return (
                    <div key={horse._id} className="group relative rounded-2xl border border-white/5 bg-[#15151E] p-5 shadow-xl hover:border-primary/30 hover:bg-[#1C1C25] transition flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-full border border-primary bg-primary/10 flex items-center justify-center">
                            <Sparkles className="size-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black uppercase text-white leading-tight">{horse.name}</h4>
                            <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{horse.breed}</p>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-black/25 border border-white/5 text-xs text-white/65 space-y-2">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Vai trò thi đấu</p>
                          <p className="text-xs text-white/80">Chiến mã của bạn trong các trận đấu đã chấp nhận cưỡi. Thể lực và tốc độ ngựa ảnh hưởng rất lớn đến kết quả đua cuối cùng.</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5">
                        <Button
                          onClick={() => handleViewHorseDetail(horse._id)}
                          className="w-full rounded-full bg-[#E10600] hover:bg-[#B80500] text-xs h-9 uppercase font-bold text-white flex items-center justify-center gap-1.5"
                        >
                          <Eye className="size-3.5" />
                          Xem chi tiết thông số
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* TAB 4: MY PERFORMANCE */}
        {activeTab === "performance" && (
          <div className="space-y-6">
            {/* Career Metrics & Bio */}
            <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
              {/* Jockey Profile card */}
              <div className="rounded-2xl border border-white/5 bg-[#15151E] p-5 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">Hồ sơ nài ngựa</h3>
                
                {isLoadingProfile ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="size-16 rounded-full bg-white/5 mx-auto" />
                    <div className="h-4 w-32 bg-white/5 mx-auto rounded" />
                    <div className="h-20 bg-white/5 rounded" />
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <div className="size-20 rounded-full border-2 border-primary bg-primary/10 mx-auto flex items-center justify-center">
                      {profile?.avatar ? (
                        <img src={profile.avatar} alt={profile.fullName} className="size-full rounded-full object-cover" />
                      ) : (
                        <User className="size-10 text-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-black uppercase text-white">{profile?.fullName}</h4>
                      <p className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">JOCKEY CHUYÊN NGHIỆP</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-left bg-black/25 p-3 rounded-xl border border-white/5 text-xs">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Email</p>
                        <p className="text-white font-bold truncate mt-0.5">{profile?.email}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Số điện thoại</p>
                        <p className="text-white font-bold mt-0.5">{profile?.phone || "Chưa cập nhật"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Box: Performance achievements history */}
              <div className="rounded-2xl border border-white/5 bg-[#15151E] p-5 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2 flex items-center gap-2">
                  <Award className="size-4 text-primary" />
                  Bảng điểm & Thành tích thi đấu chính thức
                </h3>

                {isLoadingStats ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-black/35 p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Vô địch (Hạng 1)</p>
                        <p className="text-xl font-black text-primary mt-1">{stats?.races.wins || 0}</p>
                      </div>
                      <div className="bg-black/35 p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Tổng trận chạy</p>
                        <p className="text-xl font-black text-white mt-1">{stats?.races.participated || 0}</p>
                      </div>
                      <div className="bg-black/35 p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Tỷ lệ thắng</p>
                        <p className="text-xl font-black text-teal-400 mt-1">{stats?.races.winRate || 0}%</p>
                      </div>
                      <div className="bg-black/35 p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Điểm thi đấu</p>
                        <p className="text-xl font-black text-yellow-400 mt-1">{stats?.totalPoints || 0}đ</p>
                      </div>
                    </div>

                    <div className="h-px bg-white/5 my-2" />

                    <div className="text-white/40 text-xs py-4 text-center rounded-xl border border-dashed border-white/10">
                      <Info className="size-4 mx-auto mb-2 text-white/20" />
                      Lịch sử chi tiết vị trí và điểm tích lũy của từng trận đấu được lấy trực tiếp từ kết quả chính thức do Ban giám sát cuộc đua công bố.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Horse Detail MODAL Dialog */}
      {selectedHorseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#12121A] overflow-hidden shadow-2xl animate-scale-up">
            
            {/* Header / Banner decoration */}
            <div className="relative h-28 bg-[#181824] flex items-end p-5">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-teal-500/10" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-white/5" />
              
              <button 
                onClick={() => setSelectedHorseId(null)}
                className="absolute top-4 right-4 size-8 rounded-full bg-black/45 hover:bg-black/80 flex items-center justify-center text-white/70 hover:text-white transition"
              >
                <X className="size-4" />
              </button>

              <div className="relative flex items-center gap-3">
                <div className="size-14 rounded-full border border-primary bg-primary/10 flex items-center justify-center">
                  <Sparkles className="size-6 text-primary" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary">CHI TIẾT CHIẾN MÃ</span>
                  <h3 className="text-lg font-black uppercase text-white mt-0.5">
                    {isLoadingHorse ? "Đang tải dữ liệu..." : horseDetail?.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {isLoadingHorse ? (
                <div className="space-y-4 py-8 animate-pulse text-center">
                  <div className="h-4 bg-white/5 rounded w-1/3 mx-auto" />
                  <div className="h-2 bg-white/5 rounded w-1/2 mx-auto" />
                  <div className="h-10 bg-white/5 rounded" />
                </div>
              ) : horseDetail ? (
                <div className="space-y-4">
                  {/* Horse Image Preview */}
                  {horseDetail.image ? (
                    <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-white/5">
                      <img src={horseDetail.image} alt={horseDetail.name} className="size-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-32 w-full rounded-2xl bg-black/20 border border-dashed border-white/10 flex flex-col items-center justify-center text-white/30 text-xs">
                      <HelpCircle className="size-8 text-white/20 mb-2" />
                      Chưa tải lên hình ảnh của chiến mã
                    </div>
                  )}

                  {/* Core specifications */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Giống ngựa</p>
                      <p className="text-xs font-bold text-white mt-0.5 truncate">{horseDetail.breed}</p>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Tuổi đời</p>
                      <p className="text-xs font-bold text-white mt-0.5">{horseDetail.age} tuổi</p>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">Giới tính</p>
                      <p className="text-xs font-bold text-white mt-0.5">{horseDetail.gender === "male" ? "Đực" : "Cái"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-white/5 bg-black/25">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Thể trạng & Kỹ thuật thi đấu</p>
                      <div className="space-y-2 mt-2">
                        <div>
                          <div className="flex justify-between text-[10px] text-white/60 mb-0.5">
                            <span>Sức mạnh tốc độ</span>
                            <span className="font-bold text-primary">{horseDetail.baseSpeed || 60} / 100</span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${horseDetail.baseSpeed || 60}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] text-white/60 mb-0.5">
                            <span>Sức bền dẻo dai</span>
                            <span className="font-bold text-teal-400">{horseDetail.staminaScore || 70} / 100</span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="bg-teal-400 h-full" style={{ width: `${horseDetail.staminaScore || 70}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Sức khỏe</p>
                        <div className="mt-1">
                          <StatusBadge 
                            label={
                              horseDetail.healthStatus === "HEALTHY" ? "Khỏe mạnh" : 
                              horseDetail.healthStatus === "INJURED" ? "Chấn thương" : "Bị ốm"
                            } 
                            tone={horseDetail.healthStatus === "HEALTHY" ? "green" : "red"} 
                            pulse={horseDetail.healthStatus === "HEALTHY"}
                          />
                        </div>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Thông số vật lý</p>
                        <p className="text-xs text-white mt-1 leading-relaxed">
                          Nặng: <span className="font-bold">{horseDetail.weightKg} kg</span> · Cao: <span className="font-bold">{horseDetail.heightCm} cm</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {horseDetail.description && (
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Mô tả đặc điểm chiến mã</p>
                      <p className="text-xs text-white/70 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                        {horseDetail.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-white/40">Không tìm thấy thông tin chiến mã.</div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#181824] border-t border-white/5 flex justify-end">
              <Button
                onClick={() => setSelectedHorseId(null)}
                className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold uppercase px-6 text-white"
              >
                Đóng
              </Button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}

export default function JockeyDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 text-white/55">
        <div className="size-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
        <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải trạm điều hành...</p>
      </div>
    }>
      <JockeyDashboard />
    </Suspense>
  );
}
