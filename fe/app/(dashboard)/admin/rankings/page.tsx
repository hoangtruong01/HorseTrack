"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Flag, Trophy, User } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
  rankingsApi,
  tournamentsApi,
  racesApi,
  type RankingEntry,
  type TournamentItem,
  type RaceItem,
} from "@/lib/api-client";
import { HorseDetailModal } from "@/components/horses/horse-detail-modal";

export default function AdminRankingsPage() {
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [races, setRaces] = useState<RaceItem[]>([]);
  const [selectedRace, setSelectedRace] = useState("");

  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRaces, setLoadingRaces] = useState(false);

  // Selected horse modal state
  const [modalHorseId, setModalHorseId] = useState<string | null>(null);
  const [modalHorseData, setModalHorseData] = useState<{ name?: string; breed?: string } | null>(null);

  // Pagination state (10 items per page)
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Load Tournaments List
  useEffect(() => {
    async function loadTournaments() {
      try {
        const res = await tournamentsApi.list({ limit: 100 });
        setTournaments(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedTournament(res.data[0]._id);
        }
      } catch (e) {
        toast.error((e as Error).message ?? "Lỗi tải danh sách giải đấu");
      }
    }
    void loadTournaments();
  }, []);

  // 2. When Selected Tournament changes -> Fetch Races/Rounds for dropdown 2
  useEffect(() => {
    if (!selectedTournament) {
      setRaces([]);
      setSelectedRace("");
      return;
    }
    setLoadingRaces(true);
    setSelectedRace("");
    racesApi
      .listByTournament(selectedTournament)
      .then((res) => {
        setRaces(res.data || []);
      })
      .catch(() => {
        setRaces([]);
      })
      .finally(() => setLoadingRaces(false));
  }, [selectedTournament]);

  // 3. Fetch Combined Rankings for selected Tournament & Race
  useEffect(() => {
    if (!selectedTournament) return;
    setLoading(true);
    setCurrentPage(1);
    rankingsApi
      .getHorseRankings(selectedTournament, selectedRace || undefined)
      .then((h) => {
        setRankings(h || []);
      })
      .catch((e) => toast.error((e as Error).message ?? "Lỗi tính toán ranking"))
      .finally(() => setLoading(false));
  }, [selectedTournament, selectedRace]);

  const rankBadge = (rank: number | undefined) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const paginatedRankings = rankings.slice((currentPage - 1) * 10, currentPage * 10);
  const currentRaceObj = races.find((r) => r._id === selectedRace);

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Ranking Management"
        title="Quản Lý Xếp Hạng Giải Đấu"
        description="Bảng xếp hạng tổng hợp theo từng Chiến mã và Nài ngựa tương ứng. Lựa chọn giải đấu lớn và lọc chi tiết theo từng vòng đấu nhỏ."
      />

      {/* Select Filters: Tournament & Specific Race/Round */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center bg-card/60 p-4 rounded-2xl border border-border backdrop-blur-md shadow-sm">
        {/* Dropdown 1: Giải đấu lớn */}
        <div className="flex flex-col gap-1 flex-1 min-w-[240px]">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Trophy className="size-3 text-yellow-500" /> 1. Chọn Giải Đấu Lớn
          </label>
          <select
            className="h-10 rounded-xl border border-border bg-background px-3.5 text-sm text-foreground focus:border-primary focus:outline-none cursor-pointer"
            value={selectedTournament}
            onChange={(e) => setSelectedTournament(e.target.value)}
          >
            <option value="" className="bg-card text-foreground">— Chọn Giải Đấu —</option>
            {tournaments.map((t) => (
              <option key={t._id} value={t._id} className="bg-card text-foreground">
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 2: Vòng đấu / Trận đua nhỏ trong giải */}
        <div className="flex flex-col gap-1 flex-1 min-w-[260px]">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Flag className="size-3 text-primary" /> 2. Chọn Vòng Đấu / Trận Đua
            </span>
            {loadingRaces && <span className="text-[9px] text-primary animate-pulse">Đang tải...</span>}
          </label>
          <select
            className="h-10 rounded-xl border border-border bg-background px-3.5 text-sm text-foreground focus:border-primary focus:outline-none cursor-pointer disabled:opacity-50"
            value={selectedRace}
            disabled={!selectedTournament || loadingRaces}
            onChange={(e) => setSelectedRace(e.target.value)}
          >
            <option value="">🏆 Tất cả các vòng đấu (Tổng hợp giải)</option>
            {races.map((r, idx) => (
              <option key={r._id} value={r._id}>
                Vòng {idx + 1}: {r.name} {r.distanceMeters ? `(${r.distanceMeters}m)` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Info Banner for specific race filter */}
      {selectedRace && currentRaceObj && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-primary/10 border border-primary/20 rounded-2xl p-4 text-xs text-foreground">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <Flag className="size-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">{currentRaceObj.name}</h4>
              <p className="text-muted-foreground mt-0.5">
                Khoảng cách: <strong className="text-foreground">{currentRaceObj.distanceMeters}m</strong> · Trạng thái:{" "}
                <span className="uppercase font-bold text-primary">{currentRaceObj.status}</span>
              </p>
            </div>
          </div>
          <span className="rounded-full bg-primary/20 px-3 py-1 text-[10px] font-bold uppercase text-primary border border-primary/30">
            Lọc theo vòng đấu cụ thể
          </span>
        </div>
      )}

      {/* Main Combined Ranking Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-sm space-y-2">
          <span className="animate-spin text-2xl">🌀</span>
          <p className="text-xs uppercase tracking-widest font-mono">Đang tính toán bảng xếp hạng...</p>
        </div>
      ) : !selectedTournament ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
          Vui lòng chọn giải đấu để xem bảng xếp hạng.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
            {rankings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm space-y-1">
                <p className="font-bold text-foreground">Chưa có kết quả trận đua nào được công bố.</p>
                <p className="text-xs text-muted-foreground">Bảng xếp hạng sẽ tự động cập nhật khi trọng tài công bố kết quả (PUBLISHED).</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                    <th className="px-5 py-3.5 text-center w-16">Hạng</th>
                    <th className="px-5 py-3.5">Chiến Mã</th>
                    <th className="px-5 py-3.5">Nài Ngựa Điều Khiển</th>
                    <th className="px-5 py-3.5 text-center w-28">Số Trận</th>
                    <th className="px-5 py-3.5 text-center w-32">Quán Quân</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {paginatedRankings.map((r) => (
                    <tr
                      key={r.horseId}
                      onClick={() => {
                        setModalHorseId(r.horseId);
                        setModalHorseData({ name: r.horseName, breed: r.breed });
                      }}
                      className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                        r.rank && r.rank <= 3 ? "bg-primary/[0.03]" : ""
                      }`}
                    >
                      {/* Hạng */}
                      <td className="px-5 py-4 text-center text-xl font-bold">{rankBadge(r.rank)}</td>

                      {/* Chiến Mã */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-10 rounded-xl overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center shadow-sm">
                            {r.avatar ? (
                              <Image src={r.avatar} alt={r.horseName || "Horse"} fill className="object-cover" />
                            ) : (
                              <span className="text-xl">🐎</span>
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-foreground hover:text-primary transition block">
                              {r.horseName ?? r.horseId}
                            </span>
                            <span className="text-[11px] text-muted-foreground block">
                              {r.breed || "Giống chưa rõ"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Jockey cưỡi */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="relative size-8 rounded-full overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center shadow-sm">
                            {r.jockeyAvatar ? (
                              <Image src={r.jockeyAvatar} alt={r.jockeyName || "Jockey"} fill className="object-cover" />
                            ) : (
                              <User className="size-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-foreground block">
                              {r.jockeyName || "Chưa phân công"}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              Nài ngựa cưỡi
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Số Trận */}
                      <td className="px-5 py-4 text-center font-mono font-bold text-sm text-muted-foreground">
                        {r.totalRaces}
                      </td>

                      {/* Quán Quân */}
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center gap-1 text-xs text-yellow-400 font-mono font-black bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-xl">
                          🏆 {r.wins}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {rankings.length > 10 && (
            <DataTablePagination
              currentPage={currentPage}
              totalItems={rankings.length}
              pageSize={10}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {/* Horse Detail Modal */}
      <HorseDetailModal
        horseId={modalHorseId}
        horseData={modalHorseData}
        isOpen={!!modalHorseId}
        onClose={() => setModalHorseId(null)}
      />
    </main>
  );
}
