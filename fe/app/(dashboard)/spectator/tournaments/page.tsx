"use client";

import { useState } from "react";
import { Trophy, Calendar, MapPin, Award, Users, Search, ListChecks, ArrowLeft, ArrowRight, ShieldCheck, Flag } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

// Mock Full Tournaments Data
const mockAllTournaments = [
  {
    id: "tour-01",
    name: "Spring Velocity Cup 2026",
    description: "Giải đấu mùa xuân quy tụ những nài ngựa và chiến mã tốc độ hàng đầu cả nước tranh tài trên cự ly ngắn.",
    status: "ONGOING",
    statusLabel: "Đang diễn ra",
    startDate: "2026-05-15",
    endDate: "2026-06-10",
    location: "Trường đua Phú Thọ, TPHCM",
    prizePool: 50000,
    maxHorses: 24,
    enrolledHorses: 20,
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=600&auto=format&fit=crop",
    races: [
      { id: "race-01", name: "Aurora Sprint 1200", distance: "1,200m", surface: "Dry turf", status: "LIVE", time: "10:00" },
      { id: "race-02", name: "Alpha Speed Trial", distance: "900m", surface: "Clay", status: "FINISHED", time: "14:30" },
      { id: "race-03", name: "Spring Grand Final", distance: "1,600m", surface: "Wet Turf", status: "SCHEDULED", time: "Tomorrow" },
    ]
  },
  {
    id: "tour-02",
    name: "Night Circuit Trophy",
    description: "Thử thách đua đêm kịch tính dưới ánh đèn floodlight rực rỡ tại thành phố biển Đà Nẵng.",
    status: "OPEN_REGISTRATION",
    statusLabel: "Mở đăng ký",
    startDate: "2026-06-15",
    endDate: "2026-07-05",
    location: "Trường đua Coastal, Đà Nẵng",
    prizePool: 75000,
    maxHorses: 16,
    enrolledHorses: 12,
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop",
    races: [
      { id: "race-04", name: "Neon Dash 900", distance: "900m", surface: "Synthetic Track", status: "SCHEDULED", time: "19:30" },
      { id: "race-05", name: "Midnight Coastal Run", distance: "1,400m", surface: "Dry sand", status: "SCHEDULED", time: "22:00" },
    ]
  },
  {
    id: "tour-03",
    name: "Mekong Masters Endurance",
    description: "Giải đấu sức bền vượt chướng ngại vật dọc theo lưu vực sông Mekong đòi hỏi sức dẻo dai phi thường.",
    status: "COMPLETED",
    statusLabel: "Đã kết thúc",
    startDate: "2026-04-01",
    endDate: "2026-04-20",
    location: "Sân vận động Cần Thơ",
    prizePool: 30000,
    maxHorses: 32,
    enrolledHorses: 32,
    image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=600&auto=format&fit=crop",
    races: [
      { id: "race-06", name: "Mekong Floodgate Run", distance: "2,000m", surface: "Heavy mud", status: "RESULT_PUBLISHED", time: "Finished" },
      { id: "race-07", name: "Can Tho Heritage Classic", distance: "1,600m", surface: "Soft turf", status: "RESULT_PUBLISHED", time: "Finished" },
    ]
  },
];

export default function SpectatorTournamentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);

  // Filter Logic
  const filteredTournaments = mockAllTournaments.filter((tour) => {
    const matchesSearch = tour.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tour.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || tour.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedTour = mockAllTournaments.find(t => t.id === selectedTourId);

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12">
      {!selectedTourId ? (
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

            <div className="flex gap-2 w-full sm:w-auto">
              {["ALL", "ONGOING", "OPEN_REGISTRATION", "COMPLETED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTournaments.map((tour) => (
              <div
                key={tour.id}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#16161E]/90 hover:border-white/15 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition duration-300 flex flex-col h-full"
              >
                <div className="h-40 w-full overflow-hidden relative">
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16161E] via-transparent to-transparent" />
                  
                  {/* Status Badge */}
                  <span className={`absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white border backdrop-blur-md ${
                    tour.status === "ONGOING"
                      ? "bg-[#E10600]/80 border-[#E10600]"
                      : tour.status === "OPEN_REGISTRATION"
                      ? "bg-teal-500/80 border-teal-500"
                      : "bg-white/10 border-white/20"
                  }`}>
                    {tour.statusLabel}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-black uppercase tracking-tight text-white leading-tight truncate group-hover:text-primary transition duration-300">
                      {tour.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {tour.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5 text-[10px] text-muted-foreground">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><MapPin className="size-3 text-primary" /> {tour.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Calendar className="size-3 text-primary" /> {tour.startDate} ~ {tour.endDate}</span>
                    </div>
                    <div className="flex justify-between font-bold text-white border-t border-white/5 pt-2">
                      <span>Giải Thưởng:</span>
                      <span className="text-primary text-xs font-black">{tour.prizePool.toLocaleString()} Pts</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <Button
                    onClick={() => setSelectedTourId(tour.id)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 text-white hover:bg-primary hover:text-white transition duration-300 text-xs font-black uppercase tracking-wider"
                  >
                    Xem Chi Tiết Giải
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Detailed Tournament View */
        <div className="space-y-6">
          <Button
            onClick={() => setSelectedTourId(null)}
            variant="ghost"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white -ml-2"
          >
            <ArrowLeft className="size-4 mr-2" /> Quay lại danh sách
          </Button>

          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Left Side: General Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-[#16161E] p-6 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px]" />
                
                <div className="space-y-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white border ${
                    selectedTour?.status === "ONGOING"
                      ? "bg-[#E10600]/80 border-[#E10600]"
                      : selectedTour?.status === "OPEN_REGISTRATION"
                      ? "bg-teal-500/80 border-teal-500"
                      : "bg-white/10 border-white/20"
                  }`}>
                    {selectedTour?.statusLabel}
                  </span>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white">{selectedTour?.name}</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">{selectedTour?.description}</p>
                </div>

                <div className="space-y-3 border-t border-white/5 pt-4 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><MapPin className="size-3.5 text-primary" /> Địa điểm:</span>
                    <span className="font-bold text-white">{selectedTour?.location}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><Calendar className="size-3.5 text-primary" /> Thời gian giải:</span>
                    <span className="font-bold text-white">{selectedTour?.startDate} ~ {selectedTour?.endDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><Users className="size-3.5 text-primary" /> Số ngựa tham gia:</span>
                    <span className="font-bold text-white">{selectedTour?.enrolledHorses} / {selectedTour?.maxHorses} Chiến mã</span>
                  </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Tổng quỹ thưởng giải</span>
                    <p className="text-2xl font-black text-primary leading-none">{selectedTour?.prizePool.toLocaleString()} Pts</p>
                  </div>
                  <Award className="size-8 text-primary" />
                </div>
              </div>
            </div>

            {/* Right Side: Races list inside this tournament */}
            <div className="lg:col-span-7 space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <Flag className="size-5 text-primary" /> Danh sách lịch trình đua ({selectedTour?.races.length})
                </h3>
              </div>

              <div className="space-y-4">
                {selectedTour?.races.map((race) => (
                  <div
                    key={race.id}
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
                        <span>Cự ly: <strong className="text-white">{race.distance}</strong></span>
                        <span>Mặt sân: <strong className="text-white">{race.surface}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                        race.status === "LIVE"
                          ? "bg-teal-500/10 border border-teal-500/20 text-teal-400"
                          : race.status === "FINISHED" || race.status === "RESULT_PUBLISHED"
                          ? "bg-white/5 border border-white/10 text-muted-foreground"
                          : "bg-primary/10 border border-primary/20 text-primary"
                      }`}>
                        {race.status === "LIVE" ? "LIVE NOW" : race.status === "FINISHED" || race.status === "RESULT_PUBLISHED" ? "KẾT THÚC" : race.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
