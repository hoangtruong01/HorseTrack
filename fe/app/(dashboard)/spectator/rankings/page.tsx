"use client";

import { useState } from "react";
import { Award, Trophy, Star, ShieldCheck, Flame, Compass, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

// Mock Horse Rankings Data
const mockHorseRankings = [
  { rank: 1, name: "Midnight Alloy", breed: "Thoroughbred", owner: "Saigon Equine", races: 12, wins: 8, points: 240, avgTime: "1:28.40" },
  { rank: 2, name: "Delta Comet", breed: "Arabian", owner: "Red River Farm", races: 10, wins: 6, points: 180, avgTime: "1:29.10" },
  { rank: 3, name: "Crimson Bolt", breed: "Quarter Horse", owner: "Linh Tran Stable", races: 14, wins: 5, points: 155, avgTime: "1:31.70" },
  { rank: 4, name: "Silver Apex", breed: "Appaloosa", owner: "North Track Club", races: 8, wins: 3, points: 90, avgTime: "1:33.20" },
  { rank: 5, name: "Neon Stirrup", breed: "Mustang", owner: "Viet Derby House", races: 9, wins: 2, points: 75, avgTime: "1:35.00" }
];

// Mock Jockey Rankings Data
const mockJockeyRankings = [
  { rank: 1, name: "Gia Huy", license: "JK-091", matches: 15, wins: 9, winRate: "60.0%", points: 270 },
  { rank: 2, name: "An Nhi", license: "JK-042", matches: 12, wins: 7, winRate: "58.3%", points: 210 },
  { rank: 3, name: "Minh Khoa", license: "JK-108", matches: 16, wins: 6, winRate: "37.5%", points: 180 },
  { rank: 4, name: "Bao Nam", license: "JK-025", matches: 10, wins: 4, winRate: "40.0%", points: 120 },
  { rank: 5, name: "Thanh Vy", license: "JK-114", matches: 8, wins: 2, winRate: "25.0%", points: 60 }
];

export default function SpectatorRankingsPage() {
  const [activeTab, setActiveTab] = useState<"horses" | "jockeys">("horses");

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        eyebrow="Hall of Fame"
        title="Bảng Xếp Hạng Giải Đấu"
        description="Bảng tổng hợp điểm số, số trận thắng cán đích về nhất và tỷ lệ chiến thắng của các chiến mã và nài ngựa xuất sắc nhất."
      />

      {/* Tab Triggers */}
      <div className="flex border-b dark:border-white/10 border-border max-w-sm">
        <button
          onClick={() => setActiveTab("horses")}
          className={`flex-1 pb-3 text-sm font-black uppercase tracking-wider transition ${
            activeTab === "horses"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground dark:hover:text-white"
          }`}
        >
          🐎 Chiến Mã Vô Địch
        </button>
        <button
          onClick={() => setActiveTab("jockeys")}
          className={`flex-1 pb-3 text-sm font-black uppercase tracking-wider transition ${
            activeTab === "jockeys"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground dark:hover:text-white"
          }`}
        >
          🏇 Nài Ngựa Hàng Đầu
        </button>
      </div>

      {activeTab === "horses" ? (
        /* Horses Ranking Table */
        <div className="space-y-4">
          <div className="rounded-2xl border dark:border-white/5 border-border dark:bg-[#13131A] bg-card overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b dark:border-white/10 border-border dark:bg-white/[0.02] bg-muted/50 text-muted-foreground font-black uppercase tracking-wider">
                  <th className="p-4 w-16 text-center">Hạng</th>
                  <th className="p-4">Tên Chiến Mã</th>
                  <th className="p-4">Giống Ngựa</th>
                  <th className="p-4 text-center">Số Trận Đã Chạy</th>
                  <th className="p-4 text-center">Cán Đích Về Nhất</th>
                  <th className="p-4 text-center">Thành tích TB</th>
                  <th className="p-4 text-right">Tổng Điểm Tích Lũy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mockHorseRankings.map((horse) => (
                  <tr key={horse.rank} className="hover:dark:bg-white/[0.01] bg-muted/50 transition duration-200">
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center size-6 rounded-full font-black text-xs ${
                        horse.rank === 1
                          ? "bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.3)]"
                          : horse.rank === 2
                          ? "bg-slate-300 text-black"
                          : horse.rank === 3
                          ? "bg-[#CD7F32] text-white"
                          : "dark:bg-white/5 bg-muted/50 border dark:border-white/10 border-border text-muted-foreground"
                      }`}>
                        {horse.rank}
                      </span>
                    </td>
                    <td className="p-4 font-black dark:text-white text-foreground flex items-center gap-2">
                      {horse.name}
                      {horse.rank === 1 && (
                        <Flame className="size-3.5 text-primary animate-pulse" />
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">{horse.breed}</td>
                    <td className="p-4 text-center font-bold dark:text-white text-foreground">{horse.races}</td>
                    <td className="p-4 text-center text-primary font-black">{horse.wins}</td>
                    <td className="p-4 text-center font-mono text-muted-foreground">{horse.avgTime}</td>
                    <td className="p-4 text-right font-black text-teal-400 text-sm">
                      {horse.points} Pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Jockeys Ranking Table */
        <div className="space-y-4">
          <div className="rounded-2xl border dark:border-white/5 border-border dark:bg-[#13131A] bg-card overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b dark:border-white/10 border-border dark:bg-white/[0.02] bg-muted/50 text-muted-foreground font-black uppercase tracking-wider">
                  <th className="p-4 w-16 text-center">Hạng</th>
                  <th className="p-4">Họ Tên Nài Ngựa</th>
                  <th className="p-4">Số Giấy Phép</th>
                  <th className="p-4 text-center">Tổng Trận Cưỡi</th>
                  <th className="p-4 text-center font-bold">Số Trận Thắng</th>
                  <th className="p-4 text-center">Tỉ Lệ Thắng</th>
                  <th className="p-4 text-right">Tổng Điểm NGHỀ NGHIỆP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mockJockeyRankings.map((jockey) => (
                  <tr key={jockey.rank} className="hover:dark:bg-white/[0.01] bg-muted/50 transition duration-200">
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center size-6 rounded-full font-black text-xs ${
                        jockey.rank === 1
                          ? "bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.3)]"
                          : jockey.rank === 2
                          ? "bg-slate-300 text-black"
                          : jockey.rank === 3
                          ? "bg-[#CD7F32] text-white"
                          : "dark:bg-white/5 bg-muted/50 border dark:border-white/10 border-border text-muted-foreground"
                      }`}>
                        {jockey.rank}
                      </span>
                    </td>
                    <td className="p-4 font-black dark:text-white text-foreground flex items-center gap-2">
                      {jockey.name}
                      {jockey.rank === 1 && (
                        <Trophy className="size-3.5 text-primary animate-bounce" />
                      )}
                    </td>
                    <td className="p-4 font-mono text-muted-foreground">{jockey.license}</td>
                    <td className="p-4 text-center font-bold dark:text-white text-foreground">{jockey.matches}</td>
                    <td className="p-4 text-center text-primary font-black">{jockey.wins}</td>
                    <td className="p-4 text-center font-bold text-teal-400">{jockey.winRate}</td>
                    <td className="p-4 text-right font-black text-teal-400 text-sm">
                      {jockey.points} Pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
