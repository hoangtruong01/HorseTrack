"use client";

import { useEffect, useState } from "react";
import { Award, Trophy, Star, Flame, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

interface HorseRanking {
  horseId: string;
  horseName: string;
  breed?: string;
  ownerName?: string;
  totalPoints: number;
  totalRaces: number;
  wins: number;
  totalFinishTimeMs: number;
  rank: number;
}

interface JockeyRanking {
  jockeyUserId: string;
  jockeyName: string;
  experienceYears?: number;
  skillLevel?: string;
  totalPoints: number;
  totalRaces: number;
  wins: number;
  totalFinishTimeMs: number;
  rank: number;
}

export default function OwnerRankingsPage() {
  const [activeTab, setActiveTab] = useState<"horses" | "jockeys">("horses");
  const [horseRankings, setHorseRankings] = useState<HorseRanking[]>([]);
  const [jockeyRankings, setJockeyRankings] = useState<JockeyRanking[]>([]);
  const [isLoadingHorses, setIsLoadingHorses] = useState(true);
  const [isLoadingJockeys, setIsLoadingJockeys] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Horse Rankings
  useEffect(() => {
    async function loadHorseRankings() {
      try {
        setIsLoadingHorses(true);
        const res = await fetch("/api/owner/rankings/horses");
        const resData = await res.json();
        if (res.ok && resData.success) {
          setHorseRankings(resData.data || []);
        } else {
          setError(resData.message || "Không thể tải bảng xếp hạng ngựa.");
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi kết nối mạng.");
      } finally {
        setIsLoadingHorses(false);
      }
    }
    loadHorseRankings();
  }, []);

  // Load Jockey Rankings
  useEffect(() => {
    async function loadJockeyRankings() {
      try {
        setIsLoadingJockeys(true);
        const res = await fetch("/api/owner/rankings/jockeys");
        const resData = await res.json();
        if (res.ok && resData.success) {
          setJockeyRankings(resData.data || []);
        } else {
          setError(resData.message || "Không thể tải bảng xếp hạng jockey.");
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi kết nối mạng.");
      } finally {
        setIsLoadingJockeys(false);
      }
    }
    loadJockeyRankings();
  }, []);

  const formatAvgTime = (totalMs: number, totalRaces: number) => {
    if (!totalMs || !totalRaces) return "—";
    const avgMs = totalMs / totalRaces;
    const totalSeconds = avgMs / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(2);
    return `${minutes}:${seconds.padStart(5, "0")}`;
  };

  const getSkillLevelText = (level?: string) => {
    if (!level) return "Chưa xác định";
    const map: Record<string, string> = {
      beginner: "Nài tập sự",
      intermediate: "Nài trung cấp",
      advanced: "Nài cao cấp",
      professional: "Chuyên nghiệp",
    };
    return map[level.toLowerCase()] || level;
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        eyebrow="Đại sảnh vinh danh"
        title="Bảng Xếp Hạng Vô Địch"
        description="Bảng tổng hợp xếp hạng chiến mã và nài ngựa xuất sắc nhất toàn hệ thống, dựa trên tổng số trận thắng cán đích về nhất (chức vô địch)."
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Tab Triggers */}
      <div className="flex border-b border-white/10 max-w-sm">
        <button
          onClick={() => setActiveTab("horses")}
          className={`flex-1 pb-3 text-sm font-black uppercase tracking-wider transition ${
            activeTab === "horses"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          🐎 Chiến Mã Vô Địch
        </button>
        <button
          onClick={() => setActiveTab("jockeys")}
          className={`flex-1 pb-3 text-sm font-black uppercase tracking-wider transition ${
            activeTab === "jockeys"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-white"
          }`}
        >
          🏇 Nài Ngựa Hàng Đầu
        </button>
      </div>

      {activeTab === "horses" ? (
        /* Horses Ranking Table */
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-[#13131A] overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-muted-foreground font-black uppercase tracking-wider">
                  <th className="p-4 w-16 text-center">Hạng</th>
                  <th className="p-4">Tên Chiến Mã</th>
                  <th className="p-4">Giống Ngựa</th>
                  <th className="p-4">Chủ Sở Hữu</th>
                  <th className="p-4 text-center">Số Trận Đã Chạy</th>
                  <th className="p-4 text-center text-primary font-black">Số Lần Vô Địch (Hạng 1)</th>
                  <th className="p-4 text-center">Thời Gian TB</th>
                  <th className="p-4 text-right">Tổng Điểm Tích Lũy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoadingHorses ? (
                  [1, 2, 3].map((n) => (
                    <tr key={n} className="animate-pulse">
                      <td className="p-4" colSpan={8}>
                        <div className="h-6 bg-white/5 rounded" />
                      </td>
                    </tr>
                  ))
                ) : horseRankings.length === 0 ? (
                  <tr>
                    <td className="p-8 text-center text-muted-foreground" colSpan={8}>
                      Chưa có dữ liệu xếp hạng ngựa.
                    </td>
                  </tr>
                ) : (
                  horseRankings.map((horse) => (
                    <tr key={horse.horseId} className="hover:bg-white/[0.01] transition duration-200">
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center size-6 rounded-full font-black text-xs ${
                            horse.rank === 1
                              ? "bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.3)] animate-pulse"
                              : horse.rank === 2
                              ? "bg-slate-300 text-black"
                              : horse.rank === 3
                              ? "bg-[#CD7F32] text-white"
                              : "bg-white/5 border border-white/10 text-muted-foreground"
                          }`}
                        >
                          {horse.rank}
                        </span>
                      </td>
                      <td className="p-4 font-black text-white flex items-center gap-2">
                        {horse.horseName}
                        {horse.rank === 1 && (
                          <Flame className="size-3.5 text-primary animate-bounce" />
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">{horse.breed || "Chưa rõ"}</td>
                      <td className="p-4 text-muted-foreground font-medium">{horse.ownerName || "—"}</td>
                      <td className="p-4 text-center font-bold text-white">{horse.totalRaces}</td>
                      <td className="p-4 text-center text-primary font-black text-sm">{horse.wins}</td>
                      <td className="p-4 text-center font-mono text-muted-foreground">
                        {formatAvgTime(horse.totalFinishTimeMs, horse.totalRaces)}
                      </td>
                      <td className="p-4 text-right font-black text-teal-400 text-sm">
                        {horse.totalPoints} Pts
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Jockeys Ranking Table */
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 bg-[#13131A] overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-muted-foreground font-black uppercase tracking-wider">
                  <th className="p-4 w-16 text-center">Hạng</th>
                  <th className="p-4">Họ Tên Nài Ngựa</th>
                  <th className="p-4">Cấp Độ</th>
                  <th className="p-4 text-center">Kinh Nghiệm</th>
                  <th className="p-4 text-center font-bold">Tổng Trận Cưỡi</th>
                  <th className="p-4 text-center text-primary font-black">Số Lần Vô Địch (Hạng 1)</th>
                  <th className="p-4 text-right">Tổng Điểm Tích Lũy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoadingJockeys ? (
                  [1, 2, 3].map((n) => (
                    <tr key={n} className="animate-pulse">
                      <td className="p-4" colSpan={7}>
                        <div className="h-6 bg-white/5 rounded" />
                      </td>
                    </tr>
                  ))
                ) : jockeyRankings.length === 0 ? (
                  <tr>
                    <td className="p-8 text-center text-muted-foreground" colSpan={7}>
                      Chưa có dữ liệu xếp hạng nài ngựa.
                    </td>
                  </tr>
                ) : (
                  jockeyRankings.map((jockey) => (
                    <tr key={jockey.jockeyUserId} className="hover:bg-white/[0.01] transition duration-200">
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center size-6 rounded-full font-black text-xs ${
                            jockey.rank === 1
                              ? "bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.3)] animate-pulse"
                              : jockey.rank === 2
                              ? "bg-slate-300 text-black"
                              : jockey.rank === 3
                              ? "bg-[#CD7F32] text-white"
                              : "bg-white/5 border border-white/10 text-muted-foreground"
                          }`}
                        >
                          {jockey.rank}
                        </span>
                      </td>
                      <td className="p-4 font-black text-white flex items-center gap-2">
                        {jockey.jockeyName}
                        {jockey.rank === 1 && (
                          <Trophy className="size-3.5 text-primary animate-bounce" />
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">{getSkillLevelText(jockey.skillLevel)}</td>
                      <td className="p-4 text-center text-white font-medium">
                        {jockey.experienceYears ? `${jockey.experienceYears} năm` : "—"}
                      </td>
                      <td className="p-4 text-center font-bold text-white">{jockey.totalRaces}</td>
                      <td className="p-4 text-center text-primary font-black text-sm">{jockey.wins}</td>
                      <td className="p-4 text-right font-black text-teal-400 text-sm">
                        {jockey.totalPoints} Pts
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
