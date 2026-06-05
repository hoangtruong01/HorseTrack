"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Trophy, Calendar, MapPin, Users, ChevronLeft, Plus, 
  Trash2, Loader2, AlertCircle, RefreshCw, Play, CheckCircle2,
  CloudSun, Navigation, Milestone, X
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { tournamentsApi, racesApi, apiFetch, type TournamentItem, type RaceItem } from "@/lib/api-client";
import { toast } from "sonner";

const raceStatusColors: Record<string, string> = {
  SCHEDULED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  CHECKING: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  READY: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  LIVE: "text-rose-400 bg-rose-400/10 border-rose-400/20 animate-pulse",
  FINISHED: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  RESULT_PUBLISHED: "text-teal-400 bg-teal-400/10 border-teal-400/20",
  CANCELLED: "text-red-400 bg-red-400/10 border-red-400/20",
};

const raceStatusOptions = [
  "SCHEDULED", "CHECKING", "READY", "LIVE", "FINISHED", "RESULT_PUBLISHED", "CANCELLED"
];

export default function AdminTournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.tournamentId as string;

  const [tournament, setTournament] = useState<TournamentItem | null>(null);
  const [races, setRaces] = useState<RaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [raceName, setRaceName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [distanceMeters, setDistanceMeters] = useState(1000);
  const [lapCount, setLapCount] = useState(1);
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [prize, setPrize] = useState(0);
  const [trackCondition, setTrackCondition] = useState("Dry turf");
  const [weatherSnapshot, setWeatherSnapshot] = useState("Sunny");

  // Race Details Modal State
  const [selectedRace, setSelectedRace] = useState<RaceItem | null>(null);
  const [raceRegistrations, setRaceRegistrations] = useState<any[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  const handleOpenRaceDetails = async (race: RaceItem) => {
    setSelectedRace(race);
    setLoadingRegistrations(true);
    try {
      const res = await apiFetch<any>(`/registrations?raceId=${race._id}&limit=100`);
      setRaceRegistrations(res.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Không thể tải danh sách đăng ký tham gia vòng đua.");
      setRaceRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const loadDetails = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, rRes] = await Promise.all([
        tournamentsApi.get(tournamentId),
        racesApi.listByTournament(tournamentId, { limit: 100 })
      ]);
      setTournament(tRes);
      setRaces(rRes.data || []);
    } catch (e: any) {
      toast.error(e.message || "Không thể tải thông tin chi tiết giải đấu");
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    if (tournamentId) {
      void loadDetails();
    }
  }, [tournamentId, loadDetails]);

  // Handle Race Creation
  const handleCreateRace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament) return;

    if (!raceName.trim()) {
      toast.error("Vui lòng nhập tên vòng đua.");
      return;
    }

    if (!startTime) {
      toast.error("Vui lòng nhập thời gian bắt đầu vòng đua.");
      return;
    }

    // Validation: Start time within tournament limits
    const raceStart = new Date(startTime);
    const tStartPart = typeof tournament.startDate === "string" ? tournament.startDate.split("T")[0] : "";
    const tEndPart = typeof tournament.endDate === "string" ? tournament.endDate.split("T")[0] : "";

    const localStartLimit = tStartPart ? new Date(`${tStartPart}T00:00:00`) : null;
    const localEndLimit = tEndPart ? new Date(`${tEndPart}T23:59:59.999`) : null;

    if (localStartLimit && raceStart < localStartLimit) {
      toast.error(`Thời gian bắt đầu vòng đua không thể trước ngày bắt đầu giải đấu (${localStartLimit.toLocaleDateString("vi-VN")})`);
      return;
    }

    if (localEndLimit && raceStart > localEndLimit) {
      toast.error(`Thời gian bắt đầu vòng đua không thể sau ngày kết thúc giải đấu (${localEndLimit.toLocaleDateString("vi-VN")})`);
      return;
    }

    // Validation: Budget limit
    const totalAllocatedPrizes = races.reduce((sum, r) => sum + (r.prize || 0), 0);
    const maxBudget = tournament.prizePool || tournament.prize || 0;
    if (totalAllocatedPrizes + prize > maxBudget) {
      toast.error(`Quỹ giải thưởng vượt quá giới hạn của giải đấu. Hiện có thể phân bổ tối đa: ${maxBudget - totalAllocatedPrizes} pts (Tổng giải đấu: ${maxBudget} pts, Đã phân bổ: ${totalAllocatedPrizes} pts).`);
      return;
    }

    setSubmitting(true);
    try {
      await racesApi.create({
        tournamentId,
        name: raceName,
        description: description || undefined,
        startTime: new Date(startTime).toISOString(),
        distanceMeters,
        lapCount,
        maxParticipants,
        prize,
        trackCondition,
        weatherSnapshot,
      });

      toast.success(`Đã thêm vòng đua "${raceName}" thành công!`);
      setShowCreateModal(false);
      
      // Reset form
      setRaceName("");
      setDescription("");
      setStartTime("");
      setDistanceMeters(1000);
      setLapCount(1);
      setMaxParticipants(8);
      setPrize(0);
      setTrackCondition("Dry turf");
      setWeatherSnapshot("Sunny");

      void loadDetails();
    } catch (e: any) {
      toast.error(e.message || "Tạo vòng đua thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Race Delete
  const handleDeleteRace = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vòng đua "${name}"?`)) return;
    setActionLoading(id);
    try {
      await racesApi.delete(id);
      toast.success("Xóa vòng đua thành công");
      void loadDetails();
    } catch (e: any) {
      toast.error(e.message || "Không thể xóa vòng đua");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Race Status Change
  const handleStatusChange = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      await racesApi.updateStatus(id, newStatus);
      toast.success(`Cập nhật trạng thái vòng đua thành: ${newStatus}`);
      void loadDetails();
    } catch (e: any) {
      toast.error(e.message || "Cập nhật trạng thái thất bại");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-[#E10600]" />
        <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải thông tin chi tiết giải đấu...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center max-w-xl mx-auto shadow-2xl">
        <AlertCircle className="size-16 text-red-500 mx-auto mb-4 stroke-[1.5]" />
        <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">Giải đấu không tồn tại</h3>
        <Button asChild className="rounded-full bg-white/5 text-foreground mt-4">
          <Link href="/admin/tournaments">Quay lại danh sách giải đấu</Link>
        </Button>
      </div>
    );
  }

  const totalPrizeAllocated = races.reduce((sum, r) => sum + (r.prize || 0), 0);
  const totalBudget = tournament.prizePool || tournament.prize || 0;
  const remainingBudget = totalBudget - totalPrizeAllocated;
  const budgetPercent = totalBudget > 0 ? Math.min(100, Math.max(0, (totalPrizeAllocated / totalBudget) * 100)) : 0;

  // Real-time validations for race creation
  const raceStart = startTime ? new Date(startTime) : null;
  const tStartPart = typeof tournament?.startDate === "string" ? tournament.startDate.split("T")[0] : "";
  const tEndPart = typeof tournament?.endDate === "string" ? tournament.endDate.split("T")[0] : "";
  const localStartLimit = tStartPart ? new Date(`${tStartPart}T00:00:00`) : null;
  const localEndLimit = tEndPart ? new Date(`${tEndPart}T23:59:59.999`) : null;

  const isStartTimeTooEarly = !!(raceStart && localStartLimit && raceStart < localStartLimit);
  const isStartTimeTooLate = !!(raceStart && localEndLimit && raceStart > localEndLimit);
  const isStartTimeInvalid = isStartTimeTooEarly || isStartTimeTooLate;

  const isNameInvalid = raceName.length > 0 && !raceName.trim();
  const isDistanceInvalid = distanceMeters < 100;
  const isPrizeInvalid = prize < 0 || prize > remainingBudget;
  const isLapCountInvalid = lapCount < 1;
  const isMaxParticipantsInvalid = maxParticipants < 2;

  const isFormInvalid =
    !raceName.trim() ||
    !startTime ||
    isStartTimeInvalid ||
    isDistanceInvalid ||
    isPrizeInvalid ||
    isLapCountInvalid ||
    isMaxParticipantsInvalid;

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <Link
          href="/admin/tournaments"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition mb-3"
        >
          <ChevronLeft className="size-4" /> Quay lại quản lý giải đấu
        </Link>
        
        <PageHeader
          eyebrow="Chi tiết giải đấu"
          title={tournament.name}
          description="Quản lý chi tiết hồ sơ giải đấu chính và lập lịch các vòng đua nhỏ tương ứng."
          actions={
            <Button 
              onClick={() => setShowCreateModal(true)} 
              className="rounded-full bg-[#E10600] hover:bg-[#B80500] text-foreground font-bold uppercase tracking-wider text-xs px-5 h-10 flex items-center gap-1.5"
            >
              <Plus className="size-4" /> Thêm Vòng Đua Mới
            </Button>
          }
        />
      </div>

      {/* Tournament Info Deck */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Main Details Card */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-[0_18px_56px_rgba(0,0,0,0.28)] relative overflow-hidden flex flex-col md:flex-row">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary to-transparent z-10" />
          
          {/* Tournament Image on Left */}
          {tournament.imageUrl ? (
            <div className="w-full md:w-64 h-48 md:h-auto relative shrink-0 border-b md:border-b-0 md:border-r border-border bg-muted/80">
              <img
                src={tournament.imageUrl}
                alt={tournament.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full md:w-64 h-48 md:h-auto relative shrink-0 flex items-center justify-center border-b md:border-b-0 md:border-r border-border bg-muted">
              <Trophy className="size-16 text-muted-foreground/10" />
            </div>
          )}

          {/* Details on Right */}
          <div className="p-6 flex-1 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#E10600] flex items-center gap-1.5">
                <Trophy className="size-4 animate-pulse" /> Hồ Sơ Giải Đấu Chính
              </h3>
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${
                tournament.status === "OPEN_REGISTRATION" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" : "text-muted-foreground border-border bg-white/5"
              }`}>
                {tournament.status}
              </span>
            </div>

            {tournament.description && (
              <p className="text-sm text-foreground/70 leading-relaxed">{tournament.description}</p>
            )}

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs pt-4 border-t border-border text-muted-foreground">
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">Địa điểm tổ chức</span>
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary" /> {tournament.location || "Chưa thiết lập"}
                </span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">Thời gian giải đấu</span>
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" /> 
                  {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString("vi-VN") : "?"} - {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString("vi-VN") : "?"}
                </span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">Thời gian nhận đăng ký</span>
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-teal-400" />
                  {tournament.registrationStartDate ? new Date(tournament.registrationStartDate).toLocaleDateString("vi-VN") : "Chưa mở"} - {tournament.registrationEndDate ? new Date(tournament.registrationEndDate).toLocaleDateString("vi-VN") : "Chưa mở"}
                </span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-0.5">Sức chứa tối đa</span>
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Users className="size-3.5 text-primary" /> {tournament.maxHorses ?? "?"} chiến mã
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget & Stats card */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-[0_18px_56px_rgba(0,0,0,0.28)] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-teal-500 to-transparent" />
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-teal-400">Ngân Quỹ Giải Đấu</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tổng ngân quỹ:</span>
                <span className="font-bold text-foreground">{(tournament.prizePool || tournament.prize || 0).toLocaleString()} pts</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Đã phân bổ:</span>
                <span className="font-bold text-foreground">{totalPrizeAllocated.toLocaleString()} pts</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden my-2 border border-border">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${remainingBudget < 0 ? "bg-red-500" : "bg-teal-500"}`}
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-xs border-t border-border pt-1.5 text-muted-foreground">
                <span>Ngân quỹ còn lại:</span>
                <span className={`font-bold ${remainingBudget < 0 ? "text-red-400" : "text-teal-400"}`}>{remainingBudget.toLocaleString()} pts</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground/70 pt-4 border-t border-border">
            Lưu ý: Tổng ngân quỹ các vòng đua nhỏ không được vượt quá quỹ thưởng của giải đấu chính.
          </div>
        </div>
      </section>

      {/* Races List */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <h3 className="text-lg font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            Danh sách vòng đua nhỏ ({races.length})
          </h3>
          <Button onClick={loadDetails} variant="ghost" className="size-8 p-0 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground">
            <RefreshCw className="size-4" />
          </Button>
        </div>

        {races.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card/70 p-12 text-center shadow-xl">
            <Milestone className="size-12 text-muted-foreground/30 mx-auto mb-3 stroke-[1.5]" />
            <h4 className="text-base font-bold text-foreground uppercase tracking-wider mb-1">Chưa có vòng đua nào</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">Giải đấu chính hiện chưa được phân bổ vòng đua nhỏ nào. Vui lòng bấm vào nút thêm mới để lập lịch.</p>
            <Button onClick={() => setShowCreateModal(true)} className="rounded-full bg-white/5 border border-border text-foreground text-xs hover:bg-[#E10600] transition">
              <Plus className="size-3.5 mr-1" /> Thêm vòng đua
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-white/[0.02] text-muted-foreground font-black uppercase tracking-wider">
                    <th className="p-4 w-12">#</th>
                    <th className="p-4">Tên vòng đua</th>
                    <th className="p-4">Cự ly / Mặt sân</th>
                    <th className="p-4">Thời gian xuất phát</th>
                    <th className="p-4">Số lượng</th>
                    <th className="p-4">Giải thưởng</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-foreground/70">
                  {races.map((race, index) => {
                    const isLocked = ["LIVE", "FINISHED", "RESULT_PUBLISHED"].includes(race.status);
                    return (
                      <tr 
                        key={race._id} 
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.closest('select') || target.closest('button')) return;
                          void handleOpenRaceDetails(race);
                        }}
                        className="hover:bg-white/[0.03] cursor-pointer transition duration-200"
                        title="Click to view detailed race information"
                      >
                        <td className="p-4 font-mono font-bold text-muted-foreground/70">{index + 1}</td>
                        <td className="p-4 font-bold text-foreground">
                          <span className="block">{race.name}</span>
                          {race.description && <span className="text-[10px] text-muted-foreground/70 font-normal line-clamp-1">{race.description}</span>}
                        </td>
                        <td className="p-4">
                          <span className="block font-bold">{race.distanceMeters}m</span>
                          <span className="text-[10px] text-muted-foreground/70">{race.trackCondition || "Dry turf"}</span>
                        </td>
                        <td className="p-4 font-mono font-bold">
                          {new Date(race.startTime).toLocaleString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="p-4">
                          <span className="font-mono font-bold">{race.participantsCount || 0}</span>/{race.maxParticipants || 8} chiến mã
                        </td>
                        <td className="p-4 font-mono font-bold text-teal-400">
                          {(race.prize || 0).toLocaleString()} pts
                        </td>
                        <td className="p-4">
                          <select
                            value={race.status}
                            disabled={actionLoading === race._id}
                            onChange={(e) => handleStatusChange(race._id, e.target.value)}
                            className={`rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-muted focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50 cursor-pointer ${raceStatusColors[race.status] || "text-muted-foreground border-border"}`}
                          >
                            {raceStatusOptions.map(opt => (
                              <option key={opt} value={opt} className="bg-card text-foreground">{opt}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteRace(race._id, race.name)}
                            disabled={actionLoading === race._id || isLocked}
                            className="rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/20 px-2.5 py-1.5 text-red-400 hover:text-foreground transition disabled:opacity-30 disabled:hover:bg-red-500/5 disabled:hover:text-red-400"
                            title={isLocked ? "Trận đấu đang diễn ra hoặc đã kết thúc, không thể xóa" : "Xóa vòng đua"}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Create Race Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 my-8">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary to-transparent" />
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E10600]">New Round Setup</p>
                <h3 className="text-xl font-black uppercase text-foreground mt-1">Tạo Vòng Đua Mới</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground/70 hover:text-foreground text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateRace} className="space-y-4">
              {/* Race Name */}
              <label className="grid gap-1.5 text-xs font-bold text-foreground">
                Tên vòng đua <span className="text-primary">*</span>
                <input
                  type="text"
                  required
                  value={raceName}
                  onChange={(e) => setRaceName(e.target.value)}
                  className={`h-10 w-full rounded-xl border px-3 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 ${
                    isNameInvalid
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5"
                      : "border-border bg-muted focus:border-primary focus:ring-primary/20"
                  }`}
                  placeholder="Ví dụ: Vòng loại 100m, Bán kết 1000m..."
                />
                {isNameInvalid && (
                  <span className="text-[10px] text-red-400 font-semibold mt-1">
                    Tên vòng đua không thể chỉ chứa khoảng trắng.
                  </span>
                )}
              </label>

              {/* Start Time */}
              <label className="grid gap-1.5 text-xs font-bold text-foreground">
                Thời gian xuất phát <span className="text-primary">*</span>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`h-10 w-full rounded-xl border px-3 text-xs text-foreground outline-none focus:ring-1 cursor-pointer ${
                    isStartTimeInvalid
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5"
                      : "border-border bg-muted focus:border-primary focus:ring-primary/20"
                  }`}
                />
                {isStartTimeTooEarly && localStartLimit && (
                  <span className="text-[10px] text-red-400 font-semibold mt-1">
                    Thời gian phải từ ngày bắt đầu giải đấu: {localStartLimit.toLocaleDateString("vi-VN")}.
                  </span>
                )}
                {isStartTimeTooLate && localEndLimit && (
                  <span className="text-[10px] text-red-400 font-semibold mt-1">
                    Thời gian không được sau ngày kết thúc giải đấu: {localEndLimit.toLocaleDateString("vi-VN")}.
                  </span>
                )}
                {!isStartTimeInvalid && (
                  <span className="text-[10px] text-muted-foreground/70 font-normal">
                    Giới hạn giải đấu: {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString("vi-VN") : ""} - {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString("vi-VN") : ""}
                  </span>
                )}
              </label>

              <div className="grid grid-cols-2 gap-4">
                {/* Distance */}
                <label className="grid gap-1.5 text-xs font-bold text-foreground">
                  Cự ly thi đấu (m) <span className="text-primary">*</span>
                  <input
                    type="number"
                    min={100}
                    required
                    value={distanceMeters}
                    onChange={(e) => setDistanceMeters(parseInt(e.target.value) || 0)}
                    className={`h-10 w-full rounded-xl border px-3 text-xs text-foreground font-mono focus:outline-none focus:ring-1 ${
                      isDistanceInvalid
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5"
                        : "border-border bg-muted focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                  {isDistanceInvalid && (
                    <span className="text-[10px] text-red-400 font-semibold mt-1">
                      Cự ly tối thiểu là 100m.
                    </span>
                  )}
                </label>

                {/* Prize */}
                <label className="grid gap-1.5 text-xs font-bold text-foreground">
                  Giải thưởng (Points)
                  <input
                    type="number"
                    min={0}
                    value={prize}
                    onChange={(e) => setPrize(parseInt(e.target.value) || 0)}
                    className={`h-10 w-full rounded-xl border px-3 text-xs text-foreground font-mono focus:outline-none focus:ring-1 ${
                      isPrizeInvalid
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5"
                        : "border-border bg-muted focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                  {prize > remainingBudget ? (
                    <span className="text-[10px] text-red-400 font-semibold mt-1 animate-pulse">
                      Vượt quá ngân quỹ còn lại: {(prize - remainingBudget).toLocaleString()} pts!
                    </span>
                  ) : prize < 0 ? (
                    <span className="text-[10px] text-red-400 font-semibold mt-1">
                      Giải thưởng không được là số âm.
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/70 font-normal">
                      Còn khả dụng: {(remainingBudget - prize).toLocaleString()} pts
                    </span>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Lap Count */}
                <label className="grid gap-1.5 text-xs font-bold text-foreground">
                  Số vòng đua (Laps)
                  <input
                    type="number"
                    min={1}
                    value={lapCount}
                    onChange={(e) => setLapCount(parseInt(e.target.value) || 0)}
                    className={`h-10 w-full rounded-xl border px-3 text-xs text-foreground font-mono focus:outline-none focus:ring-1 ${
                      isLapCountInvalid
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5"
                        : "border-border bg-muted focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                  {isLapCountInvalid && (
                    <span className="text-[10px] text-red-400 font-semibold mt-1">
                      Số vòng tối thiểu là 1.
                    </span>
                  )}
                </label>

                {/* Max Participants */}
                <label className="grid gap-1.5 text-xs font-bold text-foreground">
                  Số ngựa tối đa
                  <input
                    type="number"
                    min={2}
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 0)}
                    className={`h-10 w-full rounded-xl border px-3 text-xs text-foreground font-mono focus:outline-none focus:ring-1 ${
                      isMaxParticipantsInvalid
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5"
                        : "border-border bg-muted focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                  {isMaxParticipantsInvalid && (
                    <span className="text-[10px] text-red-400 font-semibold mt-1">
                      Số ngựa tối thiểu là 2.
                    </span>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Surface / Track Condition */}
                <label className="grid gap-1.5 text-xs font-bold text-foreground">
                  Mặt sân (Track Condition)
                  <select
                    value={trackCondition}
                    onChange={(e) => setTrackCondition(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Dry turf">Dry turf (Cỏ khô)</option>
                    <option value="Wet turf">Wet turf (Cỏ ướt)</option>
                    <option value="Muddy">Muddy (Bùn đất)</option>
                    <option value="Synthetic">Synthetic (Nhân tạo)</option>
                  </select>
                </label>

                {/* Weather Snapshot */}
                <label className="grid gap-1.5 text-xs font-bold text-foreground">
                  Thời tiết (Weather Snapshot)
                  <select
                    value={weatherSnapshot}
                    onChange={(e) => setWeatherSnapshot(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Sunny">Sunny (Nắng rực rỡ)</option>
                    <option value="Cloudy">Cloudy (Nhiều mây)</option>
                    <option value="Rainy">Rainy (Mưa rào)</option>
                    <option value="Windy">Windy (Nhiều gió)</option>
                  </select>
                </label>
              </div>

              {/* Description */}
              <label className="grid gap-1.5 text-xs font-bold text-foreground">
                Mô tả vòng đua
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted p-3 text-xs text-foreground outline-none focus:border-primary resize-none"
                  placeholder="Nhập thông tin ngắn gọn của vòng đua..."
                />
              </label>

              {/* Validation Alert Box */}
              {isFormInvalid && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 flex gap-2.5 items-start animate-fade-in">
                  <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-400">Thông tin chưa hợp lệ</p>
                    <p className="text-[10px] text-red-400/80 mt-0.5">Vui lòng kiểm tra lại các trường được đánh dấu đỏ.</p>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={submitting}
                  className="rounded-xl px-4 h-10 border border-border hover:bg-white/5 text-foreground"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || isFormInvalid}
                  className="rounded-xl px-5 h-10 bg-[#E10600] hover:bg-[#B80500] text-foreground font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Lưu vòng đấu"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Race Detail Modal */}
      {selectedRace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary to-teal-500" />
            
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${raceStatusColors[selectedRace.status] || "text-muted-foreground border-border bg-white/5"}`}>
                  {selectedRace.status}
                </span>
                <h3 className="text-xl font-black uppercase text-foreground mt-1.5">{selectedRace.name}</h3>
              </div>
              <button 
                onClick={() => { setSelectedRace(null); setRaceRegistrations([]); }}
                className="text-muted-foreground/70 hover:text-foreground text-lg font-bold bg-white/5 hover:bg-white/10 rounded-lg size-8 flex items-center justify-center transition"
              >
                &times;
              </button>
            </div>

            {/* General Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-white/[0.02] border border-border rounded-xl p-3">
                <span className="block text-[10px] uppercase text-muted-foreground/70 font-bold mb-1">Cự ly thi đấu</span>
                <span className="text-sm font-black text-foreground">{selectedRace.distanceMeters} mét</span>
              </div>
              <div className="bg-white/[0.02] border border-border rounded-xl p-3">
                <span className="block text-[10px] uppercase text-muted-foreground/70 font-bold mb-1">Số vòng chạy</span>
                <span className="text-sm font-black text-foreground">{selectedRace.lapCount || 1} vòng</span>
              </div>
              <div className="bg-white/[0.02] border border-border rounded-xl p-3">
                <span className="block text-[10px] uppercase text-muted-foreground/70 font-bold mb-1">Mặt sân đua</span>
                <span className="text-sm font-black text-foreground">{selectedRace.trackCondition || "Dry turf"}</span>
              </div>
              <div className="bg-white/[0.02] border border-border rounded-xl p-3">
                <span className="block text-[10px] uppercase text-muted-foreground/70 font-bold mb-1">Dự báo thời tiết</span>
                <span className="text-sm font-black text-foreground">{selectedRace.weatherSnapshot || "Sunny"}</span>
              </div>
              <div className="bg-white/[0.02] border border-border rounded-xl p-3">
                <span className="block text-[10px] uppercase text-muted-foreground/70 font-bold mb-1">Quỹ giải thưởng</span>
                <span className="text-sm font-black text-teal-400">{(selectedRace.prize || 0).toLocaleString()} pts</span>
              </div>
              <div className="bg-white/[0.02] border border-border rounded-xl p-3">
                <span className="block text-[10px] uppercase text-muted-foreground/70 font-bold mb-1">Giới hạn số ngựa</span>
                <span className="text-sm font-black text-foreground">{(selectedRace.participantsCount || 0)} / {selectedRace.maxParticipants || 8} chiến mã</span>
              </div>
            </div>

            {selectedRace.description && (
              <div className="bg-white/[0.01] border border-border rounded-xl p-4 text-xs text-foreground/70 space-y-1">
                <span className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Thông tin mô tả</span>
                <p className="leading-relaxed">{selectedRace.description}</p>
              </div>
            )}

            {/* Registrations/Participants list */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Users className="size-4 text-primary" /> Chiến mã đã đăng ký thi đấu ({raceRegistrations.length})
              </h4>
              
              {loadingRegistrations ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  <p className="mt-2 text-[10px] uppercase tracking-wider font-mono">Đang tải danh sách chiến mã...</p>
                </div>
              ) : raceRegistrations.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-xl bg-white/[0.01] text-xs text-muted-foreground/70">
                  Chưa có chiến mã nào được ghi danh tham gia vòng đua này.
                </div>
              ) : (
                <div className="rounded-xl border border-border overflow-hidden bg-muted max-h-48 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-white/[0.03] border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                        <th className="p-2.5 w-10">Cổng</th>
                        <th className="p-2.5">Chiến mã</th>
                        <th className="p-2.5">Chủ ngựa (Owner)</th>
                        <th className="p-2.5">Nài ngựa (Jockey)</th>
                        <th className="p-2.5 text-right">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-foreground/70">
                      {raceRegistrations.map((reg, idx) => (
                        <tr key={reg._id} className="hover:bg-white/[0.01]">
                          <td className="p-2.5 font-mono font-bold text-muted-foreground/70">#{reg.gateNumber ?? idx + 1}</td>
                          <td className="p-2.5 font-bold text-foreground">
                            {reg.horseId?.name || "Chiến mã ẩn"}
                            {reg.horseId?.breed && <span className="block text-[9px] text-muted-foreground/60 font-normal">{reg.horseId.breed}</span>}
                          </td>
                          <td className="p-2.5">
                            {reg.ownerId?.fullName || "N/A"}
                            {reg.ownerId?.email && <span className="block text-[9px] text-muted-foreground/60">{reg.ownerId.email}</span>}
                          </td>
                          <td className="p-2.5">
                            {reg.jockeyUserId?.fullName || "Chưa gán"}
                            {reg.jockeyUserId?.email && <span className="block text-[9px] text-muted-foreground/60">{reg.jockeyUserId.email}</span>}
                          </td>
                          <td className="p-2.5 text-right">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
                              reg.status === "APPROVED"
                                ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                                : reg.status === "PENDING"
                                ? "text-amber-400 border-amber-500/20 bg-amber-500/10"
                                : "text-red-400 border-red-500/20 bg-red-500/10"
                            }`}>
                              {reg.status === "APPROVED" ? "Đã duyệt" : reg.status === "PENDING" ? "Chờ duyệt" : reg.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button 
                onClick={() => { setSelectedRace(null); setRaceRegistrations([]); }}
                className="rounded-xl px-5 h-10 bg-white/5 hover:bg-white/10 text-foreground font-bold uppercase tracking-wider text-xs border border-border"
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
