"use client";
import Image from "next/image";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Trophy, MapPin, Award, Flag, Loader2, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  tournamentsApi, racesApi, predictionsApi, 
  rankingsApi, rewardPointLedgerApi, dashboardApi,
  type TournamentItem, type RaceItem, type PredictionItem, 
  type RankingEntry, type JockeyRankingEntry
} from "@/lib/api-client";
import { toast } from "sonner";

export default function SpectatorDashboardPage() {
  // Wallet & Balance
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  
  // Dashboard Stats
  type DashboardStats = {
    tournaments?: { ongoing?: number };
    predictions?: { total?: number; winRate?: number };
  };
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Tournaments & Races
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [races, setRaces] = useState<RaceItem[]>([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [loadingRaces, setLoadingRaces] = useState(true);
  
  // Predictions for stats
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  
  // Rankings
  const [topHorses, setTopHorses] = useState<RankingEntry[]>([]);
  const [topJockeys, setTopJockeys] = useState<JockeyRankingEntry[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(true);

  const fetchBalance = useCallback(async () => {
    setLoadingBalance(true);
    try {
      const balanceRes = await rewardPointLedgerApi.myBalance();
      setBalance(balanceRes.balance ?? 0);
    } catch (e) {
      console.error("Lỗi khi lấy số dư ví:", e);
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const statsRes = await dashboardApi.getSpectatorStats();
      setDashboardStats(statsRes);
    } catch (e) {
      console.error("Lỗi khi lấy thống kê:", e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchTournaments = useCallback(async () => {
    setLoadingTournaments(true);
    try {
      const res = await tournamentsApi.list({ limit: 100 });
      // Show tournaments that are not DRAFT or CANCELLED
      const activeTournaments = (res.data || []).filter(
        (t) => t.status !== "DRAFT" && t.status !== "CANCELLED"
      );
      // Sort by: ONGOING first, then OPEN_REGISTRATION, then others
      const sorted = activeTournaments.sort((a, b) => {
        const statusOrder: Record<string, number> = { ONGOING: 0, OPEN_REGISTRATION: 1 };
        const aOrder = statusOrder[a.status] ?? 2;
        const bOrder = statusOrder[b.status] ?? 2;
        return aOrder - bOrder;
      });
      setTournaments(sorted.slice(0, 2));
    } catch (e) {
      console.error("Lỗi khi tải danh sách giải đấu:", e);
      toast.error("Không thể tải danh sách giải đấu");
    } finally {
      setLoadingTournaments(false);
    }
  }, []);

  const fetchRaces = useCallback(async () => {
    setLoadingRaces(true);
    try {
      const res = await racesApi.list({ limit: 100 });
      const activeRaces = (res.data || []).filter(
        (r) => r.status === "LIVE" || r.status === "FINISHED" || r.status === "RESULT_PUBLISHED"
      );
      activeRaces.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      setRaces(activeRaces.slice(0, 2));
    } catch (e) {
      console.error("Lỗi khi tải danh sách vòng đua:", e);
      toast.error("Không thể tải danh sách vòng đua");
    } finally {
      setLoadingRaces(false);
    }
  }, []);

  const fetchPredictions = useCallback(async () => {
    setLoadingPredictions(true);
    try {
      const res = await predictionsApi.listMyPredictions({ limit: 100 });
      setPredictions(res.data || []);
    } catch (e) {
      console.error("Lỗi khi tải dự đoán:", e);
    } finally {
      setLoadingPredictions(false);
    }
  }, []);

  const fetchRankings = useCallback(async () => {
    setLoadingRankings(true);
    try {
      const [horsesRes, jokeysRes] = await Promise.all([
        rankingsApi.getGlobalHorseRankings(),
        rankingsApi.getGlobalJockeyRankings(),
      ]);
      setTopHorses((horsesRes || []).slice(0, 5));
      setTopJockeys((jokeysRes || []).slice(0, 5));
    } catch (e) {
      console.error("Lỗi khi tải bảng xếp hạng:", e);
    } finally {
      setLoadingRankings(false);
    }
  }, []);

  useEffect(() => {
    void fetchBalance();
    void fetchStats();
    void fetchTournaments();
    void fetchRaces();
    void fetchPredictions();
    void fetchRankings();
  }, [fetchBalance, fetchStats, fetchTournaments, fetchRaces, fetchPredictions, fetchRankings]);

  // Calculate stats - use dashboard stats if available
  const ongoingTournamentsCount = dashboardStats?.tournaments?.ongoing ?? tournaments.filter((t) => t.status === "ONGOING").length;
  const totalPredictions = dashboardStats?.predictions?.total ?? predictions.length;
  const winRate = dashboardStats?.predictions?.winRate ?? (
    predictions.length > 0 
      ? ((predictions.filter((p) => p.status === "WON").length / predictions.length) * 100).toFixed(1)
      : "0"
  );

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "—";
    }
  };

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Simplified Header */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Đường Đua & Dự Đoán
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg">
              Theo dõi các giải đấu và đặt dự đoán để nhận điểm thưởng
            </p>
          </div>

          {/* Balance Card - Compact */}
          <div className="flex-shrink-0 rounded-xl border border-primary/20 bg-primary/5 p-4 min-w-fit">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Số dư Điểm</p>
                <div className="flex items-baseline gap-1">
                  {loadingBalance ? (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-foreground">
                        {balance.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-xs text-muted-foreground">điểm</span>
                    </>
                  )}
                </div>
              </div>
              <Button asChild size="sm" className="rounded-lg text-xs font-semibold">
                <Link href="/spectator/wallet">Xem ví</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats - Simplified */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between mb-3">
            <Trophy className="size-5 text-primary" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground mb-1">Giải Đang Diễn Ra</p>
          {loadingTournaments ? (
            <Loader2 className="size-4 animate-spin text-primary" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{ongoingTournamentsCount}</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between mb-3">
            <Zap className="size-5 text-amber-500" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground mb-1">Tổng Dự Đoán</p>
          {loadingPredictions || loadingStats ? (
            <Loader2 className="size-4 animate-spin text-amber-500" />
          ) : (
            <p className="text-2xl font-bold text-amber-500">{totalPredictions}</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between mb-3">
            <TrendingUp className="size-5 text-emerald-500" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground mb-1">Tỷ Lệ Đúng</p>
          {loadingPredictions ? (
            <Loader2 className="size-4 animate-spin text-emerald-500" />
          ) : (
            <p className="text-2xl font-bold text-emerald-500">{winRate}%</p>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Featured Tournaments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tournaments Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <Trophy className="size-5 text-primary" /> Giải Đấu Nổi Bật
              </h2>
              <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-primary">
                <Link href="/spectator/tournaments">Xem tất cả →</Link>
              </Button>
            </div>

            {loadingTournaments ? (
              <div className="flex items-center justify-center py-12">
                <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
              </div>
            ) : tournaments.length === 0 ? (
              <div className="rounded-xl border border-border bg-card/50 p-8 text-center">
                <p className="text-sm text-muted-foreground">Không có giải đấu nào đang diễn ra</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {tournaments.map((tour) => (
                  <div key={tour._id} className="rounded-xl border border-border bg-card p-4 flex flex-col">
                    <h3 className="font-semibold text-sm text-foreground mb-2 line-clamp-2">{tour.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{tour.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 mt-auto">
                      <MapPin className="size-3.5 text-primary flex-shrink-0" />
                      <span className="truncate">{tour.location || "Chưa xác định"}</span>
                    </div>
                    <Button asChild className="w-full rounded-lg text-xs font-semibold" size="sm">
                      <Link href={`/spectator/tournaments?id=${tour._id}`}>Chi tiết</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Races Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <Flag className="size-5 text-primary" /> Vòng Đua Gần Đây
              </h2>
              <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-primary">
                <Link href="/spectator/results">Xem tất cả →</Link>
              </Button>
            </div>

            {loadingRaces ? (
              <div className="flex items-center justify-center py-12">
                <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
              </div>
            ) : races.length === 0 ? (
              <div className="rounded-xl border border-border bg-card/50 p-8 text-center">
                <p className="text-sm text-muted-foreground">Không có vòng đua nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {races.map((race) => {
                  const tournamentName = typeof race.tournamentId === "object" ? race.tournamentId?.name : "Giải đấu";
                  const distanceKm = race.distanceMeters ? (race.distanceMeters / 1000).toFixed(1) : "?";
                  const statusBg = race.status === "LIVE" ? "bg-teal-500/10 border-teal-500/30" : "bg-card";

                  return (
                    <div key={race._id} className={`rounded-xl border border-border ${statusBg} p-4`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase">{tournamentName}</p>
                          <h4 className="font-semibold text-sm text-foreground">{race.name}</h4>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          race.status === "LIVE" ? "bg-teal-500/20 text-teal-400" : 
                          race.status === "RESULT_PUBLISHED" ? "bg-emerald-500/20 text-emerald-400" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {race.status === "LIVE" ? "LIVE" : race.status === "RESULT_PUBLISHED" ? "Kết quả" : "Hoàn thành"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{distanceKm}km</span>
                        <span>{formatTime(race.startTime)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Rankings & Wallet */}
        <div className="space-y-6">
          {/* Top Rankings */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Trophy className="size-5 text-primary" /> Bảng Xếp Hạng
            </h2>

            {loadingRankings ? (
              <div className="flex items-center justify-center py-12">
                <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Top Horses */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">🐎 Top Ngựa</h3>
                  <div className="space-y-2">
                    {topHorses.slice(0, 3).map((horse, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-muted-foreground w-5">{idx + 1}</span>
                          <span className="text-foreground font-semibold truncate">{horse.horseName || "—"}</span>
                        </div>
                        <span className="text-primary font-bold">{horse.totalPoints || 0} điểm</span>
                      </div>
                    ))}
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full rounded-lg text-xs mt-2">
                    <Link href="/spectator/rankings">Xem đầy đủ</Link>
                  </Button>
                </div>

                {/* Top Jockeys */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">👤 Top Nài</h3>
                  <div className="space-y-2">
                    {topJockeys.slice(0, 3).map((jockey, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-muted-foreground w-5">{idx + 1}</span>
                          <span className="text-foreground font-semibold truncate">{jockey.jockeyName || "—"}</span>
                        </div>
                        <span className="text-primary font-bold">{jockey.totalPoints || 0} điểm</span>
                      </div>
                    ))}
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full rounded-lg text-xs mt-2">
                    <Link href="/spectator/rankings">Xem đầy đủ</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>


        </div>
      </div>
    </main>
  );
}
