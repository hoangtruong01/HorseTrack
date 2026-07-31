"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { rankingsApi, tournamentsApi, type RankingEntry, type JockeyRankingEntry, type TournamentItem } from "@/lib/api-client";
import { HorseDetailModal } from "@/components/horses/horse-detail-modal";

export default function AdminRankingsPage() {
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [horseRankings, setHorseRankings] = useState<RankingEntry[]>([]);
  const [jockeyRankings, setJockeyRankings] = useState<JockeyRankingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"horses" | "jockeys">("horses");

  // Selected horse modal state
  const [modalHorseId, setModalHorseId] = useState<string | null>(null);
  const [modalHorseData, setModalHorseData] = useState<{ name?: string; breed?: string } | null>(null);

  // Pagination state (10 items per page)
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadTournaments() {
      try {
        const res = await tournamentsApi.list({ limit: 100 });
        setTournaments(res.data);
        if (res.data.length > 0) setSelectedTournament(res.data[0]._id);
      } catch { }
    }
    void loadTournaments();
  }, []);

  useEffect(() => {
    if (!selectedTournament) return;
    setLoading(true);
    setCurrentPage(1);
    Promise.all([
      rankingsApi.getHorseRankings(selectedTournament),
      rankingsApi.getJockeyRankings(selectedTournament),
    ]).then(([h, j]) => {
      setHorseRankings(h);
      setJockeyRankings(j);
    }).catch((e) => toast.error((e as Error).message))
      .finally(() => setLoading(false));
  }, [selectedTournament]);

  const rankBadge = (rank: number | undefined) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const paginatedHorses = horseRankings.slice((currentPage - 1) * 10, currentPage * 10);
  const paginatedJockeys = jockeyRankings.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Ranking Management"
        title="Xem/Cập Nhật Ranking"
        description="Ranking được tính realtime từ race results đã PUBLISHED. Bấm vào tên chiến mã để xem hồ sơ và bảng vàng vô địch."
      />

      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none"
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
        >
          <option value="" className="bg-card text-foreground">— Chọn Giải Đấu —</option>
          {tournaments.map(t => <option key={t._id} value={t._id} className="bg-card text-foreground">{t.name}</option>)}
        </select>

        <div className="flex rounded-xl border border-border bg-muted p-1">
          <button
            onClick={() => {
              setActiveTab("horses");
              setCurrentPage(1);
            }}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${activeTab === "horses" ? "bg-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            🐎 Ngựa
          </button>
          <button
            onClick={() => {
              setActiveTab("jockeys");
              setCurrentPage(1);
            }}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${activeTab === "jockeys" ? "bg-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            🏇 Jockey
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Đang tính toán ranking...</div>
      ) : !selectedTournament ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Chọn giải đấu để xem ranking.</div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {activeTab === "horses" ? (
              horseRankings.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Chưa có kết quả race nào được công bố.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Hạng</th>
                      <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Ngựa</th>
                      <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Điểm</th>
                      <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Races</th>
                      <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Wins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedHorses.map((r) => (
                      <tr
                        key={r.horseId}
                        onClick={() => {
                          setModalHorseId(r.horseId);
                          setModalHorseData({ name: r.horseName, breed: r.breed });
                        }}
                        className={`cursor-pointer hover:bg-muted transition-colors ${r.rank && r.rank <= 3 ? "bg-primary/[0.03]" : ""}`}
                      >
                        <td className="px-5 py-4 text-xl">{rankBadge(r.rank)}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-foreground hover:text-primary transition">
                          {r.horseName ?? r.horseId}
                          <span className="block text-[10px] text-muted-foreground font-normal">Bấm xem hồ sơ & bảng vàng 🏆</span>
                        </td>
                        <td className="px-5 py-4 text-center font-mono font-black text-primary text-lg">{r.totalPoints}</td>
                        <td className="px-5 py-4 text-center text-sm text-muted-foreground">{r.totalRaces}</td>
                        <td className="px-5 py-4 text-center text-sm text-yellow-400 font-bold">🏆 {r.wins}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : (
              jockeyRankings.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Chưa có kết quả race nào được công bố.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Hạng</th>
                      <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Jockey</th>
                      <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Điểm</th>
                      <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Races</th>
                      <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Wins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedJockeys.map((r) => (
                      <tr key={r.jockeyUserId} className={`hover:bg-muted transition-colors ${r.rank && r.rank <= 3 ? "bg-primary/[0.03]" : ""}`}>
                        <td className="px-5 py-4 text-xl">{rankBadge(r.rank)}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-foreground">{r.jockeyName ?? r.jockeyUserId}</td>
                        <td className="px-5 py-4 text-center font-mono font-black text-primary text-lg">{r.totalPoints}</td>
                        <td className="px-5 py-4 text-center text-sm text-muted-foreground">{r.totalRaces}</td>
                        <td className="px-5 py-4 text-center text-sm text-emerald-400 font-bold">{r.wins}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>

          <DataTablePagination
            currentPage={currentPage}
            totalItems={activeTab === "horses" ? horseRankings.length : jockeyRankings.length}
            pageSize={10}
            onPageChange={setCurrentPage}
          />
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


