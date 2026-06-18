"use client";

import { StatCard } from "@/components/data-display/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Award,
  Calendar,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Eye,
  Flag,
  HelpCircle,
  Info,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  X,
  Upload,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { StatusBadge } from "@/components/ui/status-badge";
import { useRouter } from "next/navigation";
import { jockeysApi, type JockeyItem } from "@/lib/api-client";
import { Suspense, useEffect, useState } from "react";
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
  id: string;
  name: string;
  breed: string;
  age?: number;
  gender?: string;
  baseSpeed?: number;
  staminaScore?: number;
  image?: string;
};

type RaceInfoCompact = {
  id: string;
  name: string;
  startTime: string;
  status: string;
  distanceMeters?: number;
  lapCount?: number;
  location?: string;
  prize?: number;
};

type TournamentInfoCompact = {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  status?: string;
};

type Invitation = {
  id: string;
  _id?: string;
  registrationId: string;
  tournamentId: TournamentInfoCompact;
  raceId: RaceInfoCompact;
  horseId: HorseInfoCompact;
  ownerId: OwnerInfo;
  jockeyUserId: string;
  message?: string;
  jockeySharePercent: number;
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
  ownerId?: string | { _id: string; id: string; fullName: string };
};

export function JockeyDashboard() {
  const router = useRouter();

  // State variables
  const [stats, setStats] = useState<JockeyStats | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingInvs, setIsLoadingInvs] = useState(true);

  // User profile status
  const [profile, setProfile] = useState<{ fullName?: string; avatar?: string; email?: string; phone?: string } | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Jockey profile and form states
  const [jockeyProfile, setJockeyProfile] = useState<JockeyItem | null>(null);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [experienceYears, setExperienceYears] = useState(1);
  const [bio, setBio] = useState("");
  const [certificates, setCertificates] = useState("");
  const [licenseImage, setLicenseImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [heightCm, setHeightCm] = useState(165);
  const [weightKg, setWeightKg] = useState(55);
  const [skillLevel, setSkillLevel] = useState("beginner");

  // Selected horse detail for Modal
  const [selectedHorseId, setSelectedHorseId] = useState<string | null>(null);
  const [horseDetail, setHorseDetail] = useState<HorseDetail | null>(null);
  const [isLoadingHorse, setIsLoadingHorse] = useState(false);

  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [detailInv, setDetailInv] = useState<Invitation | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    setIsLoadingStats(true);
    setIsLoadingInvs(true);
    setIsLoadingProfile(true);

    try {
      // Fetch User info
      const profileRes = await fetch("/api/auth/me");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          setProfile(profileData.user);
        }
      }

      // Fetch Jockey profile details
      try {
        const jProfile = await jockeysApi.getMe();
        setJockeyProfile(jProfile);
        setLicenseNumber(jProfile.licenseNumber || "");
        setExperienceYears(jProfile.experienceYears || 1);
        setBio(jProfile.bio || "");
        setCertificates(jProfile.certificates || "");
        setLicenseImage(jProfile.licenseImage || "");
        setImagePreview(jProfile.licenseImage || "");
        setHeightCm(jProfile.heightCm || 165);
        setWeightKg(jProfile.weightKg || 55);
        setSkillLevel(jProfile.skillLevel || "beginner");
      } catch (err) {
        if ((err as Error).message?.toLowerCase().includes("not found")) {
          setJockeyProfile(null);
        } else {
          console.error("Lỗi lấy jockey profile:", err);
        }
      }

      // Fetch Stats
      const statsRes = await fetch("/api/jockey/dashboard");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      // Fetch Invitations
      const invsRes = await fetch("/api/jockey/invitations");
      if (invsRes.ok) {
        const invsData = await invsRes.json();
        if (invsData.success) {
          setInvitations(invsData.data || []);
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Tải lên ảnh thất bại.");
      }

      setLicenseImage(resData.url);
      toast.success("Tải ảnh giấy phép thành công!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi khi tải ảnh lên.");
      setImagePreview("");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseNumber.trim()) {
      toast.error("Vui lòng nhập số giấy phép nài ngựa");
      return;
    }

    setIsSubmittingProfile(true);
    try {
      const dto = {
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        experienceYears: Number(experienceYears),
        skillLevel,
        bio,
        licenseNumber,
        certificates,
        licenseImage,
      };
      if (jockeyProfile) {
        await jockeysApi.updateProfile(jockeyProfile._id, dto);
        toast.success("Cập nhật hồ sơ thành công! Đang chờ Admin duyệt lại.");
      } else {
        await jockeysApi.createProfile(dto);
        toast.success("Khởi tạo hồ sơ thành công! Đang chờ Admin duyệt.");
      }
      await fetchData();
    } catch (err) {
      toast.error((err as Error).message || "Lỗi lưu hồ sơ.");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

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
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || `Lỗi khi thực hiện thao tác.`);
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
      helper: "Tổng số cuộc đua chính thức",
      icon: Flag,
      tone: "neutral" as const,
      trend: "Sự nghiệp",
    },
    {
      label: "Chiến thắng (Hạng 1)",
      value: isLoadingStats ? "..." : (stats?.races.wins || 0).toString(),
      helper: `Tỷ lệ thắng: ${isLoadingStats ? "..." : (stats?.races.winRate || 0)}%`,
      icon: Award,
      tone: "red" as const,
      trend: "Vô địch",
    },
    {
      label: "Tổng điểm thi đấu",
      value: isLoadingStats ? "..." : `${stats?.totalPoints || 0}đ`,
      helper: "Điểm tích lũy hạng",
      icon: ClipboardCheck,
      tone: "teal" as const,
      trend: "Tích lũy",
    },
  ];

  if (isLoadingProfile || isLoadingStats || isLoadingInvs) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground space-y-3">
        <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
        <p className="text-xs font-mono uppercase tracking-widest">Đang tải dữ liệu Jockey...</p>
      </div>
    );
  }

  // If Jockey profile is not approved, block standard dashboard and show approval / license entry page
  if (!jockeyProfile || jockeyProfile.approvalStatus !== "APPROVED") {
    const isPendingApproval = jockeyProfile?.approvalStatus === "PENDING" && jockeyProfile.licenseNumber && jockeyProfile.licenseImage;
    const isRejected = jockeyProfile?.approvalStatus === "REJECTED";

    return (
      <main className="space-y-6 max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <PageHeader
          eyebrow="Xác thực tài khoản"
          title="Yêu cầu bổ sung Hồ sơ & Giấy phép"
          description="Để bắt đầu hoạt động, vui lòng hoàn tất thông tin bằng cấp, giấy phép nài ngựa. Ban tổ chức sẽ duyệt hồ sơ của bạn."
        />

        {isRejected && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400 font-bold space-y-1.5 animate-pulse">
            <div className="flex items-center gap-2 text-red-500 text-[10px] uppercase tracking-wider">
              <ShieldAlert className="size-4" />
              <span>Hồ sơ của bạn bị từ chối phê duyệt</span>
            </div>
            <p className="italic text-foreground">&quot;{jockeyProfile.rejectionReason || "Không có lý do chi tiết"}&quot;</p>
            <p className="text-muted-foreground font-normal">Vui lòng điều chỉnh thông tin bên dưới và nộp lại hồ sơ.</p>
          </div>
        )}

        {isPendingApproval ? (
          <section className="relative overflow-hidden rounded-3xl border border-[#E10600]/30 bg-card p-6 shadow-2xl space-y-6">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-500 to-transparent" />

            <div className="flex items-center gap-3 text-amber-400">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <h3 className="text-sm font-black uppercase tracking-wider">Hồ sơ đang được kiểm duyệt</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cảm ơn bạn đã cung cấp thông tin. Ban tổ chức đang kiểm duyệt hồ sơ và giấy phép của bạn.
              Bạn sẽ nhận được thông báo ngay khi tài khoản được kích hoạt thành công.
            </p>

            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground">Số giấy phép:</span>
                <strong className="text-foreground ml-2 font-mono">{jockeyProfile?.licenseNumber}</strong>
              </div>
              {jockeyProfile?.experienceYears !== undefined && (
                <div>
                  <span className="text-muted-foreground">Năm kinh nghiệm:</span>
                  <strong className="text-foreground ml-2">{jockeyProfile?.experienceYears} năm</strong>
                </div>
              )}
              {jockeyProfile?.certificates && (
                <div>
                  <span className="text-muted-foreground">Bằng cấp:</span>
                  <p className="text-muted-foreground bg-black/20 p-2 rounded border border-border/50 mt-1">{jockeyProfile?.certificates}</p>
                </div>
              )}
              {jockeyProfile?.licenseImage && (
                <div>
                  <span className="text-muted-foreground">Ảnh giấy phép đã tải lên:</span>
                  <div className="mt-2 relative max-w-xs h-32 rounded-lg overflow-hidden border border-border bg-muted">
                    <img src={jockeyProfile.licenseImage} alt="Giấy phép nài ngựa" className="size-full object-contain" />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  // To let them edit if they want
                  setJockeyProfile({
                    ...jockeyProfile!,
                    licenseNumber: "", // clear to force show form edit mode
                  });
                }}
                className="rounded-full text-xs font-bold uppercase tracking-wider h-9 px-4 border-border"
              >
                Cập nhật lại thông tin
              </Button>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-border bg-card p-6 shadow-2xl relative">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#E10600] to-transparent" />
            <form onSubmit={handleCreateProfile} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Chiều cao (cm) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseInt(e.target.value) || 0)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Cân nặng (kg) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min={30}
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseInt(e.target.value) || 0)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Số năm kinh nghiệm</label>
                  <input
                    type="number"
                    min={0}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground">Cấp độ kỹ năng</label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                  >
                    <option value="beginner">Mới bắt đầu (Beginner)</option>
                    <option value="intermediate">Trung cấp (Intermediate)</option>
                    <option value="advanced">Nâng cao (Advanced)</option>
                    <option value="professional">Chuyên nghiệp (Professional)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Số giấy phép (License) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: JK-2026"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Bằng cấp & Chứng chỉ</label>
                <textarea
                  value={certificates}
                  onChange={(e) => setCertificates(e.target.value)}
                  rows={3}
                  placeholder="Ví dụ: Chứng chỉ đào tạo nài ngựa, chứng nhận tham gia cúp đua quốc gia..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Giới thiệu bản thân</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Giới thiệu ngắn về quá trình thi đấu..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Ảnh chụp giấy phép / Chứng chỉ</label>
                <div className="relative border border-dashed border-input hover:border-primary/50 bg-muted/20 rounded-xl min-h-[140px] flex flex-col items-center justify-center p-4 transition group cursor-pointer">
                  {imagePreview ? (
                    <div className="relative w-full max-w-sm h-[120px] rounded-lg overflow-hidden">
                      <img src={imagePreview} alt="License Preview" className="size-full object-cover" />
                      <div className="absolute inset-0 bg-black/45 opacity-0 hover:opacity-100 flex items-center justify-center transition">
                        <span className="text-white text-xs font-black uppercase bg-primary px-3 py-1.5 rounded-md">
                          Thay đổi ảnh
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      {uploading ? (
                        <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
                      ) : (
                        <Upload className="size-8 text-muted-foreground group-hover:text-primary transition" />
                      )}
                      <p className="text-sm font-bold text-foreground">
                        {uploading ? "Đang tải lên..." : "Tải ảnh giấy phép"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cho phép PNG, JPG, WEBP tối đa 5MB
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  type="submit"
                  disabled={isSubmittingProfile || uploading}
                  className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-foreground font-black uppercase tracking-wider text-xs h-10 px-6"
                >
                  {isSubmittingProfile ? (
                    <><Loader2 className="size-4 animate-spin mr-1.5" /> Đang lưu...</>
                  ) : (
                    <><CheckCircle2 className="size-4 mr-1.5" /> Gửi hồ sơ phê duyệt</>
                  )}
                </Button>
              </div>
            </form>
          </section>
        )}
      </main>
    );
  }

  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <PageHeader
        eyebrow="Quản lý"
        title="Trạm Điều Hành Jockey"
        description="Giao diện làm việc chuyên nghiệp dành cho nài ngựa. Quản lý lịch thi đấu, phản hồi lời mời và theo dõi thành tích cá nhân."
      />

      {/* Main Content */}
      <section className="space-y-6">

        {/* Top Area: Profile & Alerts */}
        <div className="flex flex-col md:flex-row gap-6">

          {/* User Profile Block */}
          <div className="flex-1 rounded-2xl border border-border bg-card p-5 shadow-sm relative overflow-hidden">
            {isLoadingProfile ? (
              <div className="flex items-center gap-4 animate-pulse">
                <div className="size-16 rounded-full bg-muted/50" />
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-muted/50 rounded" />
                  <div className="h-4 w-48 bg-muted/50 rounded" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt={profile.fullName} className="size-full object-cover" />
                  ) : (
                    <User className="size-8 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase text-foreground">{profile?.fullName}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                    <span>{profile?.email}</span>
                    {profile?.phone && <span>• {profile.phone}</span>}
                  </p>
                </div>
              </div>
            )}
          </div>

          {pendingInvs.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-3 text-foreground max-w-sm self-start md:self-auto animate-bounce">
              <ShieldAlert className="size-5 text-primary shrink-0" />
              <div>
                <h4 className="text-xs font-black uppercase text-foreground">Lời mời mới chờ duyệt!</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Bạn đang có {pendingInvs.length} lời mời tham gia từ các chủ ngựa chưa phản hồi.</p>
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
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Calendar className="size-4 text-teal-400" />
                    Lịch thi đấu gần nhất
                  </h3>
                  <button
                    onClick={() => router.push("/jockey/assign")}
                    className="text-xs text-primary font-bold hover:underline flex items-center transition"
                  >
                    Xem tất cả <ChevronRight className="size-3.5" />
                  </button>
                </div>

                {isLoadingInvs ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-16 rounded-xl bg-muted/50 animate-pulse" />
                    ))}
                  </div>
                ) : acceptedInvs.length === 0 ? (
                  <div className="text-center py-8 rounded-xl border border-dashed border-border text-muted-foreground text-xs">
                    Chưa có cuộc đua nào sắp diễn ra.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {acceptedInvs.slice(0, 3).map((inv) => (
                      <div key={inv.id || inv._id} className="group p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                          <h4 className="text-xs font-bold text-foreground uppercase truncate max-w-[180px]">{inv.raceId?.name}</h4>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1.5" title="Thời gian thi đấu">
                            <Clock className="size-3" />
                            {formatDateTime(inv.raceId?.startTime)}
                          </span>
                        </div>
                        <button
                          title="Xem chi tiết ngựa"
                          onClick={() => handleViewHorseDetail(inv.horseId.id)}
                          className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-bold uppercase transition"
                        >
                          <Eye className="size-3" />
                          {inv.horseId?.name}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Box 2: Pending Invitations */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Mail className="size-4 text-primary" />
                    Lời mời gần đây
                  </h3>
                  <button
                    onClick={() => router.push("/jockey/invite")}
                    className="text-xs text-primary font-bold hover:underline flex items-center transition"
                  >
                    Xem tất cả <ChevronRight className="size-3.5" />
                  </button>
                </div>

                {isLoadingInvs ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-16 rounded-xl bg-muted/50 animate-pulse" />
                    ))}
                  </div>
                ) : pendingInvs.length === 0 ? (
                  <div className="text-center py-8 rounded-xl border border-dashed border-border text-muted-foreground text-xs">
                    Hòm thư trống. Hiện tại không có lời mời mới nào.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingInvs.slice(0, 3).map((inv) => (
                      <div key={inv.id || inv._id} className="flex justify-between items-center p-3 rounded-xl border border-[#E10600]/20 bg-[#E10600]/5 hover:border-[#E10600]/40 transition">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-primary">Lời mời</span>
                            <span className="text-[10px] text-muted-foreground">• {inv.ownerId?.fullName}</span>
                            <span className="text-[10px] text-teal-400 font-bold">{inv.jockeySharePercent}%</span>
                          </div>
                          <h4 className="text-xs font-bold text-foreground mt-1 uppercase">Cuộc đua: {inv.raceId?.name}</h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Chiến mã: {inv.horseId?.name}</p>
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
              <h3 className="text-base font-black uppercase tracking-wider text-foreground">Danh sách lời mời từ Chủ chuồng</h3>
              <span className="px-2.5 py-0.5 text-xs bg-primary/10 text-primary border border-primary/20 rounded font-bold uppercase">
                {pendingInvs.length} Lời mời mới
              </span>
            </div>

            {isLoadingInvs ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-44 rounded-2xl bg-muted/50 animate-pulse border border-border" />
                ))}
              </div>
            ) : pendingInvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-border bg-card max-w-lg mx-auto space-y-3">
                <div className="size-12 rounded-full border border-border flex items-center justify-center text-muted-foreground">
                  <Mail className="size-6" />
                </div>
                <h4 className="font-bold text-foreground">Hòm thư trống</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Hiện tại không có lời mời thi đấu nào từ chủ chuồng gửi cho bạn. Khi các chủ ngựa cần nài ngựa chuyên nghiệp, thông tin lời mời sẽ hiển thị tại đây.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingInvs.map((inv) => (
                  <div key={inv.id || inv._id} className="group relative rounded-2xl border border-border bg-card p-5 hover:border-primary/25 hover:bg-muted/50 transition flex flex-col justify-between shadow-xl">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 font-black text-[10px] border border-teal-500/20">{inv.jockeySharePercent}%</span>
                      <StatusBadge label="Chờ duyệt" tone="yellow" pulse />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Chủ chuồng gửi</p>
                        <h4 className="text-sm font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                          <User className="size-3.5 text-primary" />
                          {inv.ownerId?.fullName}
                          <span className="text-[10px] text-muted-foreground font-normal">({inv.ownerId?.phone || "Không có SĐT"})</span>
                        </h4>
                      </div>

                      <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-2">
                        {inv.tournamentId?.name && (
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Giải đấu</p>
                            <p className="text-xs font-bold text-teal-400 mt-0.5">🏆 {inv.tournamentId.name}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Trận đấu</p>
                          <p className="text-xs font-black uppercase text-white mt-0.5">{inv.raceId?.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatDateTime(inv.raceId?.startTime)}
                          </p>
                        </div>

                        <div className="h-px bg-muted/50" />

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Ngựa được chỉ định</p>
                            <button
                              onClick={() => handleViewHorseDetail(inv.horseId.id)}
                              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 text-left mt-0.5"
                            >
                              {inv.horseId?.name} ({inv.horseId?.breed})
                              <Eye className="size-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Phần thưởng</p>
                            <p className="text-sm font-black text-teal-400 mt-0.5">{inv.jockeySharePercent}%</p>
                          </div>
                        </div>
                      </div>

                      {inv.message && (
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Tin nhắn đính kèm</p>
                          <p className="text-xs italic text-muted-foreground mt-1 bg-muted/50 p-2 rounded-lg leading-relaxed">
                            &quot;{inv.message}&quot;
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <Button
                        onClick={() => setDetailInv(inv)}
                        className="w-full rounded-full bg-[#E10600] hover:bg-[#B80500] text-xs h-9 uppercase font-bold text-foreground flex items-center justify-center gap-1.5"
                      >
                        <Eye className="size-3.5" />
                        Xem chi tiết & Phản hồi
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
              <h3 className="text-base font-black uppercase tracking-wider text-foreground">Lịch thi đấu đã nhận lời cưỡi</h3>
              <span className="px-2.5 py-0.5 text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded font-bold uppercase">
                {acceptedInvs.length} Cuộc đua sắp diễn ra
              </span>
            </div>

            {isLoadingInvs ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-40 rounded-2xl bg-muted/50 animate-pulse border border-border" />
                ))}
              </div>
            ) : acceptedInvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-border bg-card max-w-lg mx-auto space-y-3">
                <div className="size-12 rounded-full border border-border flex items-center justify-center text-muted-foreground">
                  <Calendar className="size-6" />
                </div>
                <h4 className="font-bold text-foreground">Chưa có lịch thi đấu</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Lịch thi đấu trống. Khi bạn đồng ý chấp nhận các lời mời thi đấu từ chủ ngựa, lịch xuất phát chi tiết của bạn sẽ được hiển thị tại đây để theo dõi.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {acceptedInvs.map((inv) => (
                  <div key={inv.id || inv._id} className="rounded-2xl border border-border bg-card p-5 shadow-xl hover:border-teal-500/30 hover:bg-muted/50 transition flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-teal-400">ĐÃ GÁN PHÂN CÔNG</span>
                          {inv.tournamentId?.name && <p className="text-[10px] text-teal-400 font-bold mt-0.5">🏆 {inv.tournamentId.name}</p>}
                          <h4 className="text-sm font-black uppercase text-white mt-1">{inv.raceId?.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 font-black text-[10px] border border-teal-500/20">{inv.jockeySharePercent}%</span>
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
                      </div>

                      <div className="p-3 rounded-xl bg-muted/50 border border-border grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Giờ xuất phát</p>
                          <p className="text-xs font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                            <Clock className="size-3.5 text-teal-400" />
                            {formatDateTime(inv.raceId?.startTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Chủ sở hữu</p>
                          <p className="text-xs font-bold text-foreground mt-0.5">{inv.ownerId?.fullName}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">% Thưởng</p>
                          <p className="text-sm font-black text-teal-400 mt-0.5">{inv.jockeySharePercent}%</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 rounded-xl border border-border bg-muted/40">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Ngựa điều khiển</p>
                          <p className="text-xs font-black text-foreground mt-0.5">{inv.horseId?.name}</p>
                        </div>
                        <Button
                          onClick={() => handleViewHorseDetail(inv.horseId.id)}
                          className="rounded-full bg-muted/50 border border-border hover:bg-muted hover:border-white/20 text-[10px] h-8 font-black uppercase tracking-wider text-white"
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
              <h3 className="text-base font-black uppercase tracking-wider text-foreground">Chiến mã đang điều khiển</h3>
              <span className="px-2.5 py-0.5 text-xs bg-[#067E6A]/10 text-teal-300 border border-[#067E6A]/20 rounded font-bold uppercase">
                {Array.from(new Set(acceptedInvs.map(inv => inv.horseId?.id))).length} Ngựa đang cưỡi
              </span>
            </div>

            {isLoadingInvs ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-2xl bg-muted/50 animate-pulse border border-border" />
                ))}
              </div>
            ) : acceptedInvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-border bg-card max-w-lg mx-auto space-y-3">
                <div className="size-12 rounded-full border border-border flex items-center justify-center text-muted-foreground">
                  <ShieldCheck className="size-6" />
                </div>
                <h4 className="font-bold text-foreground">Chưa được gán ngựa</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Danh sách trống. Khi bạn đồng ý chấp nhận các lời mời từ chủ ngựa, thông tin chi tiết và thể trạng của chú ngựa bạn được phân công điều khiển sẽ hiển thị tại đây.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Lấy danh sách ngựa duy nhất (unique) từ các lời mời đã chấp nhận */}
                {Array.from(new Map(acceptedInvs.map(inv => [inv.horseId?.id, inv.horseId])).values()).map((horse) => {
                  if (!horse) return null;
                  return (
                    <div key={horse.id} className="group relative rounded-2xl border border-border bg-card p-5 shadow-xl hover:border-primary/30 hover:bg-muted/50 transition flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-full border border-primary bg-primary/10 flex items-center justify-center">
                            <Sparkles className="size-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black uppercase text-white leading-tight">{horse.name}</h4>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{horse.breed}</p>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground space-y-2">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Vai trò thi đấu</p>
                          <p className="text-xs text-foreground">Chiến mã của bạn trong các trận đấu đã chấp nhận cưỡi. Thể lực và tốc độ ngựa ảnh hưởng rất lớn đến kết quả đua cuối cùng.</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border">
                        <Button
                          onClick={() => handleViewHorseDetail(horse.id)}
                          className="w-full rounded-full bg-[#E10600] hover:bg-[#B80500] text-xs h-9 uppercase font-bold text-foreground flex items-center justify-center gap-1.5"
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
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground border-b border-border pb-2">Hồ sơ nài ngựa</h3>

                {isLoadingProfile ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="size-16 rounded-full bg-muted/50 mx-auto" />
                    <div className="h-4 w-32 bg-muted/50 mx-auto rounded" />
                    <div className="h-20 bg-muted/50 rounded" />
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <div className="size-20 rounded-full border-2 border-primary bg-primary/10 mx-auto flex items-center justify-center">
                      {profile?.avatar ? (
                        <Image src={profile.avatar} alt={profile.fullName ?? ""} className="size-full rounded-full object-cover" width={80} height={80} />
                      ) : (
                        <User className="size-10 text-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-black uppercase text-foreground">{profile?.fullName}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">JOCKEY CHUYÊN NGHIỆP</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/50 p-3 text-left text-xs">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Email</p>
                        <p className="mt-0.5 truncate font-bold text-foreground">{profile?.email}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Số điện thoại</p>
                        <p className="mt-0.5 font-bold text-foreground">{profile?.phone || "Chưa cập nhật"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Box: Performance achievements history */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground border-b border-border pb-2 flex items-center gap-2">
                  <Award className="size-4 text-primary" />
                  Bảng điểm & Thành tích thi đấu chính thức
                </h3>

                {isLoadingStats ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 rounded-xl bg-muted/50 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-muted/60 p-3 rounded-xl border border-border text-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Vô địch (Hạng 1)</p>
                        <p className="mt-1 text-xl font-black text-primary">{stats?.races.wins || 0}</p>
                      </div>
                      <div className="bg-muted/60 p-3 rounded-xl border border-border text-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Tổng trận chạy</p>
                        <p className="mt-1 text-xl font-black text-foreground">{stats?.races.participated || 0}</p>
                      </div>
                      <div className="bg-muted/60 p-3 rounded-xl border border-border text-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Tỷ lệ thắng</p>
                        <p className="text-xl font-black text-teal-400 mt-1">{stats?.races.winRate || 0}%</p>
                      </div>
                      <div className="bg-muted/60 p-3 rounded-xl border border-border text-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Điểm thi đấu</p>
                        <p className="text-xl font-black text-yellow-400 mt-1">{stats?.totalPoints || 0}đ</p>
                      </div>
                    </div>

                    <div className="h-px bg-muted/50 my-2" />

                    <div className="text-muted-foreground text-xs py-4 text-center rounded-xl border border-dashed border-border">
                      <Info className="size-4 mx-auto mb-2 text-muted-foreground/60" />
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
        <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-scale-up">

            <div className="relative flex h-28 items-end bg-muted/50 p-5">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-teal-500/10" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-muted/50" />

              <button
                onClick={() => setSelectedHorseId(null)}
                className="absolute top-4 right-4 size-8 rounded-full bg-background/80 hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition shadow-sm backdrop-blur-md"
              >
                <X className="size-4" />
              </button>

              <div className="relative flex items-center gap-3">
                <div className="size-14 rounded-full border border-primary bg-primary/10 flex items-center justify-center backdrop-blur-md">
                  <Sparkles className="size-6 text-primary" />
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary">CHI TIẾT CHIẾN MÃ</span>
                  <h3 className="text-lg font-black uppercase text-foreground mt-0.5 drop-shadow-sm">
                    {isLoadingHorse ? "Đang tải..." : horseDetail?.name}
                  </h3>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {isLoadingHorse ? (
                <div className="space-y-4 py-8 animate-pulse text-center">
                  <div className="h-4 bg-muted/50 rounded w-1/3 mx-auto" />
                  <div className="h-2 bg-muted/50 rounded w-1/2 mx-auto" />
                  <div className="h-10 bg-muted/50 rounded" />
                </div>
              ) : horseDetail ? (
                <div className="space-y-4">
                  {horseDetail.image ? (
                    <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-border">
                      <Image src={horseDetail.image} alt={horseDetail.name} className="object-cover" fill />
                    </div>
                  ) : (
                    <div className="h-32 w-full rounded-2xl bg-muted/30 border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground text-xs">
                      <HelpCircle className="size-8 text-muted-foreground/40 mb-2" />
                      Chưa cập nhật hình ảnh
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted/30 p-2.5 rounded-xl border border-border">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Giống</p>
                      <p className="text-xs font-bold text-foreground mt-0.5 truncate" title={horseDetail.breed}>{horseDetail.breed}</p>
                    </div>
                    <div className="bg-muted/30 p-2.5 rounded-xl border border-border">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Tuổi</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{horseDetail.age}</p>
                    </div>
                    <div className="bg-muted/30 p-2.5 rounded-xl border border-border">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Giới tính</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{horseDetail.gender === "male" ? "Đực" : "Cái"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-border bg-muted/30">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Kỹ thuật thi đấu</p>
                      <div className="space-y-3 mt-3">
                        <div>
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                            <span>Tốc độ</span>
                            <span className="font-bold text-primary">{horseDetail.baseSpeed || 60}/100</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${horseDetail.baseSpeed || 60}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                            <span>Sức bền</span>
                            <span className="font-bold text-teal-400">{horseDetail.staminaScore || 70}/100</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                            <div className="bg-teal-400 h-full rounded-full" style={{ width: `${horseDetail.staminaScore || 70}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-1.5">Sức khỏe</p>
                        <div className="inline-flex px-2 py-1 items-center gap-1.5 rounded-md border text-xs font-bold bg-green-500/10 text-green-500 border-green-500/20">
                          {horseDetail.healthStatus === "HEALTHY" ? "Khỏe mạnh" : horseDetail.healthStatus === "INJURED" ? "Chấn thương" : "Bị ốm"}
                        </div>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-1.5">Thông số vật lý</p>
                        <p className="text-xs text-foreground bg-background border border-border rounded-lg p-2 flex items-center justify-between">
                          <span>Cân nặng: <b>{horseDetail.weightKg}kg</b></span>
                          <span>Chiều cao: <b>{horseDetail.heightCm}cm</b></span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {horseDetail.description && (
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Mô tả đặc điểm</p>
                      <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border border-border">
                        {horseDetail.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">Không tìm thấy thông tin chiến mã.</div>
              )}
            </div>

            <div className="flex justify-end border-t border-border bg-muted/10 p-4">
              <Button
                onClick={() => setSelectedHorseId(null)}
                className="rounded-xl bg-muted/50 border border-border hover:bg-muted text-xs font-bold uppercase px-6 text-foreground transition"
              >
                Đóng
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL: DETAILED INVITATION & RESPONSE ── */}
      {detailInv && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-200 fade-in">
          <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setDetailInv(null)}
              className="absolute top-4 right-4 size-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-white transition"
            >
              <X className="size-4" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E10600] flex items-center gap-1.5">
                <Mail className="size-4" /> CHI TIẾT LỜI MỜI CƯỠI NGỰA
              </span>
              <h3 className="text-xl font-black uppercase text-white mt-1">Lời mời thi đấu</h3>
              <p className="text-xs text-muted-foreground mt-1">Xem chi tiết các thông số ngựa, trận đấu và phân chia thưởng trước khi phản hồi.</p>
            </div>

            {/* Owner Section */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">Chủ chuồng (Owner)</span>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full border border-primary bg-primary/10 flex items-center justify-center">
                  <User className="size-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground leading-tight">{detailInv.ownerId?.fullName}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{detailInv.ownerId?.email} • SĐT: {detailInv.ownerId?.phone || "Không rõ"}</p>
                </div>
              </div>
            </div>

            {/* Tournament & Race Section */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">Thông tin cuộc đua</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Giải đấu lớn</p>
                  <p className="text-xs font-bold text-teal-400 mt-1">🏆 {detailInv.tournamentId?.name || "Giải đấu đơn lẻ"}</p>
                  {detailInv.tournamentId?.location && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">📍 Địa điểm: {detailInv.tournamentId.location}</p>
                  )}
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Trận đấu nhỏ</p>
                  <p className="text-xs font-black text-foreground mt-1 uppercase">🏁 {detailInv.raceId?.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDateTime(detailInv.raceId?.startTime)}
                  </p>
                </div>
              </div>

              {detailInv.raceId?.prize ? (
                <div className="mt-2 pt-2 border-t border-border flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Quỹ giải thưởng:</span>
                  <span className="font-black text-yellow-400">{detailInv.raceId.prize.toLocaleString()} Điểm</span>
                </div>
              ) : null}
            </div>

            {/* Assigned Horse Section */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">Chiến mã được phân công</span>
              <div className="flex gap-4">
                {detailInv.horseId?.image ? (
                  <div className="relative h-20 w-24 rounded-lg overflow-hidden border border-border shrink-0">
                    <Image src={detailInv.horseId.image} className="object-cover" alt="" fill />
                  </div>
                ) : (
                  <div className="h-20 w-24 rounded-lg bg-muted/50 border border-dashed border-border flex items-center justify-center shrink-0">
                    <HelpCircle className="size-5 text-muted-foreground/60" />
                  </div>
                )}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h4 className="text-sm font-black uppercase text-white truncate">{detailInv.horseId?.name}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{detailInv.horseId?.breed} • {detailInv.horseId?.age} tuổi • {detailInv.horseId?.gender === "male" ? "Đực" : "Cái"}</p>

                  {/* Horse stats compact */}
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="flex justify-between border-b border-border pb-0.5"><span className="text-muted-foreground">Tốc độ:</span><span className="font-bold text-primary">{detailInv.horseId?.baseSpeed || 60}/100</span></div>
                    <div className="flex justify-between border-b border-border pb-0.5"><span className="text-muted-foreground">Sức bền:</span><span className="font-bold text-teal-400">{detailInv.horseId?.staminaScore || 70}/100</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profit Share Split */}
            <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/10 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-teal-400">Tỷ lệ chia giải thưởng</p>
                <p className="text-xs text-muted-foreground mt-0.5">Phần trăm bạn nhận được từ quỹ giải thưởng của trận đấu</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 font-black text-sm border border-teal-500/20">
                  {detailInv.jockeySharePercent}%
                </span>
                <p className="text-[9px] text-white/45 mt-1">Owner nhận: {100 - detailInv.jockeySharePercent}%</p>
              </div>
            </div>

            {/* Message Box */}
            {detailInv.message && (
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Lời nhắn từ Chủ chuồng</span>
                <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground italic leading-relaxed">
                  &quot;{detailInv.message}&quot;
                </div>
              </div>
            )}

            {/* Decision buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button
                onClick={async () => {
                  if (submittingId !== null) return;
                  await handleRespondInvitation(detailInv.id || detailInv._id!, "REJECTED");
                  setDetailInv(null);
                }}
                disabled={submittingId !== null}
                variant="outline"
                className="h-10 rounded-xl border-border bg-transparent text-xs font-black uppercase tracking-wider text-foreground hover:bg-muted/50"
              >
                Từ chối
              </Button>
              <Button
                onClick={async () => {
                  if (submittingId !== null) return;
                  await handleRespondInvitation(detailInv.id || detailInv._id!, "ACCEPTED");
                  setDetailInv(null);
                }}
                disabled={submittingId !== null}
                className="h-10 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-[#E10600] hover:bg-[#B80500]"
              >
                Chấp nhận lời mời
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
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
        <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải trạm điều hành...</p>
      </div>
    }>
      <JockeyDashboard />
    </Suspense>
  );
}
