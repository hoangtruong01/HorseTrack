"use client";

import { useEffect, useState } from "react";
import { Award, Trophy, Star, Flame, ShieldCheck, User } from "lucide-react";
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

export default function JockeyRankingsPage() {
  const [activeTab, setActiveTab] = useState<"horses" | "jockeys">("jockeys"); // Default to jockeys since they are a jockey!
  const [horseRankings, setHorseRankings] = useState<HorseRanking[]>([]);
  const [jockeyRankings, setJockeyRankings] = useState<JockeyRanking[]>([]);
  const [currentJockeyId, setCurrentJockeyId] = useState<string | null>(null);
  const [myRankingInfo, setMyRankingInfo] = useState<JockeyRanking | null>(null);
  const [isLoadingHorses, setIsLoadingHorses] = useState(true);
  const [isLoadingJockeys, setIsLoadingJockeys] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Current User Profile
  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoadingProfile(true);
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.user) {
            const uId = resData.user.id || resData.user._id;
            setCurrentJockeyId(uId);
          }
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin nài ngựa:", err);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    loadProfile();
  }, []);

  // Load Horse Rankings
  useEffect(() => {
    async function loadHorseRankings() {
      try {
        setIsLoadingHorses(true);
        const res = await fetch("/api/jockey/rankings/horses");
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
        const res = await fetch("/api/jockey/rankings/jockeys");
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

  // Compute Jockey's own ranking info once loaded
  useEffect(() => {
    if (!currentJockeyId || jockeyRankings.length === 0) {
      setMyRankingInfo(null);
      return;
    }
    const found = jockeyRankings.find(
      (j) => j.jockeyUserId === currentJockeyId
    );
    if (found) {
      setMyRankingInfo(found);
    } else {
      setMyRankingInfo(null);
    }
  }, [currentJockeyId, jockeyRankings]);

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
    <main className="space-y-6 max-w-6xl mx-auto pb-12 px-4 sm:px-6">
      <PageHeader
        eyebrow="Đại sảnh vinh danh"
        title="Bảng Xếp Hạng Vô Địch"
        description="Bảng xếp hạng hiệu suất thi đấu của toàn bộ nài ngựa và chiến mã dựa trên số lần giành ngôi vô địch (Hạng 1)."
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Jockey Standing Summary Card */}
      {!isLoadingJockeys && !isLoadingProfile && (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#15151E] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.34)]">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(225,6,0,0.12),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(6,126,106,0.1),transparent_25rem)]" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                Thứ hạng của bạn
              </span>
              {myRankingInfo ? (
                <div>
                  <h2 className="text-xl font-black uppercase text-white sm:text-2xl flex items-center gap-2">
                    Bạn đang đứng thứ <span className="text-primary text-3xl font-black">#{myRankingInfo.rank}</span> trên {jockeyRankings.length} nài ngựa!
                  </h2>
                  <p className="text-xs text-white/50 leading-relaxed max-w-xl">
                    Tiếp tục chấp nhận lời mời và cưỡi ngựa chiến thắng để nâng hạng của bạn trên Bảng xếp hạng Vô địch.
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-black uppercase text-white">
                    Bạn chưa có xếp hạng chính thức
                  </h2>
                  <p className="text-xs text-white/50 leading-relaxed max-w-xl">
                    Hệ thống chỉ xếp hạng các nài ngựa đã hoàn thành trận đua và được công bố kết quả. Hãy tích cực tham gia đua nhé!
                  </p>
                </div>
              )}
            </div>

            {myRankingInfo && (
              <div className="flex gap-4 self-start md:self-auto">
                <div className="bg-black/30 px-4 py-3 rounded-xl border border-white/5 text-center min-w-[90px]">
                  <span className="block text-[9px] uppercase tracking-wider text-white/45">Vô địch</span>
                  <span className="text-lg font-black text-primary mt-1 block">{myRankingInfo.wins}</span>
                </div>
                <div className="bg-black/30 px-4 py-3 rounded-xl border border-white/5 text-center min-w-[90px]">
                  <span className="block text-[9px] uppercase tracking-wider text-white/45">Số trận</span>
                  <span className="text-lg font-black text-white mt-1 block">{myRankingInfo.totalRaces}</span>
                </div>
                <div className="bg-black/30 px-4 py-3 rounded-xl border border-white/5 text-center min-w-[90px]">
                  <span className="block text-[9px] uppercase tracking-wider text-white/45">Điểm tích lũy</span>
                  <span className="text-lg font-black text-teal-400 mt-1 block">{myRankingInfo.totalPoints}đ</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Triggers */}
      <div className="flex border-b border-white/10 max-w-sm">
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
      </div>

      {activeTab === "jockeys" ? (
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
                  jockeyRankings.map((jockey) => {
                    const isMe = jockey.jockeyUserId === currentJockeyId;
                    return (
                      <tr
                        key={jockey.jockeyUserId}
                        className={`transition duration-200 ${
                          isMe
                            ? "bg-primary/5 hover:bg-primary/10 border-l-4 border-l-primary font-bold"
                            : "hover:bg-white/[0.01]"
                        }`}
                      >
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
                          {isMe && (
                            <span className="ml-2 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                              Bạn
                            </span>
                          )}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
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
      )}
    </main>
  );
}
