"use client";

import { useState } from "react";
import { Flag, Search, Calendar, MapPin, Activity, ShieldCheck, User, Users, ClipboardCheck, ArrowLeft, Layers, Compass } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

// Mock Races and Participants Data
const mockRacesList = [
  {
    id: "race-aurora-1200",
    name: "Aurora Sprint 1200",
    tournament: "Spring Velocity Cup",
    status: "LIVE",
    statusLabel: "Đang diễn ra (LIVE)",
    date: "Today",
    startTime: "10:00",
    endTime: "10:18",
    location: "Saigon Grand Track",
    track: "North Loop",
    distance: "1,200m",
    surface: "Dry turf",
    capacity: 8,
    referee: { name: "Referee Mai Anh", license: "RF-2048", status: "Active" },
    participants: [
      { lane: 1, horse: "Crimson Bolt", horseCode: "HB-14", owner: "Linh Tran Stable", jockey: "Minh Khoa", status: "Vào vị trí" },
      { lane: 2, horse: "Midnight Alloy", horseCode: "HB-22", owner: "Saigon Equine", jockey: "Gia Huy", status: "Vào vị trí" },
      { lane: 3, horse: "Delta Comet", horseCode: "HB-31", owner: "Red River Farm", jockey: "An Nhi", status: "Vào vị trí" },
      { lane: 4, horse: "Silver Apex", horseCode: "HB-08", owner: "North Track Club", jockey: "Bao Nam", status: "Sẵn sàng" },
    ],
    timeline: [
      { step: "Scheduled", desc: "Đã lên lịch đua độc lập", status: "complete" },
      { step: "Pre-check", desc: "Trọng tài điểm danh ngựa và nài ngựa", status: "complete" },
      { step: "Live Race", desc: "Chiến mã đang bứt tốc trên đường đua", status: "current" },
    ]
  },
  {
    id: "race-neon-900",
    name: "Neon Dash 900",
    tournament: "Night Circuit Trophy",
    status: "SCHEDULED",
    statusLabel: "Chờ xuất phát",
    date: "25 May 2026",
    startTime: "19:30",
    location: "Da Nang Coastal Track",
    track: "Floodlight Straight",
    distance: "900m",
    surface: "Synthetic Track",
    capacity: 6,
    referee: { name: "Referee Quoc Bao", license: "RF-1052", status: "Assigned" },
    participants: [
      { lane: 1, horse: "Crimson Bolt", horseCode: "HB-14", owner: "Linh Tran Stable", jockey: "Minh Khoa", status: "Đã đăng ký" },
      { lane: 2, horse: "Midnight Alloy", horseCode: "HB-22", owner: "Saigon Equine", jockey: "Gia Huy", status: "Đã đăng ký" },
      { lane: 3, horse: "Delta Comet", horseCode: "HB-31", owner: "Red River Farm", jockey: "An Nhi", status: "Đã đăng ký" },
    ],
    timeline: [
      { step: "Scheduled", desc: "Đã chốt danh sách & lịch trình", status: "complete" },
      { step: "Pre-check", desc: "Chuẩn bị kiểm tra thú y trước giờ G", status: "pending" },
    ]
  },
  {
    id: "race-delta-1600",
    name: "Delta Endurance 1600",
    tournament: "Mekong Masters",
    status: "FINISHED",
    statusLabel: "Hoàn tất cuộc đua",
    date: "23 May 2026",
    startTime: "15:00",
    endTime: "15:28",
    location: "Can Tho Heritage Oval",
    track: "River Bend",
    distance: "1,600m",
    surface: "Soft turf",
    capacity: 10,
    referee: { name: "Referee Hoang Lam", license: "RF-3310", status: "Completed" },
    participants: [
      { lane: 1, horse: "Crimson Bolt", horseCode: "HB-14", owner: "Linh Tran Stable", jockey: "Minh Khoa", status: "Hoàn tất" },
      { lane: 2, horse: "Midnight Alloy", horseCode: "HB-22", owner: "Saigon Equine", jockey: "Gia Huy", status: "Hoàn tất" },
      { lane: 3, horse: "Delta Comet", horseCode: "HB-31", owner: "Red River Farm", jockey: "An Nhi", status: "Hoàn tất" },
      { lane: 4, horse: "Neon Stirrup", horseCode: "HB-19", owner: "Viet Derby House", jockey: "Thanh Vy", status: "Hoàn tất" },
    ],
    timeline: [
      { step: "Scheduled", desc: "Đã lên lịch", status: "complete" },
      { step: "Pre-check", desc: "Thông số kiểm dịch hợp lệ", status: "complete" },
      { step: "Live Race", desc: "Thi đấu", status: "complete" },
      { step: "Finished", desc: "Cán đích chính thức. Đang đợi duyệt kết quả", status: "complete" },
    ]
  }
];

export default function SpectatorRacesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);

  // Filter logic
  const filteredRaces = mockRacesList.filter((race) => {
    const matchesSearch = race.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          race.tournament.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || race.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedRace = mockRacesList.find(r => r.id === selectedRaceId);

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12">
      {!selectedRaceId ? (
        <>
          <PageHeader
            eyebrow="Race Schedules"
            title="Lịch Trình Thi Đấu"
            description="Theo dõi toàn bộ lịch trình các trận đua ngựa kịch tính sắp khởi tranh hoặc xem trực tiếp các trận đấu đang phát trực tiếp."
          />

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center rounded-2xl border border-white/5 bg-[#13131A] p-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm trận đấu, tên giải..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-primary transition"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              {["ALL", "LIVE", "SCHEDULED", "FINISHED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    statusFilter === status
                      ? "bg-primary text-white border border-primary"
                      : "bg-white/[0.02] border border-white/5 text-muted-foreground hover:text-white"
                  }`}
                >
                  {status === "ALL" ? "Tất cả" : status === "LIVE" ? "Trực tiếp" : status === "SCHEDULED" ? "Sắp diễn" : "Đã xong"}
                </button>
              ))}
            </div>
          </div>

          {/* Races Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRaces.map((race) => (
              <div
                key={race.id}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#16161E]/90 hover:border-white/15 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition duration-300 flex flex-col h-full"
              >
                {race.status === "LIVE" && (
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-teal-400" />
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-primary font-black uppercase tracking-wider">{race.tournament}</span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                        race.status === "LIVE"
                          ? "bg-teal-500/10 border border-teal-500/20 text-teal-400"
                          : race.status === "SCHEDULED"
                          ? "bg-primary/10 border border-primary/20 text-primary"
                          : "bg-white/5 border border-white/10 text-muted-foreground"
                      }`}>
                        {race.status === "LIVE" ? "LIVE NOW" : race.statusLabel}
                      </span>
                    </div>

                    <h3 className="text-lg font-black uppercase tracking-tight text-white leading-tight group-hover:text-primary transition duration-300">
                      {race.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground bg-white/[0.01] rounded-xl p-3 border border-white/5">
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/60 font-black">Cự ly</span>
                      <span className="font-bold text-white text-xs">{race.distance}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/60 font-black">Địa điểm</span>
                      <span className="font-bold text-white text-[11px] truncate block">{race.location}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-muted-foreground pt-1">
                    <p className="flex items-center gap-1.5"><Calendar className="size-3.5 text-primary" /> Xuất phát: <span className="font-bold text-white">{race.date} · {race.startTime}</span></p>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <Button
                    onClick={() => setSelectedRaceId(race.id)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 text-white hover:bg-primary hover:text-white transition duration-300 text-xs font-black uppercase tracking-wider"
                  >
                    Xem Chi Tiết Trận
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Detailed Race View */
        <div className="space-y-6">
          <Button
            onClick={() => setSelectedRaceId(null)}
            variant="ghost"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white -ml-2"
          >
            <ArrowLeft className="size-4 mr-2" /> Quay lại danh sách lịch đua
          </Button>

          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Left Side: General Info & Live Timeline */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-[#16161E] p-6 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px]" />
                
                <div className="space-y-3">
                  <span className="text-[10px] text-primary font-black uppercase tracking-wider">{selectedRace?.tournament}</span>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white">{selectedRace?.name}</h2>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-black text-primary uppercase tracking-wider">
                    {selectedRace?.statusLabel}
                  </div>
                </div>

                <div className="space-y-3 border-t border-white/5 pt-4 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><MapPin className="size-3.5 text-primary" /> Địa điểm:</span>
                    <span className="font-bold text-white">{selectedRace?.location}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><Calendar className="size-3.5 text-primary" /> Thời gian bắt đầu:</span>
                    <span className="font-bold text-white">{selectedRace?.date} · {selectedRace?.startTime}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><Compass className="size-3.5 text-primary" /> Cự ly & Đường đua:</span>
                    <span className="font-bold text-white">{selectedRace?.distance} ({selectedRace?.track})</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-2"><Layers className="size-3.5 text-primary" /> Bề mặt đường đua:</span>
                    <span className="font-bold text-white">{selectedRace?.surface}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground border-t border-white/5 pt-3">
                    <span className="flex items-center gap-2"><User className="size-3.5 text-teal-400" /> Trọng tài chính:</span>
                    <span className="font-bold text-white">{selectedRace?.referee.name} ({selectedRace?.referee.license})</span>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="rounded-2xl border border-white/5 bg-[#13131A] p-6 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <Activity className="size-3.5 text-primary" /> Tiến độ cuộc đua (Status Timeline)
                </h4>
                
                <div className="space-y-4">
                  {selectedRace?.timeline.map((step, idx) => (
                    <div key={idx} className="flex gap-3 items-start relative">
                      {idx !== selectedRace.timeline.length - 1 && (
                        <div className="absolute left-[7px] top-[18px] w-[2px] h-[calc(100%+8px)] bg-white/10" />
                      )}
                      <div className={`size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        step.status === "complete" 
                          ? "bg-primary border-primary text-white" 
                          : step.status === "current" 
                          ? "bg-teal-400 border-teal-400 text-black animate-pulse" 
                          : "bg-transparent border-white/20 text-transparent"
                      }`} />
                      <div className="space-y-0.5">
                        <p className={`text-xs font-black uppercase tracking-wider ${step.status === "current" ? "text-teal-400" : "text-white"}`}>{step.step}</p>
                        <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Participant Horses list */}
            <div className="lg:col-span-7 space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                  <Users className="size-5 text-primary" /> Chiến mã xuất kích & Nài ngựa tham gia ({selectedRace?.participants.length})
                </h3>
              </div>

              <div className="rounded-2xl border border-white/5 bg-[#13131A] overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-muted-foreground font-black uppercase tracking-wider">
                      <th className="p-4 w-16">Lane</th>
                      <th className="p-4">Chiến Mã (Mã)</th>
                      <th className="p-4">Nài Ngựa</th>
                      <th className="p-4">Chủ Ngựa</th>
                      <th className="p-4 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedRace?.participants.map((p, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.01] transition duration-200">
                        <td className="p-4 font-mono font-black text-primary text-sm">{p.lane}</td>
                        <td className="p-4 font-bold text-white">
                          <span className="block">{p.horse}</span>
                          <span className="text-[9px] font-mono text-muted-foreground">{p.horseCode}</span>
                        </td>
                        <td className="p-4 font-bold text-white">{p.jockey}</td>
                        <td className="p-4 text-muted-foreground">{p.owner}</td>
                        <td className="p-4 text-right">
                          <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-[9px] font-black text-teal-400 uppercase tracking-wider">
                            ● {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
