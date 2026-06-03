"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Trophy, Calendar, MapPin, Award, Users, Search, 
  ArrowLeft, Flag, Loader2 
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { tournamentsApi, racesApi, type TournamentItem, type RaceItem } from "@/lib/api-client";

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
      return "bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse";
    case "FINISHED":
    case "RESULT_PUBLISHED":
      return "bg-white/5 border border-white/10 text-muted-foreground";
    default:
      return "bg-primary/10 border border-primary/20 text-primary";
  }
};

export default function SpectatorTournamentsPage() {
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [selectedTour, setSelectedTour] = useState<TournamentItem | null>(null);
  const [selectedTourRaces, setSelectedTourRaces] = useState<RaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRaces, setLoadingRaces] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tournamentsApi.list({ page: 1, limit: 100 });
      // Exclude DRAFT tournaments for spectators
      const publicTournaments = (res.data || []).filter(t => t.status !== "DRAFT");
      setTournaments(publicTournaments);
    } catch (e: any) {
      console.error("Lỗi khi tải danh sách giải đấu:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTournaments();
  }, [fetchTournaments]);

  const handleSelectTournament = async (t: TournamentItem) => {
    setSelectedTour(t);
    setLoadingRaces(true);
    try {
      const res = await racesApi.listByTournament(t._id, { limit: 100 });
      setSelectedTourRaces(res.data || []);
    } catch (e: any) {
      console.error("Lỗi khi tải danh sách vòng đua:", e);
      setSelectedTourRaces([]);
    } finally {
      setLoadingRaces(false);
    }
  };

  const filteredTournaments = tournaments.filter((tour) => {
    const matchesSearch = tour.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (tour.location && tour.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    if (statusFilter !== "ALL") {
      matchesStatus = tour.status === statusFilter;
    }
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12">
      {!selectedTour ? (
        <>
          <PageHeader
            eyebrow="Tournament Discovery"
            title="Thông Tin Giải Đấu"
            description="Tìm kiếm, theo duyệt điều lệ giải và cự ly của toàn bộ các giải đấu đua ngựa đang hoạt động."
          />

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center rounded-2xl border border-white/5 bg-[#13131A] p-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm giải đấu, địa điểm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-primary transition"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
              {["ALL", "ONGOING", "OPEN_REGISTRATION", "COMPLETED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
                    statusFilter === status
                      ? "bg-primary text-white border border-primary"
                      : "bg-white/[0.02] border border-white/5 text-muted-foreground hover:text-white"
                  }`}
                >
                  {status === "ALL" ? "Tất cả" : status === "ONGOING" ? "Đang diễn" : status === "OPEN_REGISTRATION" ? "Mở đăng ký" : "Kết thúc"}
                </button>
              ))}
            </div>
          </div>

          {/* Tournaments Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/55">
              <Loader2 className="size-8 animate-spin text-[#E10600]" />
              <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải danh sách giải đấu...</p>
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-[#15151D]/45">
              <Trophy className="size-12 text-white/15 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white uppercase tracking-wider">Không tìm thấy giải đấu</h4>
              <p className="text-xs text-white/45 max-w-sm mx-auto mt-1">Vui lòng thử tìm kiếm bằng từ khóa hoặc bộ lọc trạng thái khác.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTournaments.map((tour) => (
                <div
                  key={tour._id}
                  className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#16161E]/90 hover:border-white/15 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition duration-300 flex flex-col h-full"
                >
                  <div className="h-40 w-full overflow-hidden relative bg-black/40">
                    {tour.imageUrl ? (
                      <img
                        src={tour.imageUrl}
                        alt={tour.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black/20">
                        <Trophy className="size-12 text-white/5" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#16161E] via-transparent to-transparent" />
                    
                    {/* Status Badge */}
                    <span className={`absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white border backdrop-blur-md ${getStatusColor(tour.status)}`}>
                      {getStatusLabel(tour.status)}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-black uppercase tracking-tight text-white leading-tight truncate group-hover:text-primary transition duration-300">
                        {tour.name}
                      </h3>
                      {tour.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {tour.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/5 text-[10px] text-muted-foreground">
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1"><MapPin className="size-3 text-primary" /> {tour.location || "Chưa thiết lập"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-primary" /> 
                          {tour.startDate ? new Date(tour.startDate).toLocaleDateString("vi-VN") : "?"} ~ {tour.endDate ? new Date(tour.endDate).toLocaleDateString("vi-VN") : "?"}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-white border-t border-white/5 pt-2">
                        <span>Giải Thưởng:</span>
                        <span className="text-primary text-xs font-black">
                          {(tour.prizePool || tour.prize || 0).toLocaleString()} Pts
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pb-5">
                    <Button
                      onClick={() => handleSelectTournament(tour)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 text-white hover:bg-primary hover:text-white transition duration-300 text-xs font-black uppercase tracking-wider"
                    >
                      Xem Chi Tiết Giải
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Detailed Tournament View */
        <div className="space-y-6">
          <Button
            onClick={() => setSelectedTour(null)}
            variant="ghost"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white -ml-2"
          >
            <ArrowLeft className="size-4 mr-2" /> Quay lại danh sách
          </Button>

          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Left Side: General Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-[#16161E] p-6 space-y-6 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px]" />
                
                {selectedTour.imageUrl && (
                  <div className="w-full h-48 overflow-hidden rounded-xl border border-white/5 bg-black/40 mb-2">
                    <img
                      src={selectedTour.imageUrl}
                      alt={selectedTour.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white border ${getStatusColor(selectedTour.status)}`}>
                    {getStatusLabel(selectedTour.status)}
                  </span>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white leading-tight">{selectedTour.name}</h2>
                  {selectedTour.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{selectedTour.description}</p>
                  )}
                </div>

                <div className="space-y-3 border-t border-white/5 pt-4 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><MapPin className="size-3.5 text-primary" /> Địa điểm:</span>
                    <span className="font-bold text-white">{selectedTour.location || "Chưa thiết lập"}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><Calendar className="size-3.5 text-primary" /> Thời gian giải:</span>
                    <span className="font-bold text-white">
                      {selectedTour.startDate ? new Date(selectedTour.startDate).toLocaleDateString("vi-VN") : "?"} ~ {selectedTour.endDate ? new Date(selectedTour.endDate).toLocaleDateString("vi-VN") : "?"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><Calendar className="size-3.5 text-teal-400" /> Nhận đăng ký:</span>
                    <span className="font-bold text-white">
                      {selectedTour.registrationStartDate ? new Date(selectedTour.registrationStartDate).toLocaleDateString("vi-VN") : "Chưa mở"} ~ {selectedTour.registrationEndDate ? new Date(selectedTour.registrationEndDate).toLocaleDateString("vi-VN") : "Chưa mở"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><Users className="size-3.5 text-primary" /> Số lượng ngựa tối đa:</span>
                    <span className="font-bold text-white">{selectedTour.maxHorses ?? "?"} Chiến mã</span>
                  </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Tổng quỹ thưởng giải</span>
                    <p className="text-2xl font-black text-primary leading-none">
                      {(selectedTour.prizePool || selectedTour.prize || 0).toLocaleString()} Pts
                    </p>
                  </div>
                  <Award className="size-8 text-primary" />
                </div>
              </div>
            </div>

            {/* Right Side: Races list inside this tournament */}
            <div className="lg:col-span-7 space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <Flag className="size-5 text-primary" /> Danh sách lịch trình đua ({selectedTourRaces.length})
                </h3>
              </div>

              {loadingRaces ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/55">
                  <Loader2 className="size-6 animate-spin text-[#E10600]" />
                  <p className="mt-3 text-xs font-mono uppercase tracking-widest">Đang tải lịch trình vòng đua...</p>
                </div>
              ) : selectedTourRaces.length === 0 ? (
                <div className="text-center py-12 border border-white/5 rounded-2xl bg-[#13131A] text-muted-foreground text-xs">
                  Chưa có lịch trình vòng đua nào được thiết lập cho giải đấu này.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedTourRaces.map((race) => (
                    <div
                      key={race._id}
                      className="group rounded-2xl border border-white/5 bg-[#13131A] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-white/15 hover:bg-white/[0.01] transition duration-300"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-white text-base leading-tight uppercase group-hover:text-primary transition duration-300">{race.name}</h4>
                          {race.status === "LIVE" && (
                            <span className="size-2 rounded-full bg-teal-400 animate-pulse" />
                          )}
                        </div>
                        <div className="flex gap-4 text-[10px] text-muted-foreground">
                          <span>Cự ly: <strong className="text-white">{race.distanceMeters}m</strong></span>
                          <span>Mặt sân: <strong className="text-white">{race.trackCondition || "Dry turf"}</strong></span>
                          <span>Bắt đầu: <strong className="text-white">
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

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${getRaceStatusColor(race.status)}`}>
                          {race.status === "LIVE" ? "LIVE NOW" : race.status === "FINISHED" ? "KẾT THÚC" : race.status === "RESULT_PUBLISHED" ? "KẾT QUẢ ĐÃ ĐĂNG" : getStatusLabel(race.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
