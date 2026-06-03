"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { rankingsApi, tournamentsApi, type RankingEntry, type JockeyRankingEntry, type TournamentItem } from "@/lib/api-client";

export default function AdminRankingsPage() {
  const { t } = useTranslation();
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
      } catch {
        /* ignore */
      }
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
    }).catch((e: unknown) => {
      showToast(e instanceof Error ? e.message : t("pages.admin.common.loadError"), "err");
    })
      .finally(() => setLoading(false));
  }, [selectedTournament, t]);

  const rankBadge = (rank: number | undefined) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const tableHead = (cols: string[]) => (
    <thead>
      <tr className="border-b dark:border-white/10 border-border">
        {cols.map((col) => (
          <th key={col} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground first:text-left [&:not(:first-child)]:text-center">
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );

  return (
    <main className="space-y-6">

      {toast && (
        <div className={`fixed top-6 right-6 z-50 rounded-xl border px-5 py-3 text-sm font-semibold shadow-2xl ${toast.type === "ok" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50 px-4 py-2.5 text-sm dark:text-white text-foreground focus:border-primary/50 focus:outline-none"
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
        >
          <option value="">{t("pages.admin.rankings.selectTournament")}</option>
          {tournaments.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
        </select>

        <div className="flex rounded-xl border dark:border-white/10 border-border dark:bg-white/[0.03] bg-muted/50 p-1">
          <button
            onClick={() => setActiveTab("horses")}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${activeTab === "horses" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground dark:hover:text-white"}`}
          >
            🐎 {t("pages.admin.rankings.tabHorses")}
          </button>
          <button
            onClick={() => setActiveTab("jockeys")}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${activeTab === "jockeys" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground dark:hover:text-white"}`}
          >
            🏇 {t("pages.admin.rankings.tabJockeys")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">{t("pages.admin.rankings.loading")}</div>
      ) : !selectedTournament ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">{t("pages.admin.rankings.selectPrompt")}</div>
      ) : (
        <div className="rounded-2xl border dark:border-white/10 border-border dark:bg-[#15151E]/85 bg-card overflow-hidden">
          {activeTab === "horses" ? (
            horseRankings.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">{t("pages.admin.rankings.empty")}</div>
            ) : (
              <table className="w-full">
                {tableHead([
                  t("pages.admin.rankings.colRank"),
                  t("pages.admin.rankings.colHorse"),
                  t("pages.admin.rankings.colPoints"),
                  t("pages.admin.rankings.colRaces"),
                  t("pages.admin.rankings.colWins"),
                ])}
                <tbody className="divide-y divide-white/5">
                  {horseRankings.map((r) => (
                    <tr key={r.horseId} className={`hover:dark:bg-white/[0.02] bg-muted/50 transition-colors ${r.rank && r.rank <= 3 ? "bg-primary/[0.03]" : ""}`}>
                      <td className="px-5 py-4 text-xl">{rankBadge(r.rank)}</td>
                      <td className="px-5 py-4 text-sm font-semibold dark:text-white text-foreground">{r.horseName ?? r.horseId}</td>
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
              <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">{t("pages.admin.rankings.empty")}</div>
            ) : (
              <table className="w-full">
                {tableHead([
                  t("pages.admin.rankings.colRank"),
                  t("pages.admin.rankings.colJockey"),
                  t("pages.admin.rankings.colPoints"),
                  t("pages.admin.rankings.colRaces"),
                  t("pages.admin.rankings.colWins"),
                ])}
                <tbody className="divide-y divide-white/5">
                  {jockeyRankings.map((r) => (
                    <tr key={r.jockeyUserId} className={`hover:dark:bg-white/[0.02] bg-muted/50 transition-colors ${r.rank && r.rank <= 3 ? "bg-primary/[0.03]" : ""}`}>
                      <td className="px-5 py-4 text-xl">{rankBadge(r.rank)}</td>
                      <td className="px-5 py-4 text-sm font-semibold dark:text-white text-foreground">{r.jockeyName ?? r.jockeyUserId}</td>
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
