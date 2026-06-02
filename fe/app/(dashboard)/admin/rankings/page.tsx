"use client";

import { useEffect, useState } from "react";
import { Medal, Trophy } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { rankingsApi, tournamentsApi, type RankingEntry, type JockeyRankingEntry, type TournamentItem } from "@/lib/api-client";

export default function AdminRankingsPage() {
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [horseRankings, setHorseRankings] = useState<RankingEntry[]>([]);
  const [jockeyRankings, setJockeyRankings] = useState<JockeyRankingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"horses" | "jockeys">("horses");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function loadTournaments() {
      try {
        const res = await tournamentsApi.list({ limit: 100 });
        setTournaments(res.data);
        if (res.data.length > 0) setSelectedTournament(res.data[0]._id);
      } catch {}
    }
    void loadTournaments();
  }, []);

  useEffect(() => {
    if (!selectedTournament) return;
    setLoading(true);
    Promise.all([
      rankingsApi.getHorseRankings(selectedTournament),
      rankingsApi.getJockeyRankings(selectedTournament),
    ]).then(([h, j]) => {
      setHorseRankings(h);
      setJockeyRankings(j);
    }).catch((e) => showToast(e.message, "err"))
      .finally(() => setLoading(false));
  }, [selectedTournament]);

  const rankBadge = (rank: number | undefined) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Ranking Management"
        title="Xem/Cập Nhật Ranking"
        description="Ranking được tính realtime từ race results đã PUBLISHED. Chọn giải đấu để xem bảng xếp hạng."
      />

      {toast && (
        <div className={`fixed top-6 right-6 z-50 rounded-xl border px-5 py-3 text-sm font-semibold shadow-2xl ${toast.type === "ok" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none"
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
        >
          <option value="">— Chọn Giải Đấu —</option>
          {tournaments.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>

        <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
          <button
            onClick={() => setActiveTab("horses")}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${activeTab === "horses" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}`}
          >
            🐎 Ngựa
          </button>
          <button
            onClick={() => setActiveTab("jockeys")}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${activeTab === "jockeys" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}`}
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
        <div className="rounded-2xl border border-white/10 bg-[#15151E]/85 overflow-hidden">
          {activeTab === "horses" ? (
            horseRankings.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Chưa có kết quả race nào được công bố.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Hạng</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Ngựa</th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Điểm</th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Races</th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Wins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {horseRankings.map((r) => (
                    <tr key={r.horseId} className={`hover:bg-white/[0.02] transition-colors ${r.rank && r.rank <= 3 ? "bg-primary/[0.03]" : ""}`}>
                      <td className="px-5 py-4 text-xl">{rankBadge(r.rank)}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-white">{r.horseName ?? r.horseId}</td>
                      <td className="px-5 py-4 text-center font-mono font-black text-primary text-lg">{r.totalPoints}</td>
                      <td className="px-5 py-4 text-center text-sm text-muted-foreground">{r.totalRaces}</td>
                      <td className="px-5 py-4 text-center text-sm text-emerald-400 font-bold">{r.wins}</td>
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
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Hạng</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Jockey</th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Điểm</th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Races</th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Wins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {jockeyRankings.map((r) => (
                    <tr key={r.jockeyUserId} className={`hover:bg-white/[0.02] transition-colors ${r.rank && r.rank <= 3 ? "bg-primary/[0.03]" : ""}`}>
                      <td className="px-5 py-4 text-xl">{rankBadge(r.rank)}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-white">{r.jockeyName ?? r.jockeyUserId}</td>
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
      )}
    </main>
  );
}
