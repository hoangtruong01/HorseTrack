"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Trophy, Calendar, MapPin, Award, Users, Search, 
  ArrowLeft, Flag, Loader2, Compass, Layers, Activity, User, ShieldCheck, ChevronRight,
  CheckCircle, Coins
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  tournamentsApi,
  racesApi,
  registrationsApi,
  refereeAssignmentsApi,
  predictionsApi,
  walletApi,
  type TournamentItem,
  type RaceItem,
  type RegistrationItem,
  type AssignmentItem,
  type PredictionItem
} from "@/lib/api-client";
import { toast } from "sonner";

const getStatusLabel = (status: string) => {
  switch (status) {
    case "DRAFT": return "Nháp";
    case "UPCOMING": return "Sắp diễn ra";
    case "OPEN_REGISTRATION": return "Mở đăng ký";
    case "REGISTRATION_CLOSED": return "Đóng đăng ký";
    case "ONGOING": return "Đang diễn ra";
    case "COMPLETED": return "Đã kết thúc";
    case "CANCELLED": return "Đã hủy";
    default: return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ONGOING":
      return "bg-[#E10600]/80 border-[#E10600]";
    case "OPEN_REGISTRATION":
      return "bg-teal-500/80 border-teal-500";
    case "UPCOMING":
      return "bg-blue-500/80 border-blue-500";
    case "COMPLETED":
      return "bg-purple-500/80 border-purple-500";
    default:
      return "bg-white/10 border-white/20";
  }
};

const getRaceStatusColor = (status: string) => {
  switch (status) {
    case "LIVE":
      return "bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-pulse";
    case "FINISHED":
    case "RESULT_PUBLISHED":
      return "bg-white/5 border border-border text-muted-foreground";
    case "SCHEDULED":
      return "bg-blue-500/10 border border-blue-500/20 text-blue-400";
    case "CHECKING":
    case "READY":
      return "bg-amber-500/10 border border-amber-500/20 text-amber-400";
    default:
      return "bg-primary/10 border border-primary/20 text-primary";
  }
};

const getRaceStatusLabel = (status: string) => {
  switch (status) {
    case "LIVE": return "ĐANG DIỄN RA (LIVE)";
    case "FINISHED": return "ĐÃ KẾT THÚC";
    case "RESULT_PUBLISHED": return "KẾT QUẢ ĐÃ ĐĂNG";
    case "SCHEDULED": return "ĐÃ LÊN LỊCH";
    case "CHECKING": return "ĐANG ĐIỂM DANH";
    case "READY": return "SẴN SÀNG XUẤT PHÁT";
    case "CANCELLED": return "ĐÃ HỦY";
    default: return status;
  }
};

export default function SpectatorTournamentsPage() {
  const [activeTab, setActiveTab] = useState<"tournaments" | "races">("tournaments");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "races") {
        setActiveTab("races");
      }
    }
  }, []);
  
  // Lists
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [allRaces, setAllRaces] = useState<RaceItem[]>([]);
  
  // Selection
  const [selectedTour, setSelectedTour] = useState<TournamentItem | null>(null);
  const [selectedTourRaces, setSelectedTourRaces] = useState<RaceItem[]>([]);
  const [selectedRace, setSelectedRace] = useState<RaceItem | null>(null);
  const [selectedRaceRegistrations, setSelectedRaceRegistrations] = useState<RegistrationItem[]>([]);
  const [selectedRaceReferee, setSelectedRaceReferee] = useState<AssignmentItem | null>(null);
  
  // Prediction states
  const [myPredictions, setMyPredictions] = useState<PredictionItem[]>([]);
  const [selectedHorseId, setSelectedHorseId] = useState("");
  const [submittingPrediction, setSubmittingPrediction] = useState(false);
  const [, setLoadingPredictions] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [betPointsInput, setBetPointsInput] = useState<string>("1");
  
  // Loaders
  const [loadingTours, setLoadingTours] = useState(true);
  const [loadingAllRaces, setLoadingAllRaces] = useState(true);
  const [loadingTourRaces, setLoadingTourRaces] = useState(false);
  const [loadingRaceDetails, setLoadingRaceDetails] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [raceStatusFilter, setRaceStatusFilter] = useState("ALL");

  const fetchTournaments = useCallback(async () => {
    setLoadingTours(true);
    try {
      const res = await tournamentsApi.list({ page: 1, limit: 100 });
      // Exclude DRAFT tournaments for spectators
      const publicTournaments = (res.data || []).filter(t => t.status !== "DRAFT");
      setTournaments(publicTournaments);
    } catch (e) {
      console.error("Lỗi khi tải danh sách giải đấu:", e);
      toast.error("Không thể tải danh sách giải đấu");
    } finally {
      setLoadingTours(false);
    }
  }, []);

  const fetchAllRaces = useCallback(async () => {
    setLoadingAllRaces(true);
    try {
      const res = await racesApi.list({ page: 1, limit: 100 });
      // Exclude DRAFT races for spectators
      const publicRaces = (res.data || []).filter(r => r.status !== "DRAFT");
      setAllRaces(publicRaces);
    } catch (e) {
      console.error("Lỗi khi tải danh sách trận đua:", e);
      toast.error("Không thể tải danh sách trận đua toàn hệ thống");
    } finally {
      setLoadingAllRaces(false);
    }
  }, []);

  const fetchMyPredictions = useCallback(async () => {
    setLoadingPredictions(true);
    try {
      const res = await predictionsApi.listMyPredictions({ page: 1, limit: 100 });
      setMyPredictions(res.data || []);
    } catch (e) {
      console.error("Lỗi khi tải dự đoán cá nhân:", e);
    } finally {
      setLoadingPredictions(false);
    }
  }, []);

  const fetchBalance = useCallback(async () => {
    setLoadingBalance(true);
    try {
      const res = await walletApi.myHistory();
      setBalance(res.points ?? 0);
    } catch (e) {
      console.error("Lỗi khi lấy số dư ví:", e);
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  const handlePredictSubmit = async () => {
    if (!selectedRace) return;
    if (!selectedHorseId) {
      toast.error("Vui lòng chọn 1 chiến mã trước khi gửi dự đoán!");
      return;
    }

    const betPoints = parseInt(betPointsInput) || 1;
    if (betPoints < 1) {
      toast.error("Số điểm đặt cược phải lớn hơn hoặc bằng 1!");
      return;
    }

    if (betPoints >= 2 && betPoints > balance) {
      toast.error(`Số dư điểm không đủ (cần ${betPoints} Pts, hiện có ${balance} Pts)!`);
      return;
    }

    setSubmittingPrediction(true);
    try {
      await predictionsApi.create({
        raceId: selectedRace._id,
        predictedHorseId: selectedHorseId,
        betPoints: betPoints,
      });
      toast.success("Đặt dự đoán thành công!");
      setSelectedHorseId("");
      setBetPointsInput("1");
      await fetchMyPredictions();
      await fetchBalance();
    } catch (e) {
      console.error("Lỗi khi gửi dự đoán:", e);
      const errMsg = (e as Error).message || "";
      if (errMsg.includes("already have a prediction") || errMsg.includes("đã đặt dự đoán")) {
        toast.error("Bạn đã đặt dự đoán cho trận đấu này rồi!");
      } else {
        toast.error(errMsg || "Đặt dự đoán thất bại!");
      }
    } finally {
      setSubmittingPrediction(false);
    }
  };

  useEffect(() => {
    void fetchTournaments();
    void fetchAllRaces();
    void fetchMyPredictions();
    void fetchBalance();
  }, [fetchTournaments, fetchAllRaces, fetchMyPredictions, fetchBalance]);

  const handleSelectTournament = useCallback(async (t: TournamentItem) => {
    setSelectedTour(t);
    setSelectedRace(null);
    setLoadingTourRaces(true);
    try {
      const res = await racesApi.listByTournament(t._id, { limit: 100 });
      const publicRaces = (res.data || []).filter(r => r.status !== "DRAFT");
      setSelectedTourRaces(publicRaces);
    } catch (e) {
      console.error("Lỗi khi tải danh sách vòng đua:", e);
      setSelectedTourRaces([]);
    } finally {
      setLoadingTourRaces(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && tournaments.length > 0 && !selectedTour) {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (id) {
        const tour = tournaments.find((t) => t._id === id);
        if (tour) {
          void handleSelectTournament(tour);
          // Xóa param khỏi URL để người dùng có thể quay lại danh sách
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
  }, [tournaments, selectedTour, handleSelectTournament]);

  const handleSelectRace = async (race: RaceItem) => {
    setSelectedRace(race);
    setLoadingRaceDetails(true);
    try {
      // 1. Fetch approved registrations (participants)
      const regRes = await registrationsApi.list({ 
        raceId: race._id, 
        status: "APPROVED", 
        limit: 100 
      });
      setSelectedRaceRegistrations(regRes.data || []);

      // 2. Fetch referee assignments
      const refRes = await refereeAssignmentsApi.listByRace(race._id, { limit: 5 });
      if (refRes.data && refRes.data.length > 0) {
        setSelectedRaceReferee(refRes.data[0]);
      } else {
        setSelectedRaceReferee(null);
      }
    } catch (e) {
      console.error("Lỗi khi tải chi tiết trận đua:", e);
      toast.error("Không thể tải thông tin đội hình tham gia trận đấu");
      setSelectedRaceRegistrations([]);
      setSelectedRaceReferee(null);
    } finally {
      setLoadingRaceDetails(false);
    }
  };

  // Filter Tournaments
  const filteredTournaments = tournaments.filter((tour) => {
    const matchesSearch = tour.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (tour.location && tour.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    if (statusFilter !== "ALL") {
      matchesStatus = tour.status === statusFilter;
    }
    return matchesSearch && matchesStatus;
  });

  // Filter Flat Races
  const filteredFlatRaces = allRaces.filter((race) => {
    const tourName = typeof race.tournamentId === "object" ? race.tournamentId?.name || "" : "";
    const matchesSearch = race.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tourName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (race.location && race.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    if (raceStatusFilter !== "ALL") {
      matchesStatus = race.status === raceStatusFilter;
    }
    return matchesSearch && matchesStatus;
  });

  // Dynamic Timeline builder based on real status
  const getTimeline = (status: string) => {
    switch (status) {
      case "CANCELLED":
        return [
          { step: "Scheduled", desc: "Đã lên lịch đua", status: "complete" },
          { step: "Cancelled", desc: "Trận đấu đã bị hủy bỏ", status: "cancelled" }
        ];
      case "FINISHED":
      case "RESULT_PUBLISHED":
        return [
          { step: "Scheduled", desc: "Đã chốt danh sách & lịch trình", status: "complete" },
          { step: "Pre-check", desc: "Trọng tài hoàn thành kiểm tra thú y và jockey", status: "complete" },
          { step: "Live Race", desc: "Chiến mã bứt tốc trên đường chạy", status: "complete" },
          { step: "Finished", desc: "Cán đích chính thức & công bố xếp hạng", status: "complete" },
        ];
      case "LIVE":
        return [
          { step: "Scheduled", desc: "Đã chốt danh sách & lịch trình", status: "complete" },
          { step: "Pre-check", desc: "Trọng tài hoàn thành kiểm tra thú y và jockey", status: "complete" },
          { step: "Live Race", desc: "Trực tiếp: Chiến mã đang bứt tốc về đích", status: "current" },
          { step: "Finished", desc: "Cán đích chính thức & công bố xếp hạng", status: "pending" },
        ];
      case "READY":
      case "CHECKING":
        return [
          { step: "Scheduled", desc: "Đã chốt danh sách & lịch trình", status: "complete" },
          { step: "Pre-check", desc: "Trọng tài đang tiến hành roll-call & khám sức khỏe ngựa", status: "current" },
          { step: "Live Race", desc: "Trực tiếp: Chiến mã đang bứt tốc về đích", status: "pending" },
          { step: "Finished", desc: "Cán đích chính thức & công bố xếp hạng", status: "pending" },
        ];
      default: // SCHEDULED
        return [
          { step: "Scheduled", desc: "Đã lên lịch đua độc lập", status: "current" },
          { step: "Pre-check", desc: "Chuẩn bị kiểm tra thú y & jockey trước giờ G", status: "pending" },
          { step: "Live Race", desc: "Trực tiếp: Chiến mã đang bứt tốc về đích", status: "pending" },
          { step: "Finished", desc: "Cán đích chính thức & công bố xếp hạng", status: "pending" },
        ];
    }
  };

  const currentRacePrediction = myPredictions.find((p) => {
    const pRaceId = typeof p.raceId === "object" ? p.raceId?._id : p.raceId;
    return pRaceId === selectedRace?._id;
  });

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Premium Sub-Header Title */}
      {!selectedTour && !selectedRace && (
        <PageHeader
          eyebrow="Spectator Center"
          title="Giải Đấu & Lịch Đua"
          description="Duyệt qua danh sách các giải đua chiến mã đỉnh cao, theo dõi lịch trình trận đấu và khám phá sơ đồ đường đua chi tiết."
        />
      )}

      {/* TẦNG 1: LIST VIEW (TOURNAMENTS / ALL RACES FLAT LIST) */}
      {!selectedTour && !selectedRace && (
        <div className="space-y-6">
          {/* Unified Tab Selector */}
          <div className="flex border-b border-border">
            <button
              onClick={() => { setActiveTab("tournaments"); setSearchTerm(""); }}
              className={`pb-3 px-6 text-sm font-black uppercase tracking-wider transition-colors duration-200 border-b-2 -mb-[2px] flex items-center gap-2 ${
                activeTab === "tournaments"
                  ? "border-[#E10600] text-white"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Trophy className="size-4" /> Danh Sách Giải Đấu
            </button>
            <button
              onClick={() => { setActiveTab("races"); setSearchTerm(""); }}
              className={`pb-3 px-6 text-sm font-black uppercase tracking-wider transition-colors duration-200 border-b-2 -mb-[2px] flex items-center gap-2 ${
                activeTab === "races"
                  ? "border-[#E10600] text-white"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Flag className="size-4" /> Tất Cả Lịch Đua
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center rounded-2xl border border-border bg-card p-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={activeTab === "tournaments" ? "Tìm kiếm giải đấu, địa điểm..." : "Tìm trận đấu, tên giải, địa điểm..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-muted/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
              {activeTab === "tournaments" ? (
                ["ALL", "ONGOING", "OPEN_REGISTRATION", "COMPLETED"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
                      statusFilter === status
                        ? "bg-[#E10600] text-white border border-[#E10600]"
                        : "bg-muted border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {status === "ALL" ? "Tất cả" : status === "ONGOING" ? "Đang diễn" : status === "OPEN_REGISTRATION" ? "Mở đăng ký" : "Kết thúc"}
                  </button>
                ))
              ) : (
                ["ALL", "LIVE", "SCHEDULED", "FINISHED", "RESULT_PUBLISHED"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setRaceStatusFilter(status)}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
                      raceStatusFilter === status
                        ? "bg-[#E10600] text-white border border-[#E10600]"
                        : "bg-muted border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {status === "ALL" ? "Tất cả" : status === "LIVE" ? "Trực tiếp" : status === "SCHEDULED" ? "Sắp diễn" : status === "FINISHED" ? "Đã xong" : "Đã công bố"}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* TAB 1: TOURNAMENTS LIST */}
          {activeTab === "tournaments" && (
            loadingTours ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="size-8 animate-spin text-[#E10600]" />
                <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải danh sách giải đấu...</p>
              </div>
            ) : filteredTournaments.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-muted/30">
                <Trophy className="size-12 text-muted-foreground/40 mx-auto mb-3" />
                <h4 className="text-base font-bold text-foreground uppercase tracking-wider">Không tìm thấy giải đấu</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">Vui lòng thử tìm kiếm bằng từ khóa hoặc bộ lọc trạng thái khác.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTournaments.map((tour) => (
                  <div
                    key={tour._id}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition duration-300 flex flex-col h-full"
                  >
                    <div className="h-40 w-full overflow-hidden relative bg-muted">
                      {tour.imageUrl ? (
                        <Image
                          src={tour.imageUrl}
                          alt={tour.name}
                          fill
                          className="object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/50">
                          <Trophy className="size-12 text-white/5" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                      
                      {/* Status Badge */}
                      <span className={`absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white border backdrop-blur-md ${getStatusColor(tour.status)}`}>
                        {getStatusLabel(tour.status)}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-base font-black uppercase tracking-tight text-foreground leading-tight truncate group-hover:text-primary transition duration-300">
                          {tour.name}
                        </h3>
                        {tour.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {tour.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 pt-2 border-t border-border text-[10px] text-muted-foreground">
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1"><MapPin className="size-3 text-[#E10600]" /> {tour.location || "Chưa thiết lập"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3 text-[#E10600]" /> 
                            {tour.startDate ? new Date(tour.startDate).toLocaleDateString("vi-VN") : "?"} ~ {tour.endDate ? new Date(tour.endDate).toLocaleDateString("vi-VN") : "?"}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold text-foreground border-t border-border pt-2">
                          <span>Quỹ Giải Thưởng:</span>
                          <span className="text-[#E10600] text-xs font-black">
                            {(tour.prizePool || tour.prize || 0).toLocaleString("vi-VN")} Pts
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 pb-5">
                      <Button
                        onClick={() => handleSelectTournament(tour)}
                        variant="outline"
                        className="w-full rounded-xl text-xs font-black uppercase tracking-wider"
                      >
                        Xem Lịch Trình & Chi Tiết
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 2: FLAT RACES LIST */}
          {activeTab === "races" && (
            loadingAllRaces ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="size-8 animate-spin text-[#E10600]" />
                <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải danh sách lịch đua...</p>
              </div>
            ) : filteredFlatRaces.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-muted/30">
                <Flag className="size-12 text-muted-foreground/40 mx-auto mb-3" />
                <h4 className="text-base font-bold text-foreground uppercase tracking-wider">Không tìm thấy trận đua</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">Vui lòng thử tìm kiếm bằng từ khóa hoặc bộ lọc khác.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredFlatRaces.map((race) => {
                  const tourName = typeof race.tournamentId === "object" ? race.tournamentId?.name || "Giải đấu lẻ" : "Giải đấu";
                  return (
                    <div
                      key={race._id}
                      className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition duration-300 flex flex-col h-full"
                    >
                      {race.status === "LIVE" && (
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-rose-500 animate-pulse" />
                      )}

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[9px] text-[#E10600] font-black uppercase tracking-wider truncate block max-w-[150px]">
                              {tourName}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${getRaceStatusColor(race.status)}`}>
                              {getRaceStatusLabel(race.status)}
                            </span>
                          </div>

                          <h3 className="text-base font-black uppercase tracking-tight text-foreground leading-tight group-hover:text-primary transition duration-300">
                            {race.name}
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground bg-white/[0.01] rounded-xl p-3 border border-border">
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/60 font-black">Cự ly</span>
                            <span className="font-bold text-foreground text-xs">{race.distanceMeters}m</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/60 font-black font-mono">Địa điểm</span>
                            <span className="font-bold text-foreground text-[10px] truncate block">{race.location || "Trường đua chính"}</span>
                          </div>
                        </div>

                        <div className="space-y-1 text-[10px] text-muted-foreground pt-1">
                          <p className="flex items-center gap-1.5">
                            <Calendar className="size-3.5 text-[#E10600]" /> 
                            Xuất phát: <span className="font-bold text-foreground">
                              {new Date(race.startTime).toLocaleString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="px-5 pb-5">
                        <Button
                          onClick={() => handleSelectRace(race)}
                          variant="outline"
                          className="w-full rounded-xl text-xs font-black uppercase tracking-wider"
                        >
                          Xem Đội Hình & Chi Tiết
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      )}

      {/* TẦNG 2: DETAIL VIEW (TOURNAMENT DETAIL & CORRESPONDING RACES) */}
      {selectedTour && !selectedRace && (
        <div className="space-y-6">
          <Button
            onClick={() => setSelectedTour(null)}
            variant="ghost"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground -ml-2 flex items-center gap-1"
          >
            <ArrowLeft className="size-4" /> Quay lại danh sách giải
          </Button>

          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Left Side: General Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-6 relative overflow-hidden flex flex-col shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
                
                {selectedTour.imageUrl && (
                  <div className="w-full h-48 overflow-hidden rounded-xl border border-border bg-muted mb-2 relative">
                    <Image
                      src={selectedTour.imageUrl}
                      alt={selectedTour.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white border ${getStatusColor(selectedTour.status)}`}>
                    {getStatusLabel(selectedTour.status)}
                  </span>
                  <h2 className="text-xl font-black uppercase tracking-tight text-foreground leading-tight">{selectedTour.name}</h2>
                  {selectedTour.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{selectedTour.description}</p>
                  )}
                </div>

                <div className="space-y-3 border-t border-border pt-4 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><MapPin className="size-3.5 text-[#E10600]" /> Địa điểm:</span>
                    <span className="font-bold text-foreground">{selectedTour.location || "Chưa thiết lập"}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><Calendar className="size-3.5 text-[#E10600]" /> Thời gian giải:</span>
                    <span className="font-bold text-foreground">
                      {selectedTour.startDate ? new Date(selectedTour.startDate).toLocaleDateString("vi-VN") : "?"} ~ {selectedTour.endDate ? new Date(selectedTour.endDate).toLocaleDateString("vi-VN") : "?"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><Calendar className="size-3.5 text-teal-400" /> Nhận đăng ký:</span>
                    <span className="font-bold text-foreground">
                      {selectedTour.registrationStartDate ? new Date(selectedTour.registrationStartDate).toLocaleDateString("vi-VN") : "Chưa mở"} ~ {selectedTour.registrationEndDate ? new Date(selectedTour.registrationEndDate).toLocaleDateString("vi-VN") : "Chưa mở"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><Users className="size-3.5 text-[#E10600]" /> Số lượng ngựa tối đa:</span>
                    <span className="font-bold text-foreground">{selectedTour.maxHorses ?? "?"} Chiến mã</span>
                  </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Tổng quỹ thưởng giải</span>
                    <p className="text-xl font-black text-[#E10600] leading-none">
                      {(selectedTour.prizePool || selectedTour.prize || 0).toLocaleString("vi-VN")} Pts
                    </p>
                  </div>
                  <Award className="size-8 text-[#E10600]" />
                </div>
              </div>
            </div>

            {/* Right Side: Races list inside this tournament */}
            <div className="lg:col-span-7 space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-lg font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                  <Flag className="size-5 text-[#E10600]" /> Lịch trình các trận đua ({selectedTourRaces.length})
                </h3>
              </div>

              {loadingTourRaces ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Loader2 className="size-6 animate-spin text-[#E10600]" />
                  <p className="mt-3 text-xs font-mono uppercase tracking-widest">Đang tải lịch trình vòng đua...</p>
                </div>
              ) : selectedTourRaces.length === 0 ? (
                <div className="text-center py-12 border border-border rounded-2xl bg-card text-muted-foreground text-xs">
                  Chưa có lịch trình trận đua nào được thiết lập cho giải đấu này.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedTourRaces.map((race) => (
                    <div
                      key={race._id}
                      className="group rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-primary/20 hover:bg-white/[0.01] transition duration-300"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-foreground text-base leading-tight uppercase group-hover:text-primary transition duration-300">{race.name}</h4>
                          {race.status === "LIVE" && (
                            <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                          <span>Cự ly: <strong className="text-foreground">{race.distanceMeters}m</strong></span>
                          <span>Mặt sân: <strong className="text-foreground">{race.trackCondition || "Dry turf"}</strong></span>
                          <span>Bắt đầu: <strong className="text-foreground">
                            {new Date(race.startTime).toLocaleString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </strong></span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-border pt-2 sm:pt-0">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${getRaceStatusColor(race.status)}`}>
                          {getRaceStatusLabel(race.status)}
                        </span>
                        
                        <Button
                          onClick={() => handleSelectRace(race)}
                          variant="ghost"
                          className="text-xs font-black uppercase tracking-wider text-[#E10600] hover:text-foreground p-0 h-auto flex items-center gap-1 group"
                        >
                          Đội Hình <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TẦNG 3: DETAIL RACE VIEW (RACE INFO + PARTICIPANTS + TIMELINE) */}
      {selectedRace && (
        <div className="space-y-6">
          <Button
            onClick={() => {
              setSelectedRace(null);
              setSelectedRaceRegistrations([]);
              setSelectedRaceReferee(null);
            }}
            variant="ghost"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground -ml-2 flex items-center gap-1"
          >
            <ArrowLeft className="size-4" /> Quay lại {selectedTour ? "chi tiết giải đấu" : "danh sách lịch đua"}
          </Button>

          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Left Side: General Info & Live Timeline */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 space-y-6 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
                
                <div className="space-y-3">
                  <span className="text-[10px] text-[#E10600] font-black uppercase tracking-wider">
                    {typeof selectedRace.tournamentId === "object" ? selectedRace.tournamentId?.name : "Chi Tiết Trận Đua"}
                  </span>
                  <h2 className="text-xl font-black uppercase tracking-tight text-foreground leading-tight">{selectedRace.name}</h2>
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${getRaceStatusColor(selectedRace.status)}`}>
                    {getRaceStatusLabel(selectedRace.status)}
                  </div>
                </div>

                <div className="space-y-3 border-t border-border pt-4 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><MapPin className="size-3.5 text-[#E10600]" /> Địa điểm:</span>
                    <span className="font-bold text-foreground">{selectedRace.location || "Trường đua chính"}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><Calendar className="size-3.5 text-[#E10600]" /> Thời gian xuất phát:</span>
                    <span className="font-bold text-foreground">
                      {new Date(selectedRace.startTime).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><Compass className="size-3.5 text-[#E10600]" /> Cự ly thi đấu:</span>
                    <span className="font-bold text-foreground">{selectedRace.distanceMeters}m</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><Layers className="size-3.5 text-[#E10600]" /> Bề mặt & Thời tiết:</span>
                    <span className="font-bold text-foreground capitalize">{selectedRace.trackCondition || "Dry turf"} ({selectedRace.weatherSnapshot || "Sunny"})</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground border-t border-border pt-3">
                    <span className="flex items-center gap-2"><User className="size-3.5 text-teal-400" /> Trọng tài giám sát:</span>
                    <span className="font-bold text-foreground">
                      {selectedRaceReferee && typeof selectedRaceReferee.refereeUserId === "object"
                        ? selectedRaceReferee.refereeUserId.fullName
                        : "Chưa phân công"}
                    </span>
                  </div>
                </div>

                {/* Prediction embedded panel */}
                <div translate="no" className="pt-4 border-t border-border space-y-4 notranslate">
                  {currentRacePrediction ? (
                    <div className="rounded-xl border border-teal-500/20 bg-teal-500/[0.02] p-4 space-y-3">
                      <div className="flex items-center gap-2 text-teal-400">
                        <CheckCircle className="size-4" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Đã đặt dự đoán</span>
                      </div>
                      <div className="flex justify-between items-center bg-muted/50 rounded-lg p-3 border border-border">
                        <div>
                          <span className="block text-xs font-black text-foreground uppercase">
                            {typeof currentRacePrediction.predictedHorseId === "object"
                              ? currentRacePrediction.predictedHorseId?.name
                              : "Chiến mã"}
                          </span>
                          <span className="text-[9px] text-muted-foreground block mt-0.5">
                            Trạng thái:{" "}
                            <strong className="text-foreground">
                              {currentRacePrediction.status === "WON"
                                ? "Đoán Đúng"
                                : currentRacePrediction.status === "LOST"
                                ? "Đoán Sai"
                                : currentRacePrediction.status === "PENDING"
                                ? "Đang chờ chạy"
                                : "Đã hủy"}
                            </strong>
                          </span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                            currentRacePrediction.status === "WON"
                              ? "bg-teal-500/10 border border-teal-500/20 text-teal-400"
                              : currentRacePrediction.status === "LOST"
                              ? "bg-primary/10 border border-primary/20 text-primary"
                              : currentRacePrediction.status === "PENDING"
                              ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
                              : "bg-white/5 border border-border text-muted-foreground"
                          }`}>
                            {currentRacePrediction.status === "WON" 
                              ? `+${currentRacePrediction.rewardPoints || 1} Pts` 
                              : currentRacePrediction.status === "LOST" 
                              ? `${currentRacePrediction.rewardPoints || -1} Pts` 
                              : currentRacePrediction.status === "PENDING" 
                              ? "Chờ kết quả" 
                              : "Đã hủy"}
                          </span>
                          {currentRacePrediction.betPoints !== undefined && currentRacePrediction.betPoints > 0 && (
                            <span className="text-[8px] text-muted-foreground mt-1 font-mono block">
                              Cược: {currentRacePrediction.betPoints.toLocaleString("vi-VN")} Pts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    ["SCHEDULED", "CHECKING", "READY"].includes(selectedRace.status) ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                          <Coins className="size-4 animate-pulse" />
                          <span className="text-xs font-black uppercase tracking-wider">Dự đoán chiến mã về nhất</span>
                        </div>
 
                        {selectedRaceRegistrations.length === 0 ? (
                          <div className="text-center py-4 border border-dashed border-border rounded-xl bg-white/[0.01]">
                            <p className="text-[10px] text-muted-foreground italic">Chưa có danh sách chiến mã chính thức</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <select
                              value={selectedHorseId}
                              onChange={(e) => setSelectedHorseId(e.target.value)}
                              className="w-full h-11 rounded-xl border border-border bg-muted px-3 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
                            >
                              <option value="" className="bg-card">-- Chọn chiến mã dự kiến về nhất --</option>
                              {selectedRaceRegistrations.map((p) => {
                                const horseId = typeof p.horseId === "object" ? p.horseId?._id : p.horseId;
                                const horseName = typeof p.horseId === "object" ? p.horseId?.name : "Chiến mã";
                                const jockeyName = typeof p.jockeyUserId === "object" ? p.jockeyUserId?.fullName : "Chưa đăng ký";
                                return (
                                  <option key={p._id} value={horseId} className="bg-card">
                                    {horseName} (Nài: {jockeyName})
                                  </option>
                                );
                              })}
                            </select>

                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                                <span>Số điểm cược</span>
                                <span className="text-teal-400 font-mono">
                                  Số dư: {loadingBalance ? "..." : `${balance.toLocaleString("vi-VN")} Pts`}
                                </span>
                              </div>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="1"
                                  value={betPointsInput}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "") {
                                      setBetPointsInput("");
                                    } else {
                                      const parsed = parseInt(val) || 1;
                                      setBetPointsInput(String(Math.max(1, parsed)));
                                    }
                                  }}
                                  onBlur={() => {
                                    if (!betPointsInput || parseInt(betPointsInput) < 1) {
                                      setBetPointsInput("1");
                                    }
                                  }}
                                  className="w-full h-11 rounded-xl border border-border bg-muted pl-3 pr-12 text-xs text-foreground outline-none focus:border-primary font-mono font-bold"
                                  placeholder="Nhập số điểm (1 để đoán miễn phí)"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-muted-foreground font-mono">Pts</span>
                              </div>

                              {/* Quick Bet Buttons */}
                              <div className="grid grid-cols-5 gap-1">
                                <button
                                  type="button"
                                  onClick={() => setBetPointsInput("1")}
                                  className="py-1.5 rounded-lg border border-border bg-muted text-[9px] font-bold text-foreground hover:bg-muted/80 transition uppercase"
                                >
                                  Free
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setBetPointsInput("10")}
                                  className="py-1.5 rounded-lg border border-border bg-muted text-[9px] font-bold text-foreground hover:bg-muted/80 transition font-mono"
                                >
                                  10
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setBetPointsInput("50")}
                                  className="py-1.5 rounded-lg border border-border bg-muted text-[9px] font-bold text-foreground hover:bg-muted/80 transition font-mono"
                                >
                                  50
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setBetPointsInput("100")}
                                  className="py-1.5 rounded-lg border border-border bg-muted text-[9px] font-bold text-foreground hover:bg-muted/80 transition font-mono"
                                >
                                  100
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setBetPointsInput(String(balance))}
                                  className="py-1.5 rounded-lg border border-primary/20 bg-primary/10 text-[9px] font-black text-primary hover:bg-primary hover:text-white transition uppercase"
                                >
                                  All In
                                </button>
                              </div>
                              {/* Inline Warning for Insufficient Balance */}
                              {parseInt(betPointsInput) >= 2 && parseInt(betPointsInput) > balance && (
                                <div className="text-[10px] text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl p-2.5 mt-2">
                                  <span className="font-black uppercase tracking-wider block text-[#E10600]">⚠️ Không đủ số dư</span>
                                  <p className="italic font-medium leading-relaxed mt-0.5">
                                    Bạn cần cược <strong className="text-foreground font-mono font-bold">{parseInt(betPointsInput).toLocaleString("vi-VN")} Pts</strong> nhưng chỉ có <strong className="text-foreground font-mono font-bold">{balance.toLocaleString("vi-VN")} Pts</strong>.
                                  </p>
                                </div>
                              )}
                            </div>



                            <Button
                              onClick={handlePredictSubmit}
                              disabled={submittingPrediction || !selectedHorseId || (parseInt(betPointsInput) >= 2 && parseInt(betPointsInput) > balance)}
                              className="w-full rounded-xl bg-primary hover:bg-[#B80500] text-white font-black uppercase tracking-wider text-xs py-5 shadow-[0_4px_16px_rgba(225,6,0,0.25)] mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {submittingPrediction 
                                ? "Đang gửi..." 
                                : (parseInt(betPointsInput) >= 2 && parseInt(betPointsInput) > balance)
                                  ? "Không Đủ Số Dư"
                                  : "Gửi Dự Đoán"}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border bg-white/[0.01] p-3 text-center text-muted-foreground text-[10px]">
                        Cổng dự đoán đã đóng cho cuộc đua này (LIVE hoặc Đã kết thúc).
                      </div>
                    )
                  )}

                  {/* Reward rule reminder */}
                  <div className="rounded-xl border border-[#E10600]/10 bg-[#E10600]/5 p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-primary">
                      <Award className="size-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-wider">Cơ cấu điểm thưởng</span>
                    </div>
                    <p className="text-[9px] leading-relaxed text-muted-foreground">
                      Chọn 1 chiến mã dự kiến về nhất. Kết quả chính xác cộng <strong className="text-foreground">+1 điểm</strong>, sai khấu trừ <strong className="text-foreground">-1 điểm</strong>. Số dư ví không thể bị âm dưới 0 điểm.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-lg">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <Activity className="size-3.5 text-[#E10600]" /> Tiến độ cuộc đua (Status Timeline)
                </h4>
                
                <div className="space-y-4">
                  {getTimeline(selectedRace.status).map((step, idx, arr) => (
                    <div key={idx} className="flex gap-3 items-start relative">
                      {idx !== arr.length - 1 && (
                        <div className="absolute left-[7px] top-[18px] w-[2px] h-[calc(100%+8px)] bg-white/10" />
                      )}
                      <div className={`size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        step.status === "complete" 
                          ? "bg-[#E10600] border-[#E10600] text-white" 
                          : step.status === "current" 
                          ? "bg-teal-400 border-teal-400 text-black animate-pulse" 
                          : step.status === "cancelled"
                          ? "bg-red-500 border-red-500 text-white"
                          : "bg-transparent border-white/20 text-transparent"
                      }`} />
                      <div className="space-y-0.5">
                        <p className={`text-xs font-black uppercase tracking-wider ${step.status === "current" ? "text-teal-400" : "text-muted-foreground"}`}>{step.step}</p>
                        <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Participant Horses list */}
            <div className="lg:col-span-7 space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-lg font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                  <Users className="size-5 text-[#E10600]" /> Chiến mã xuất kích & Nài ngựa ({selectedRaceRegistrations.length})
                </h3>
              </div>

              {loadingRaceDetails ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Loader2 className="size-6 animate-spin text-[#E10600]" />
                  <p className="mt-3 text-xs font-mono uppercase tracking-widest">Đang tải danh sách đội hình...</p>
                </div>
              ) : selectedRaceRegistrations.length === 0 ? (
                <div className="text-center py-16 border border-border rounded-2xl bg-card text-muted-foreground text-xs shadow-md">
                  <ShieldCheck className="size-10 text-muted-foreground/30 mx-auto mb-2" />
                  Chưa có chiến mã nào được phê duyệt tham gia trận đấu này.
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/50 text-muted-foreground font-black uppercase tracking-wider">
                          <th className="p-4 w-16">Cổng (Lane)</th>
                          <th className="p-4">Chiến Mã (Breed)</th>
                          <th className="p-4">Nài Ngựa (Jockey)</th>
                          <th className="p-4">Chủ Ngựa (Owner)</th>
                          <th className="p-4 text-right">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {selectedRaceRegistrations.map((p, idx) => {
                          const horseName = typeof p.horseId === "object" ? p.horseId?.name : "Chiến mã";
                          const horseBreed = typeof p.horseId === "object" ? p.horseId?.breed : "Thuần chủng";
                          const jockeyName = typeof p.jockeyUserId === "object" ? p.jockeyUserId?.fullName : "Chưa đăng ký";
                          const ownerName = typeof p.ownerId === "object" ? p.ownerId?.fullName : "Chủ ngựa";
                          return (
                            <tr key={p._id} className="hover:bg-white/[0.01] transition duration-200">
                              <td className="p-4 font-mono font-black text-[#E10600] text-sm">{idx + 1}</td>
                              <td className="p-4 font-bold text-foreground">
                                <span className="block">{horseName}</span>
                                <span className="text-[9px] font-mono text-muted-foreground">{horseBreed}</span>
                              </td>
                              <td className="p-4 font-bold text-foreground">{jockeyName}</td>
                              <td className="p-4 text-muted-foreground">{ownerName}</td>
                              <td className="p-4 text-right">
                                <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-[9px] font-black text-teal-400 uppercase tracking-wider">
                                  ● ĐÃ DUYỆT
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
