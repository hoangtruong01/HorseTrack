"use client";

import { useEffect, useState, Suspense } from "react";
import {
  Calendar,
  Clock,
  Eye,
  Flag,
  Sparkles,
  User,
  X,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

// Types
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
};

export function JockeyAssignPage() {
  // State variables
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoadingInvs, setIsLoadingInvs] = useState(true);

  // Selected horse detail for Modal
  const [selectedHorseId, setSelectedHorseId] = useState<string | null>(null);
  const [horseDetail, setHorseDetail] = useState<HorseDetail | null>(null);
  const [isLoadingHorse, setIsLoadingHorse] = useState(false);

  // Fetch initial data
  const fetchInvitations = async () => {
    setIsLoadingInvs(true);
    try {
      const invsRes = await fetch("/api/jockey/invitations");
      if (invsRes.ok) {
        const invsData = await invsRes.json();
        if (invsData.success) {
          setInvitations(invsData.data || []);
        }
      }
    } catch (err) {
      console.error("Lỗi tải lịch thi đấu:", err);
      toast.error("Không thể kết nối đến server.");
    } finally {
      setIsLoadingInvs(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

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

  const acceptedInvs = invitations.filter((inv) => inv.status === "ACCEPTED");
  
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "Chưa xác định";
    const d = new Date(dateStr);
    return `${d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })} ngày ${d.toLocaleDateString("vi-VN")}`;
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <PageHeader
        eyebrow="Lịch Trình"
        title="Lịch Thi Đấu Đã Nhận"
        description="Xem chi tiết các cuộc đua bạn đã nhận lời tham gia, thông tin về chiến mã được phân công và tỷ lệ chia thưởng từ chủ chuồng."
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black uppercase tracking-wider text-foreground">Lịch trình thi đấu</h3>
          <StatusBadge label={`${acceptedInvs.length} Cuộc đua sắp tới`} tone="green" />
        </div>

        {isLoadingInvs ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-muted/50 animate-pulse border border-border" />
            ))}
          </div>
        ) : acceptedInvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-border bg-card max-w-lg mx-auto space-y-3">
            <div className="size-12 rounded-full border border-border flex items-center justify-center text-muted-foreground">
              <Calendar className="size-6" />
            </div>
            <h4 className="font-bold text-foreground">Chưa có lịch trình</h4>
            <p className="text-xs text-muted-foreground">Khi bạn chấp nhận lời mời, lịch đua sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {acceptedInvs.map((inv) => (
              <div key={inv.id || inv._id} className="relative rounded-xl border border-border bg-card p-4 hover:border-teal-500/30 transition shadow-sm overflow-hidden flex flex-col justify-between h-full">
                {/* Status accent line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${inv.raceId?.status === "LIVE" ? "bg-red-500" : "bg-teal-500"}`} />
                
                <div className="pl-3 space-y-3 flex-1">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-black uppercase text-foreground line-clamp-2" title={inv.raceId?.name}>{inv.raceId?.name}</h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5" title="Giờ chạy">
                          <Clock className="size-3.5 text-teal-400" />
                          <span className="font-medium">{formatDateTime(inv.raceId?.startTime)}</span>
                        </span>
                      </div>
                    </div>
                    <StatusBadge
                      label={
                        inv.raceId?.status === "PENDING" ? "Sắp tới" : 
                        inv.raceId?.status === "READY" ? "Sẵn sàng" : 
                        inv.raceId?.status === "LIVE" ? "ĐANG CHẠY" : 
                        inv.raceId?.status === "FINISHED" ? "Đã xong" : 
                        inv.raceId?.status === "RESULT_PUBLISHED" ? "Kết quả" : inv.raceId?.status
                      }
                      tone={
                        inv.raceId?.status === "LIVE" ? "red" :
                        inv.raceId?.status === "READY" ? "green" :
                        inv.raceId?.status === "PENDING" ? "yellow" : "slate"
                      }
                      pulse={inv.raceId?.status === "LIVE"}
                      className="shrink-0"
                    />
                  </div>

                  {inv.tournamentId?.name && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                      <Flag className="size-3 shrink-0" /> {inv.tournamentId.name}
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-3 border-t border-border/50">
                    {/* Owner & Share */}
                    <div className="flex items-center justify-between text-xs" title={`Chủ chuồng: ${inv.ownerId?.fullName}`}>
                      <div className="flex items-center gap-2">
                        <User className="size-3.5 text-muted-foreground" />
                        <span className="truncate max-w-[120px] font-medium">{inv.ownerId?.fullName}</span>
                      </div>
                      <span className="text-teal-400 font-bold bg-teal-500/10 px-1.5 py-0.5 rounded">
                        Thưởng {inv.jockeySharePercent}%
                      </span>
                    </div>

                    {/* Horse Action */}
                    <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg border border-border mt-1">
                       <span className="text-xs font-bold flex items-center gap-1.5 truncate pr-2">
                         <Sparkles className="size-3 text-primary" /> {inv.horseId?.name}
                       </span>
                       <Button
                        onClick={() => handleViewHorseDetail(inv.horseId.id)}
                        variant="ghost" size="sm"
                        className="h-6 text-[10px] font-bold bg-background hover:bg-muted border border-border px-2"
                        title="Xem thông số chiến mã"
                      >
                        <Eye className="size-3 mr-1" />
                        Xem
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                      <img src={horseDetail.image} alt={horseDetail.name} className="size-full object-cover" />
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
    </main>
  );
}

export default function JockeyAssignedPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="size-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
        <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải...</p>
      </div>
    }>
      <JockeyAssignPage />
    </Suspense>
  );
}
