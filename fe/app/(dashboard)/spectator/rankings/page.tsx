"use client";

import { useEffect, useState } from "react";
import { Trophy, Flame } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { rankingsApi, type RankingEntry, type JockeyRankingEntry } from "@/lib/api-client";

function PointsCell({ value }: { value: number }) {
  return (
    <td className="p-4 text-right text-sm">
      <span className="font-black text-teal-600 dark:text-teal-400">{value}</span>{" "}
      <span className="font-bold text-muted-foreground">điểm</span>
    </td>
  );
}

export default function SpectatorRankingsPage() {
  const [activeTab, setActiveTab] = useState<"horses" | "jockeys">("horses");
  const [horseRankings, setHorseRankings] = useState<RankingEntry[]>([]);
  const [jockeyRankings, setJockeyRankingEntries] = useState<JockeyRankingEntry[]>([]);
  const [isLoadingHorses, setIsLoadingHorses] = useState(true);
  const [isLoadingJockeys, setIsLoadingJockeys] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHorseRankings() {
      try {
        setIsLoadingHorses(true);
        const data = await rankingsApi.getGlobalHorseRankings();
        setHorseRankings(data || []);
      } catch (err) {
        console.error(err);
        setError((err as Error).message || "Không thể tải bảng xếp hạng ngựa.");
      } finally {
        setIsLoadingHorses(false);
      }
    }
    void loadHorseRankings();
  }, []);

  useEffect(() => {
    async function loadJockeyRankings() {
      try {
        setIsLoadingJockeys(true);
        const data = await rankingsApi.getGlobalJockeyRankings();
        setJockeyRankingEntries(data || []);
      } catch (err) {
        console.error(err);
        setError((err as Error).message || "Không thể tải bảng xếp hạng jockey.");
      } finally {
        setIsLoadingJockeys(false);
      }
    }
    void loadJockeyRankings();
  }, []);

  const formatAvgTime = (totalMs?: number, totalRaces?: number) => {
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
    <main className="mx-auto max-w-6xl space-y-6 pb-12">
      <PageHeader
        eyebrow="Hall of Fame"
        title="Bảng Xếp Hạng Giải Đấu"
        description="Bảng tổng hợp điểm số, số trận thắng cán đích về nhất và tỷ lệ chiến thắng của các chiến mã và nài ngựa xuất sắc nhất."
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

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
                <th className="p-4">Chủ Sở Hữu</th>
                <th className="p-4 text-center">Số Trận Đã Chạy</th>
                <th className="p-4 text-center">Cán Đích Về Nhất</th>
                <th className="p-4 text-center">Thành tích TB</th>
                <th className="p-4 text-right">Tổng Điểm Tích Lũy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoadingHorses ? (
                [1, 2, 3].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="p-4 colSpan={8}" colSpan={8}>
                      <div className="h-6 bg-muted rounded" />
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
                  <tr key={horse.horseId} className="transition duration-200 hover:bg-muted/40">
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-black ${
                          horse.rank === 1
                            ? "bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.3)] animate-pulse"
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
                      {horse.horseName || "Chiến mã ẩn danh"}
                      {horse.rank === 1 && <Flame className="size-3.5 animate-bounce text-primary" />}
                    </td>
                    <td className="p-4 text-muted-foreground">{horse.breed || "Chưa rõ"}</td>
                    <td className="p-4 text-muted-foreground font-medium">{horse.ownerName || "—"}</td>
                    <td className="p-4 text-center font-bold text-foreground">{horse.totalRaces}</td>
                    <td className="p-4 text-center font-black text-primary">{horse.wins}</td>
                    <td className="p-4 text-center font-mono text-muted-foreground">
                      {formatAvgTime(horse.totalFinishTimeMs, horse.totalRaces)}
                    </td>
                    <PointsCell value={horse.totalPoints} />
                  </tr>
                ))
              )}
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
                <th className="p-4">Cấp Độ</th>
                <th className="p-4 text-center">Kinh Nghiệm</th>
                <th className="p-4 text-center font-bold">Tổng Trận Cưỡi</th>
                <th className="p-4 text-center font-bold">Số Trận Thắng</th>
                <th className="p-4 text-right">Tổng Điểm Tích Lũy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoadingJockeys ? (
                [1, 2, 3].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="p-4 colSpan={7}" colSpan={7}>
                      <div className="h-6 bg-muted rounded" />
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
                  <tr key={jockey.jockeyUserId} className="transition duration-200 hover:bg-muted/40">
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-black ${
                          jockey.rank === 1
                            ? "bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.3)] animate-pulse"
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
                      {jockey.jockeyName || "Jockey ẩn danh"}
                      {jockey.rank === 1 && <Trophy className="size-3.5 animate-bounce text-primary" />}
                    </td>
                    <td className="p-4 text-muted-foreground">{getSkillLevelText(jockey.skillLevel)}</td>
                    <td className="p-4 text-center font-medium text-foreground">
                      {jockey.experienceYears ? `${jockey.experienceYears} năm` : "—"}
                    </td>
                    <td className="p-4 text-center font-bold text-foreground">{jockey.totalRaces}</td>
                    <td className="p-4 text-center font-black text-primary">{jockey.wins}</td>
                    <PointsCell value={jockey.totalPoints} />
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
