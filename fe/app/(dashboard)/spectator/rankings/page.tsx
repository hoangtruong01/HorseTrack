"use client";

import { useState } from "react";
import { Trophy, Flame } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

const mockHorseRankings = [
  { rank: 1, name: "Midnight Alloy", breed: "Thoroughbred", owner: "Saigon Equine", races: 12, wins: 8, points: 240, avgTime: "1:28.40" },
  { rank: 2, name: "Delta Comet", breed: "Arabian", owner: "Red River Farm", races: 10, wins: 6, points: 180, avgTime: "1:29.10" },
  { rank: 3, name: "Crimson Bolt", breed: "Quarter Horse", owner: "Linh Tran Stable", races: 14, wins: 5, points: 155, avgTime: "1:31.70" },
  { rank: 4, name: "Silver Apex", breed: "Appaloosa", owner: "North Track Club", races: 8, wins: 3, points: 90, avgTime: "1:33.20" },
  { rank: 5, name: "Neon Stirrup", breed: "Mustang", owner: "Viet Derby House", races: 9, wins: 2, points: 75, avgTime: "1:35.00" },
];

const mockJockeyRankings = [
  { rank: 1, name: "Gia Huy", license: "JK-091", matches: 15, wins: 9, winRate: "60.0%", points: 270 },
  { rank: 2, name: "An Nhi", license: "JK-042", matches: 12, wins: 7, winRate: "58.3%", points: 210 },
  { rank: 3, name: "Minh Khoa", license: "JK-108", matches: 16, wins: 6, winRate: "37.5%", points: 180 },
  { rank: 4, name: "Bao Nam", license: "JK-025", matches: 10, wins: 4, winRate: "40.0%", points: 120 },
  { rank: 5, name: "Thanh Vy", license: "JK-114", matches: 8, wins: 2, winRate: "25.0%", points: 60 },
];

function PointsCell({ value }: { value: number }) {
  return (
    <td className="p-4 text-right text-sm">
      <span className="font-black text-teal-700">{value}</span>{" "}
      <span className="font-bold text-muted-foreground">Pts</span>
    </td>
  );
}

export default function SpectatorRankingsPage() {
  const [activeTab, setActiveTab] = useState<"horses" | "jockeys">("horses");

  return (
    <main className="mx-auto max-w-6xl space-y-6 pb-12">
      <PageHeader
        eyebrow="Hall of Fame"
        title="Bảng Xếp Hạng Giải Đấu"
        description="Bảng tổng hợp điểm số, số trận thắng cán đích về nhất và tỷ lệ chiến thắng của các chiến mã và nài ngựa xuất sắc nhất."
      />

      <div className="flex max-w-sm border-b border-border">
        <button
          onClick={() => setActiveTab("horses")}
          className={`flex-1 pb-3 text-sm font-black uppercase tracking-wider transition ${
            activeTab === "horses"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          🐎 Chiến Mã Vô Địch
        </button>
        <button
          onClick={() => setActiveTab("jockeys")}
          className={`flex-1 pb-3 text-sm font-black uppercase tracking-wider transition ${
            activeTab === "jockeys"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          🏇 Nài Ngựa Hàng Đầu
        </button>
      </div>

      {activeTab === "horses" ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/60 font-black uppercase tracking-wider text-muted-foreground">
                <th className="w-16 p-4 text-center">Hạng</th>
                <th className="p-4">Tên Chiến Mã</th>
                <th className="p-4">Giống Ngựa</th>
                <th className="p-4 text-center">Số Trận Đã Chạy</th>
                <th className="p-4 text-center">Cán Đích Về Nhất</th>
                <th className="p-4 text-center">Thành tích TB</th>
                <th className="p-4 text-right">Tổng Điểm Tích Lũy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockHorseRankings.map((horse) => (
                <tr key={horse.rank} className="transition duration-200 hover:bg-muted/40">
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-black ${
                        horse.rank === 1
                          ? "bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.3)]"
                          : horse.rank === 2
                            ? "bg-slate-300 text-black"
                            : horse.rank === 3
                              ? "bg-[#CD7F32] text-foreground"
                              : "border border-border bg-muted text-muted-foreground"
                      }`}
                    >
                      {horse.rank}
                    </span>
                  </td>
                  <td className="flex items-center gap-2 p-4 font-black text-foreground">
                    {horse.name}
                    {horse.rank === 1 && <Flame className="size-3.5 animate-pulse text-primary" />}
                  </td>
                  <td className="p-4 text-muted-foreground">{horse.breed}</td>
                  <td className="p-4 text-center font-bold text-foreground">{horse.races}</td>
                  <td className="p-4 text-center font-black text-primary">{horse.wins}</td>
                  <td className="p-4 text-center font-mono text-muted-foreground">{horse.avgTime}</td>
                  <PointsCell value={horse.points} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/60 font-black uppercase tracking-wider text-muted-foreground">
                <th className="w-16 p-4 text-center">Hạng</th>
                <th className="p-4">Họ Tên Nài Ngựa</th>
                <th className="p-4">Số Giấy Phép</th>
                <th className="p-4 text-center">Tổng Trận Cưỡi</th>
                <th className="p-4 text-center font-bold">Số Trận Thắng</th>
                <th className="p-4 text-center">Tỉ Lệ Thắng</th>
                <th className="p-4 text-right">Tổng Điểm NGHỀ NGHIỆP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockJockeyRankings.map((jockey) => (
                <tr key={jockey.rank} className="transition duration-200 hover:bg-muted/40">
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-black ${
                        jockey.rank === 1
                          ? "bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.3)]"
                          : jockey.rank === 2
                            ? "bg-slate-300 text-black"
                            : jockey.rank === 3
                              ? "bg-[#CD7F32] text-foreground"
                              : "border border-border bg-muted text-muted-foreground"
                      }`}
                    >
                      {jockey.rank}
                    </span>
                  </td>
                  <td className="flex items-center gap-2 p-4 font-black text-foreground">
                    {jockey.name}
                    {jockey.rank === 1 && <Trophy className="size-3.5 animate-bounce text-primary" />}
                  </td>
                  <td className="p-4 font-mono text-muted-foreground">{jockey.license}</td>
                  <td className="p-4 text-center font-bold text-foreground">{jockey.matches}</td>
                  <td className="p-4 text-center font-black text-primary">{jockey.wins}</td>
                  <td className="p-4 text-center font-bold text-teal-700">{jockey.winRate}</td>
                  <PointsCell value={jockey.points} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
