"use client";

import { useState } from "react";
import { Flag, Search, Calendar, MapPin, Award, User, Users, ClipboardCheck, ArrowLeft, Siren, Timer } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

// Mock Race Results Data
const mockRaceResults = [
  {
    id: "race-delta-1600",
    name: "Delta Endurance 1600",
    tournament: "Mekong Masters",
    date: "23 May 2026",
    startTime: "15:00",
    endTime: "15:28",
    distance: "1,600m",
    track: "River Bend",
    surface: "Soft turf",
    results: [
      { rank: 1, lane: 3, horse: "Delta Comet", jockey: "An Nhi", time: "1:42.50", penalty: 0, prize: 15000, violations: "Không" },
      { rank: 2, lane: 1, horse: "Crimson Bolt", jockey: "Minh Khoa", time: "1:44.20", penalty: 0, prize: 7000, violations: "Không" },
      { rank: 3, lane: 2, horse: "Midnight Alloy", jockey: "Gia Huy", time: "1:45.90", penalty: 2, prize: 3000, violations: "Lấn làn đường chạy (+2s phạt)" },
      { rank: 4, lane: 4, horse: "Neon Stirrup", jockey: "Thanh Vy", time: "1:48.10", penalty: 0, prize: 0, violations: "Không" },
    ]
  },
  {
    id: "race-heritage-1400",
    name: "Heritage Classic 1400",
    tournament: "Capital Derby Week",
    date: "22 May 2026",
    startTime: "09:20",
    endTime: "09:42",
    distance: "1,400m",
    track: "Classic Oval",
    surface: "Dry turf",
    results: [
      { rank: 1, lane: 2, horse: "Midnight Alloy", jockey: "Gia Huy", time: "1:28.40", penalty: 0, prize: 20000, violations: "Không" },
      { rank: 2, lane: 3, horse: "Delta Comet", jockey: "An Nhi", time: "1:29.10", penalty: 0, prize: 10000, violations: "Không" },
      { rank: 3, lane: 1, horse: "Crimson Bolt", jockey: "Minh Khoa", time: "1:31.70", penalty: 1, prize: 5000, violations: "Xuất phát sớm lỗi nhẹ (+1s phạt)" },
      { rank: 4, lane: 4, horse: "Silver Apex", jockey: "Bao Nam", time: "1:33.20", penalty: 0, prize: 0, violations: "Không" },
    ]
  }
];

export default function SpectatorResultsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);

  const filteredRaces = mockRaceResults.filter((race) => 
    race.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    race.tournament.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedRace = mockRaceResults.find(r => r.id === selectedRaceId);

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12">
      {!selectedRaceId ? (
        <>
          <PageHeader
            eyebrow="Race Results"
            title="Kết Quả Trực Tiếp & BXH Trận"
            description="Tra cứu biên bản kết quả xếp hạng cán đích chính thức, thời gian chạy và giây phạt kỷ luật do trọng tài giám sát ghi nhận."
          />

          {/* Search Box */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kết quả cuộc đua, giải đấu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-muted/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
            />
          </div>

          {/* Results Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {filteredRaces.map((race) => (
              <div
                key={race.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/20 hover:shadow-md transition duration-300 p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-primary font-black uppercase tracking-wider">{race.tournament}</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-teal-500/10 border border-teal-500/20 text-teal-400">
                      ● ĐÃ CÔNG BỐ
                    </span>
                  </div>

                  <h3 className="text-lg font-black uppercase tracking-tight text-foreground group-hover:text-primary transition duration-300">
                    {race.name}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="size-3.5 text-primary" /> {race.distance} ({race.track} · {race.surface})</p>
                </div>

                {/* Podium Overview */}
                <div className="grid grid-cols-3 gap-2 bg-muted/50 rounded-xl p-3 border border-border text-center text-xs">
                  <div className="space-y-1">
                    <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/60 font-black">Hạng 2</span>
                    <span className="font-bold text-foreground text-[11px] block truncate">{race.results[1]?.horse}</span>
                  </div>
                  <div className="space-y-1 border-x border-border">
                    <span className="block text-[8px] uppercase tracking-wider text-primary font-black">🏆 Vô Địch</span>
                    <span className="font-black text-primary text-[11px] block truncate">{race.results[0]?.horse}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[8px] uppercase tracking-wider text-muted-foreground/60 font-black">Hạng 3</span>
                    <span className="font-bold text-foreground text-[11px] block truncate">{race.results[2]?.horse}</span>
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedRaceId(race.id)}
                  variant="outline"
                  className="w-full rounded-xl text-xs font-black uppercase tracking-wider"
                >
                  Xem Bảng Điểm Chi Tiết
                </Button>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Detailed Table Result View */
        <div className="space-y-6">
          <Button
            onClick={() => setSelectedRaceId(null)}
            variant="ghost"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="size-4 mr-2" /> Quay lại danh sách kết quả
          </Button>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px]" />
              
              <div className="space-y-2">
                <span className="text-[10px] text-primary font-black uppercase tracking-wider">{selectedRace?.tournament}</span>
                <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">{selectedRace?.name}</h2>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Khoảng cách: <strong className="text-foreground">{selectedRace?.distance}</strong></span>
                  <span>Đường chạy: <strong className="text-foreground">{selectedRace?.track}</strong></span>
                  <span>Mặt cỏ: <strong className="text-foreground">{selectedRace?.surface}</strong></span>
                  <span>Ngày đấu: <strong className="text-foreground">{selectedRace?.date}</strong></span>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-muted-foreground font-black uppercase tracking-wider">
                    <th className="p-4 w-16 text-center">Hạng</th>
                    <th className="p-4 w-16">Lane</th>
                    <th className="p-4">Chiến Mã</th>
                    <th className="p-4">Nài Ngựa</th>
                    <th className="p-4"><span className="flex items-center gap-1"><Timer className="size-3.5 text-primary" /> Thời gian chính thức</span></th>
                    <th className="p-4"><span className="flex items-center gap-1"><Siren className="size-3.5 text-primary" /> Lỗi / Giây phạt</span></th>
                    <th className="p-4 text-right">Giải Thưởng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedRace?.results.map((res) => (
                    <tr key={res.rank} className="hover:bg-muted/30 transition duration-200">
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center justify-center size-6 rounded-full font-black text-xs ${
                          res.rank === 1
                            ? "bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.3)]"
                            : res.rank === 2
                            ? "bg-slate-300 text-black"
                            : res.rank === 3
                            ? "bg-[#CD7F32] text-white"
                            : "bg-muted border border-border text-muted-foreground"
                        }`}>
                          {res.rank}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-muted-foreground">{res.lane}</td>
                      <td className="p-4 font-black text-foreground">{res.horse}</td>
                      <td className="p-4 font-bold text-foreground">{res.jockey}</td>
                      <td className="p-4 font-mono font-black text-foreground text-sm">{res.time}</td>
                      <td className={`p-4 ${res.penalty > 0 ? "text-primary font-bold" : "text-muted-foreground"}`}>
                        {res.violations}
                      </td>
                      <td className="p-4 text-right font-black text-primary text-sm">
                        {res.prize > 0 ? `${res.prize.toLocaleString()} Pts` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
