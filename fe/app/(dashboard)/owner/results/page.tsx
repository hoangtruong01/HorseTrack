"use client";

import { useEffect, useState } from "react";
import { Flag, Calendar, Award, User, ArrowLeft, Siren, Timer, Search, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

interface Tournament {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: string;
}

interface RaceResultItem {
  id: string;
  rank?: number;
  finishTimeMs?: number;
  outcome: string;
  incident: string;
  points?: number;
  prizeAmount: number;
  note?: string;
  horseId?: {
    id: string;
    _id: string;
    name: string;
    breed?: string;
  };
  jockeyUserId?: {
    id: string;
    _id: string;
    fullName: string;
  };
  raceId: {
    id: string;
    _id: string;
    name: string;
    raceNumber: number;
  };
}

interface RaceGroup {
  raceId: string;
  name: string;
  raceNumber: number;
  results: RaceResultItem[];
}

export default function OwnerResultsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [results, setResults] = useState<RaceResultItem[]>([]);
  const [raceGroups, setRaceGroups] = useState<RaceGroup[]>([]);
  const [selectedRaceGroup, setSelectedRaceGroup] = useState<RaceGroup | null>(null);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Load all tournaments
  useEffect(() => {
    async function loadTournaments() {
      try {
        setIsLoadingTournaments(true);
        const res = await fetch("/api/owner/results");
        const resData = await res.json();
        if (res.ok && resData.success) {
          const fetchedTournaments = resData.data.tournaments || resData.data || [];
          setTournaments(fetchedTournaments);
        } else {
          setError(resData.message || "Không thể tải danh sách giải đấu.");
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi kết nối mạng.");
      } finally {
        setIsLoadingTournaments(false);
      }
    }
    loadTournaments();
  }, []);

  // Load results when tournament is selected
  useEffect(() => {
    if (!selectedTournament) {
      setResults([]);
      setRaceGroups([]);
      setSelectedRaceGroup(null);
      return;
    }

    const tId = selectedTournament.id;

    async function loadResults() {
      try {
        setIsLoadingResults(true);
        setError(null);
        const res = await fetch(`/api/owner/results?tournamentId=${tId}`);
        const resData = await res.json();
        if (res.ok && resData.success) {
          const rawResults: RaceResultItem[] = resData.data || [];
          setResults(rawResults);

          // Group by raceId
          const groups: Record<string, RaceGroup> = {};
          rawResults.forEach((item) => {
            const raceObj = item.raceId;
            if (!raceObj) return;
            const rId = raceObj.id || raceObj._id;
            if (!groups[rId]) {
              groups[rId] = {
                raceId: rId,
                name: raceObj.name,
                raceNumber: raceObj.raceNumber,
                results: [],
              };
            }
            groups[rId].results.push(item);
          });

          // Sort groups by raceNumber
          const sortedGroups = Object.values(groups).sort((a, b) => a.raceNumber - b.raceNumber);
          
          // Sort results within each group by rank
          sortedGroups.forEach((group) => {
            group.results.sort((a, b) => {
              const rA = a.rank ?? 999;
              const rB = b.rank ?? 999;
              return rA - rB;
            });
          });

          setRaceGroups(sortedGroups);
        } else {
          setError(resData.message || "Không thể tải kết quả thi đấu.");
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi kết nối mạng.");
      } finally {
        setIsLoadingResults(false);
      }
    }
    loadResults();
  }, [selectedTournament]);

  const formatTime = (ms?: number) => {
    if (!ms) return "—";
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(2);
    return `${minutes}:${seconds.padStart(5, "0")}`;
  };

  const filteredTournaments = tournaments.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12">
      {!selectedTournament ? (
        <>
          <PageHeader
            eyebrow="Theo dõi kết quả"
            title="Kết Quả Thi Đấu Chính Thức"
            description="Lựa chọn giải đấu để xem chi tiết biên bản xếp hạng cán đích, thời gian chạy và điểm số tích lũy của các chiến mã."
          />

          {/* Search Box */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm giải đấu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-primary transition"
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Tournaments Grid */}
          {isLoadingTournaments ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-40 rounded-2xl border border-white/5 bg-[#15151E] animate-pulse" />
              ))}
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="text-center py-12 border border-white/5 bg-[#15151E] rounded-2xl">
              <p className="text-muted-foreground text-sm">Không tìm thấy giải đấu nào phù hợp.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTournaments.map((t) => (
                <div
                  key={t.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#15151E] hover:border-primary/30 hover:bg-[#1C1C25] transition duration-300 p-5 flex flex-col justify-between h-44"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-white/5 border border-white/10 text-white/70">
                        {t.status}
                      </span>
                    </div>
                    <h3 className="font-black uppercase text-white group-hover:text-primary transition duration-300 leading-tight tracking-tight line-clamp-2">
                      {t.name}
                    </h3>
                    <p className="text-xs text-white/50 mt-2 line-clamp-2 leading-relaxed">
                      {t.description || "Không có mô tả chi tiết giải đấu."}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] font-mono text-white/40 flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {t.startDate ? new Date(t.startDate).toLocaleDateString("vi-VN") : "N/A"}
                    </span>
                    <button
                      onClick={() => setSelectedTournament(t)}
                      className="text-xs font-bold uppercase tracking-wider text-white/80 group-hover:text-primary flex items-center gap-1 transition"
                    >
                      Xem Kết Quả <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : !selectedRaceGroup ? (
        /* Race Selection View */
        <div className="space-y-6">
          <Button
            onClick={() => setSelectedTournament(null)}
            variant="ghost"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white -ml-2 rounded-xl"
          >
            <ArrowLeft className="size-4 mr-2" /> Quay lại danh sách giải
          </Button>

          <PageHeader
            eyebrow={selectedTournament?.name || ""}
            title="Danh Sách Trận Đua Đã Kết Thúc"
            description="Chi tiết kết quả của từng lượt đua trong khuôn khổ giải đấu."
          />

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {isLoadingResults ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {[1, 2].map((n) => (
                <div key={n} className="h-48 rounded-2xl border border-white/5 bg-[#15151E] animate-pulse" />
              ))}
            </div>
          ) : raceGroups.length === 0 ? (
            <div className="text-center py-12 border border-white/5 bg-[#15151E] rounded-2xl">
              <p className="text-muted-foreground text-sm">Chưa có trận đua nào được công bố kết quả trong giải đấu này.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {raceGroups.map((group) => {
                const winner = group.results.find((r) => r.rank === 1);
                const runnerUp = group.results.find((r) => r.rank === 2);
                return (
                  <div
                    key={group.raceId}
                    className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#15151E] hover:border-primary/20 transition duration-300 p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-primary font-black uppercase tracking-wider">
                          Trận #{group.raceNumber}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full">
                          ● ĐÃ CÔNG BỐ
                        </span>
                      </div>
                      <h3 className="text-lg font-black uppercase text-white group-hover:text-primary transition duration-300">
                        {group.name}
                      </h3>
                    </div>

                    {/* Podium Preview */}
                    <div className="grid grid-cols-2 gap-2 bg-black/25 rounded-xl p-3 border border-white/5 text-xs">
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-primary font-bold">🏆 Vô Địch</span>
                        <span className="font-bold text-white text-[11px] block truncate mt-0.5">
                          {winner?.horseId?.name || "—"}
                        </span>
                        <span className="text-[9px] text-white/50 block truncate">
                          Nài: {winner?.jockeyUserId?.fullName || "—"}
                        </span>
                      </div>
                      <div className="border-l border-white/5 pl-3">
                        <span className="block text-[8px] uppercase tracking-wider text-white/50 font-bold">Hạng 2</span>
                        <span className="font-bold text-white text-[11px] block truncate mt-0.5">
                          {runnerUp?.horseId?.name || "—"}
                        </span>
                        <span className="text-[9px] text-white/50 block truncate">
                          Nài: {runnerUp?.jockeyUserId?.fullName || "—"}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => setSelectedRaceGroup(group)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 text-white hover:bg-primary hover:text-white transition duration-300 text-xs font-black uppercase tracking-wider"
                    >
                      Xem Bảng Điểm Chi Tiết
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Detailed Table Result View */
        <div className="space-y-6">
          <Button
            onClick={() => setSelectedRaceGroup(null)}
            variant="ghost"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white -ml-2 rounded-xl"
          >
            <ArrowLeft className="size-4 mr-2" /> Quay lại danh sách trận đua
          </Button>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#15151E] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px]" />
              <div className="space-y-2">
                <span className="text-[10px] text-primary font-black uppercase tracking-wider">
                  Trận #{selectedRaceGroup.raceNumber} · {selectedTournament?.name || ""}
                </span>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                  {selectedRaceGroup.name}
                </h2>
              </div>
            </div>

            {/* Results Table */}
            <div className="rounded-2xl border border-white/5 bg-[#13131A] overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-muted-foreground font-black uppercase tracking-wider">
                    <th className="p-4 w-16 text-center">Hạng</th>
                    <th className="p-4">Chiến Mã</th>
                    <th className="p-4">Giống Ngựa</th>
                    <th className="p-4">Nài Ngựa</th>
                    <th className="p-4">
                      <span className="flex items-center gap-1">
                        <Timer className="size-3.5 text-primary" /> Thời gian
                      </span>
                    </th>
                    <th className="p-4">
                      <span className="flex items-center gap-1">
                        <Siren className="size-3.5 text-primary" /> Lỗi / Sự cố
                      </span>
                    </th>
                    <th className="p-4 text-right">Điểm Tích Lũy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {selectedRaceGroup.results.map((res) => (
                    <tr key={res.id} className="hover:bg-white/[0.01] transition duration-200">
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center size-6 rounded-full font-black text-xs ${
                            res.rank === 1
                              ? "bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.3)]"
                              : res.rank === 2
                              ? "bg-slate-300 text-black"
                              : res.rank === 3
                              ? "bg-[#CD7F32] text-white"
                              : "bg-white/5 border border-white/10 text-muted-foreground"
                          }`}
                        >
                          {res.rank || "—"}
                        </span>
                      </td>
                      <td className="p-4 font-black text-white">{res.horseId?.name || "Chiến mã ẩn"}</td>
                      <td className="p-4 text-muted-foreground">{res.horseId?.breed || "Chưa xác định"}</td>
                      <td className="p-4 font-bold text-white">{res.jockeyUserId?.fullName || "Nài ngựa ẩn"}</td>
                      <td className="p-4 font-mono font-black text-white text-sm">
                        {res.outcome === "finished" ? formatTime(res.finishTimeMs) : "Không hoàn thành"}
                      </td>
                      <td className={`p-4 ${res.incident !== "NONE" ? "text-primary font-bold" : "text-muted-foreground"}`}>
                        {res.note || (res.incident !== "NONE" ? res.incident : "Không")}
                      </td>
                      <td className="p-4 text-right font-black text-teal-400 text-sm">
                        +{res.points || 0} Pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
