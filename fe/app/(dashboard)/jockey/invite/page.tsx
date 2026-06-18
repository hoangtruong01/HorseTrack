"use client";
import Image from "next/image";

import { useEffect, useState, Suspense } from "react";
import {
  Clock,
  Eye,
  Flag,
  Mail,
  Sparkles,
  User,
  X,
  HelpCircle,
  Trophy,
  MapPin,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
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

export function JockeyInvitePage() {
  // State variables
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoadingInvs, setIsLoadingInvs] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Selected horse detail for Modal
  const [selectedHorseId, setSelectedHorseId] = useState<string | null>(null);
  const [horseDetail, setHorseDetail] = useState<HorseDetail | null>(null);
  const [isLoadingHorse, setIsLoadingHorse] = useState(false);

  // Invitation detail modal
  const [detailInv, setDetailInv] = useState<Invitation | null>(null);

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
      console.error("Lỗi tải lời mời:", err);
      toast.error("Không thể kết nối đến server.");
    } finally {
      setIsLoadingInvs(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
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
        throw new Error(resData.message || `Thao tác ${actionLabel.toLowerCase()} thất bại.`);
      }

      toast.success(`${actionLabel} lời mời thành công!`);
      await fetchInvitations();
    } catch (err: unknown) {
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

  const pendingInvs = invitations.filter((inv) => inv.status === "PENDING");
  
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "Chưa xác định";
    const d = new Date(dateStr);
    return `${d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })} ngày ${d.toLocaleDateString("vi-VN")}`;
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <PageHeader
        eyebrow="Quản lý"
        title="Hòm Thư Lời Mời"
        description="Xem và phản hồi lời mời thi đấu từ các chủ chuồng. Bạn có thể chấp nhận hoặc từ chối dựa trên tỷ lệ chia thưởng và thông số chiến mã."
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black uppercase tracking-wider text-foreground">Lời mời đang chờ duyệt</h3>
          <span className="px-2.5 py-1 text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
            {pendingInvs.length} Lời mời mới
          </span>
        </div>

        {isLoadingInvs ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-muted/50 animate-pulse border border-border" />
            ))}
          </div>
        ) : pendingInvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-dashed border-border bg-card max-w-lg mx-auto space-y-3">
            <div className="size-12 rounded-full border border-border flex items-center justify-center text-muted-foreground">
              <Mail className="size-6" />
            </div>
            <h4 className="font-bold text-foreground">Không có lời mời nào</h4>
            <p className="text-xs text-muted-foreground">Bạn đã phản hồi tất cả các lời mời thi đấu.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingInvs.map((inv) => (
              <div key={inv.id || inv._id} className="group rounded-2xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-lg transition flex flex-col justify-between h-full">
                <div className="space-y-3 flex-1">
                  
                  {/* Header: Status & Race Name */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-black uppercase text-foreground leading-snug line-clamp-2" title={inv.raceId?.name}>
                      {inv.raceId?.name}
                    </h4>
                    <span className="shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-[10px] font-bold text-yellow-500">
                       <span className="size-1.5 rounded-full bg-yellow-500 animate-pulse" /> New
                    </span>
                  </div>

                  {/* Info Group 1: Time & Location */}
                  <div className="flex flex-col gap-1.5 py-2 border-y border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground" title="Thời gian xuất phát">
                      <Clock className="size-3.5 text-teal-400 shrink-0" />
                      <span>{formatDateTime(inv.raceId?.startTime)}</span>
                    </div>
                    {inv.tournamentId?.name && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground" title="Giải đấu">
                        <Trophy className="size-3.5 text-yellow-500 shrink-0" />
                        <span className="truncate">{inv.tournamentId.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Info Group 2: Owner & Share */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2" title="Chủ chuồng gửi">
                      <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="size-3" />
                      </div>
                      <span className="text-xs font-bold text-foreground truncate max-w-[100px]">{inv.ownerId?.fullName}</span>
                    </div>
                    <div className="text-right" title="Tỷ lệ chia thưởng">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 font-black text-xs border border-teal-500/20">
                        Thưởng {inv.jockeySharePercent}%
                      </span>
                    </div>
                  </div>

                  {/* Info Group 3: Horse */}
                  <div className="flex justify-between items-center p-2 rounded-lg bg-muted/40 border border-border">
                    <span className="text-xs font-bold truncate pr-2 flex items-center gap-1.5">
                       <Sparkles className="size-3 text-primary" />
                       {inv.horseId?.name}
                    </span>
                    <Button
                      onClick={() => handleViewHorseDetail(inv.horseId.id)}
                      variant="ghost" size="sm"
                      className="h-6 px-2 text-[10px] bg-background border border-border hover:bg-muted font-bold"
                      title="Xem thông số ngựa"
                    >
                      <Eye className="size-3 mr-1" /> Chi tiết
                    </Button>
                  </div>

                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    onClick={() => setDetailInv(inv)}
                    className="w-full rounded-xl bg-primary hover:bg-primary/90 text-xs h-9 uppercase font-bold text-white transition"
                  >
                    <Mail className="size-3.5 mr-1.5" /> Mở thư & Phản hồi
                  </Button>
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

      {/* ── MODAL: DETAILED INVITATION & RESPONSE ── */}
      {detailInv && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-200 fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setDetailInv(null)}
              className="absolute top-4 right-4 size-8 rounded-full bg-background/80 hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition shadow-sm"
            >
              <X className="size-4" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1.5">
                <Mail className="size-4" /> CHI TIẾT LỜI MỜI
              </span>
              <h3 className="text-xl font-black uppercase text-foreground mt-1">Phản hồi yêu cầu</h3>
            </div>

            {/* Combined Info Card */}
            <div className="space-y-3">
              {/* Owner Info */}
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full border border-primary bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Chủ chuồng gửi</p>
                    <h4 className="text-sm font-bold text-foreground leading-tight mt-0.5">{detailInv.ownerId?.fullName}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-500/10 text-teal-400 font-black text-xs border border-teal-500/20">
                    Phân chia: {detailInv.jockeySharePercent}%
                  </span>
                </div>
              </div>

              {/* Race Info */}
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Trận đấu & Giải đấu</p>
                  <p className="text-sm font-black text-foreground uppercase flex items-center gap-2">
                    <Flag className="size-4 text-primary shrink-0" />
                    {detailInv.raceId?.name}
                  </p>
                  {detailInv.tournamentId?.name && (
                    <p className="text-xs text-yellow-500 font-bold mt-1.5 flex items-center gap-2">
                      <Trophy className="size-3.5 shrink-0" /> {detailInv.tournamentId.name}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/50">
                  <span className="flex items-center gap-1.5" title="Thời gian"><Clock className="size-3.5" /> {formatDateTime(detailInv.raceId?.startTime)}</span>
                  {detailInv.tournamentId?.location && (
                    <span className="flex items-center gap-1.5" title="Địa điểm"><MapPin className="size-3.5" /> {detailInv.tournamentId.location}</span>
                  )}
                </div>
              </div>

              {/* Assigned Horse */}
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Chiến mã được phân công</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary overflow-hidden shrink-0">
                       {detailInv.horseId?.image ? <img src={detailInv.horseId.image} className="size-full object-cover" alt="horse" /> : <Sparkles className="size-5" />}
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-foreground">{detailInv.horseId?.name}</h4>
                       <p className="text-[10px] text-muted-foreground mt-0.5">{detailInv.horseId?.breed} • Tốc độ: <span className="font-bold text-primary">{detailInv.horseId?.baseSpeed}</span></p>
                     </div>
                  </div>
                  <Button
                    onClick={() => {
                      setDetailInv(null);
                      handleViewHorseDetail(detailInv.horseId.id);
                    }}
                    variant="ghost" size="sm" className="h-8 text-xs font-bold border border-border"
                  >
                    Xem
                  </Button>
                </div>
              </div>
            </div>

            {/* Message Box */}
            {detailInv.message && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Info className="size-3"/> Lời nhắn đính kèm</span>
                <div className="p-3 rounded-xl bg-muted/20 border border-border text-xs text-muted-foreground italic leading-relaxed">
                  &quot;{detailInv.message}&quot;
                </div>
              </div>
            )}

            {/* Decision buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                onClick={async () => {
                  if (submittingId !== null) return;
                  await handleRespondInvitation(detailInv.id || detailInv._id!, "REJECTED");
                  setDetailInv(null);
                }}
                disabled={submittingId !== null}
                variant="outline"
                className="h-10 rounded-xl border-border bg-transparent text-xs font-black uppercase tracking-wider text-foreground hover:bg-muted"
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
                className="h-10 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary/90 transition shadow-md hover:shadow-lg"
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

export default function JockeyInvitationsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
        <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải...</p>
      </div>
    }>
      <JockeyInvitePage />
    </Suspense>
  );
}
