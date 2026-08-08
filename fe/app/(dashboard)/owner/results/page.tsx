"use client";

/**
 * ====================================================================
 * CHỨC NĂNG: KẾT QUẢ THI ĐẤU CỦA NGỰA (RACE RESULTS)
 * QUYỀN SỬ DỤNG: OWNER
 * MÔ TẢ:
 * - Xem thành tích, bảng xếp hạng về đích của các ngựa thuộc sở hữu của mình.
 * ====================================================================
 */

import { useEffect, useState } from "react";
import { Calendar, ArrowLeft, Siren, Timer, Search, ChevronRight, Filter, RotateCcw, Trophy, Flag } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

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
  const [raceGroups, setRaceGroups] = useState<RaceGroup[]>([]);
  const [selectedRaceGroup, setSelectedRaceGroup] = useState<RaceGroup | null>(null);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [tournamentSortBy, setTournamentSortBy] = useState("newest");

  // Race level filter
  const [raceSearch, setRaceSearch] = useState("");

  // Detailed result level filter
  const [resultSearch, setResultSearch] = useState("");
  const [rankFilter, setRankFilter] = useState("ALL");
  const [resultSortBy, setResultSortBy] = useState("rank_asc");

  const [error, setError] = useState<string | null>(null);

  // Pagination state (10 items per page)
  const [currentPage, setCurrentPage] = useState(1);

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
      setRaceGroups([]);
      setSelectedRaceGroup(null);
      return;
    }

    const tId = selectedTournament.id;
    setCurrentPage(1);

    async function loadResults() {
      try {
        setIsLoadingResults(true);
        setError(null);
        const res = await fetch(`/api/owner/results?tournamentId=${tId}`);
        const resData = await res.json();
        if (res.ok && resData.success) {
          const rawResults: RaceResultItem[] = resData.data || [];

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

          setRaceGroups(Object.values(groups));
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

  // Filter & Sort Tournaments
  const filteredTournaments = tournaments
    .filter((t) => {
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (searchTerm && !t.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (tournamentSortBy === "name_asc") return a.name.localeCompare(b.name);
      if (tournamentSortBy === "oldest") {
        return new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime();
      }
      return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime();
    });

  // Filter & Sort Race Groups
  const filteredRaceGroups = raceGroups.filter((g) => {
    if (!raceSearch) return true;
    const q = raceSearch.toLowerCase();
    return g.name.toLowerCase().includes(q) || g.raceNumber.toString().includes(q);
  });

  // Filter & Sort Detailed Race Results
  const filteredDetailedResults = (selectedRaceGroup?.results || [])
    .filter((res) => {
      if (rankFilter === "top1" && res.rank !== 1) return false;
      if (rankFilter === "top3" && (!res.rank || res.rank > 3)) return false;
      if (rankFilter === "finished" && res.outcome !== "finished") return false;
      if (rankFilter === "incident" && res.incident === "NONE" && res.outcome === "finished") return false;

      if (resultSearch) {
        const q = resultSearch.toLowerCase();
        const match = (res.horseId?.name || "").toLowerCase().includes(q)
          || (res.horseId?.breed || "").toLowerCase().includes(q)
          || (res.jockeyUserId?.fullName || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (resultSortBy === "time_asc") {
        return (a.finishTimeMs || 99999999) - (b.finishTimeMs || 99999999);
      }
      if (resultSortBy === "points_desc") {
        return (b.points || 0) - (a.points || 0);
      }
      return (a.rank || 99) - (b.rank || 99);
    });

  const resetTournamentFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setTournamentSortBy("newest");
  };

  const resetDetailedFilters = () => {
    setResultSearch("");
    setRankFilter("ALL");
    setResultSortBy("rank_asc");
  };

  const isTournamentFilterActive = searchTerm !== "" || statusFilter !== "ALL" || tournamentSortBy !== "newest";
  const isDetailedFilterActive = resultSearch !== "" || rankFilter !== "ALL" || resultSortBy !== "rank_asc";

  const formatTime = (timeMs?: number) => {
    if (!timeMs) return "—";
    const totalSeconds = timeMs / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(2);
    return `${minutes}:${seconds.padStart(5, "0")}`;
  };

  const paginatedTournaments = filteredTournaments.slice((currentPage - 1) * 10, currentPage * 10);
  const paginatedRaceGroups = filteredRaceGroups.slice((currentPage - 1) * 10, currentPage * 10);
  const paginatedDetailedResults = filteredDetailedResults.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12">
      {!selectedTournament ? (
        /* Tournament List View */
        <div className="space-y-6">
          <PageHeader
            eyebrow="Kết Quả Đã Công Bố"
            title="Lịch Sử Kết Quả Giải Đấu"
            description="Xem chi tiết thứ hạng, điểm tích lũy và bảng điểm cán đích của chiến mã theo từng giải đấu."
          />

          {/* Tournament Filter Bar */}
          <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-border/50">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-foreground">
                <Filter className="size-4 text-primary" />
                Bộ lọc giải đấu
              </div>
              {isTournamentFilterActive && (
                <Button
                  onClick={resetTournamentFilters}
                  variant="ghost"
                  className="h-7 px-2.5 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg cursor-pointer"
                >
                  <RotateCcw className="size-3 mr-1" /> Đặt lại bộ lọc
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm kiếm giải đấu..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-9 rounded-xl border border-border bg-muted/40 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-9 rounded-xl border border-border bg-muted/40 px-3 text-xs text-foreground outline-none focus:border-primary/50 cursor-pointer"
                >
                  <option value="ALL" className="bg-card">Trạng thái: Tất cả</option>
                  <option value="COMPLETED" className="bg-card">Đã kết thúc</option>
                  <option value="ONGOING" className="bg-card">Đang diễn ra</option>
                  <option value="UPCOMING" className="bg-card">Sắp diễn ra</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="relative">
                <select
                  value={tournamentSortBy}
                  onChange={(e) => setTournamentSortBy(e.target.value)}
                  className="w-full h-9 rounded-xl border border-border bg-muted/40 px-3 text-xs text-foreground outline-none focus:border-primary/50 cursor-pointer"
                >
                  <option value="newest" className="bg-card">Sắp xếp: Mới nhất</option>
                  <option value="oldest" className="bg-card">Sắp xếp: Cũ nhất</option>
                  <option value="name_asc" className="bg-card">Tên giải đấu (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {isLoadingTournaments ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-36 rounded-2xl border border-border bg-card animate-pulse" />
              ))}
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="text-center py-12 border border-border bg-card rounded-2xl">
              <p className="text-muted-foreground text-sm">
                {tournaments.length === 0 ? "Chưa có dữ liệu giải đấu nào có kết quả công bố." : "Không tìm thấy giải đấu phù hợp bộ lọc."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedTournaments.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTournament(t);
                      setCurrentPage(1);
                    }}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/30 transition duration-300 p-5 flex flex-col justify-between space-y-4 cursor-pointer shadow-sm hover:shadow-xl"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary rounded-full">
                          <Calendar className="size-3" /> {t.status === "COMPLETED" ? "ĐÃ KẾT THÚC" : t.status === "ONGOING" ? "ĐANG DIỄN RA" : "SẮP DIỄN RA"}
                        </span>
                      </div>
                      <h3 className="text-base font-black uppercase text-foreground group-hover:text-primary transition duration-300 line-clamp-2">
                        {t.name}
                      </h3>
                      {t.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs font-bold text-primary">
                      <span>Xem Kết Quả Chi Tiết</span>
                      <ChevronRight className="size-4 group-hover:translate-x-1 transition duration-300" />
                    </div>
                  </div>
                ))}
              </div>

              <DataTablePagination
                currentPage={currentPage}
                totalItems={filteredTournaments.length}
                pageSize={10}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      ) : !selectedRaceGroup ? (
        /* Race List in Tournament */
        <div className="space-y-6">
          <Button
            onClick={() => {
              setSelectedTournament(null);
              setCurrentPage(1);
            }}
            variant="ghost"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground -ml-2 rounded-xl cursor-pointer"
          >
            <ArrowLeft className="size-4 mr-2" /> Quay lại danh sách giải
          </Button>

          <PageHeader
            eyebrow={selectedTournament?.name || ""}
            title="Danh Sách Trận Đua Đã Kết Thúc"
            description="Chi tiết kết quả của từng lượt đua trong khuôn khổ giải đấu."
          />

          {/* Search Race */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm chặng / trận đua..."
              value={raceSearch}
              onChange={(e) => {
                setRaceSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 rounded-xl border border-border bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {isLoadingResults ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {[1, 2].map((n) => (
                <div key={n} className="h-48 rounded-2xl border border-border bg-card animate-pulse" />
              ))}
            </div>
          ) : filteredRaceGroups.length === 0 ? (
            <div className="text-center py-12 border border-border bg-card rounded-2xl">
              <p className="text-muted-foreground text-sm">
                {raceGroups.length === 0 ? "Chưa có trận đua nào được công bố kết quả trong giải đấu này." : "Không tìm thấy trận đua phù hợp."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-6 sm:grid-cols-2">
                {paginatedRaceGroups.map((group) => {
                  const winner = group.results.find((r) => r.rank === 1);
                  const runnerUp = group.results.find((r) => r.rank === 2);
                  return (
                    <div
                      key={group.raceId}
                      className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/20 transition duration-300 p-5 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-primary font-black uppercase tracking-wider">
                            Trận #{group.raceNumber}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 rounded-full">
                            ● ĐÃ CÔNG BỐ
                          </span>
                        </div>
                        <h3 className="text-lg font-black uppercase text-foreground group-hover:text-primary transition duration-300">
                          {group.name}
                        </h3>
                      </div>

                      {/* Podium Preview */}
                      <div className="grid grid-cols-2 gap-2 bg-muted/40 rounded-xl p-3 border border-border text-xs">
                        <div>
                          <span className="block text-[8px] uppercase tracking-wider text-primary font-bold">🏆 Vô Địch</span>
                          <span className="font-bold text-foreground text-[11px] block truncate mt-0.5">
                            {winner?.horseId?.name || "—"}
                          </span>
                          <span className="text-[9px] text-muted-foreground block truncate">
                            Nài: {winner?.jockeyUserId?.fullName || "—"}
                          </span>
                        </div>
                        <div className="border-l border-border pl-3">
                          <span className="block text-[8px] uppercase tracking-wider text-muted-foreground font-bold">Hạng 2</span>
                          <span className="font-bold text-foreground text-[11px] block truncate mt-0.5">
                            {runnerUp?.horseId?.name || "—"}
                          </span>
                          <span className="text-[9px] text-muted-foreground block truncate">
                            Nài: {runnerUp?.jockeyUserId?.fullName || "—"}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          setSelectedRaceGroup(group);
                          setCurrentPage(1);
                        }}
                        className="w-full rounded-xl bg-muted border border-border text-foreground hover:bg-primary hover:text-foreground transition duration-300 text-xs font-black uppercase tracking-wider cursor-pointer"
                      >
                        Xem Bảng Điểm Chi Tiết
                      </Button>
                    </div>
                  );
                })}
              </div>

              <DataTablePagination
                currentPage={currentPage}
                totalItems={filteredRaceGroups.length}
                pageSize={10}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      ) : (
        /* Detailed Table Result View */
        <div className="space-y-6">
          <Button
            onClick={() => {
              setSelectedRaceGroup(null);
              setCurrentPage(1);
            }}
            variant="ghost"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground -ml-2 rounded-xl cursor-pointer"
          >
            <ArrowLeft className="size-4 mr-2" /> Quay lại danh sách trận đua
          </Button>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px]" />
              <div className="space-y-2">
                <span className="text-[10px] text-primary font-black uppercase tracking-wider">
                  Trận #{selectedRaceGroup.raceNumber} · {selectedTournament?.name || ""}
                </span>
                <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
                  {selectedRaceGroup.name}
                </h2>
              </div>
            </div>

            {/* Detailed Filter Bar */}
            <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-border/50">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-foreground">
                  <Filter className="size-4 text-primary" />
                  Bộ lọc chi tiết bảng điểm
                </div>
                {isDetailedFilterActive && (
                  <Button
                    onClick={resetDetailedFilters}
                    variant="ghost"
                    className="h-7 px-2.5 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg cursor-pointer"
                  >
                    <RotateCcw className="size-3 mr-1" /> Đặt lại bộ lọc
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Tìm tên ngựa, nài, giống..."
                    value={resultSearch}
                    onChange={(e) => {
                      setResultSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-9 rounded-xl border border-border bg-muted/40 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                  />
                </div>

                {/* Rank Filter */}
                <div className="relative">
                  <select
                    value={rankFilter}
                    onChange={(e) => {
                      setRankFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-9 rounded-xl border border-border bg-muted/40 px-3 text-xs text-foreground outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="ALL" className="bg-card">Kết quả: Tất cả</option>
                    <option value="top1" className="bg-card">🏆 Vô địch (Hạng 1)</option>
                    <option value="top3" className="bg-card">🥇 Top 3 cán đích</option>
                    <option value="finished" className="bg-card">Cán đích hợp lệ (Finished)</option>
                    <option value="incident" className="bg-card">Có sự cố / Phạm quy / DNF</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="relative">
                  <select
                    value={resultSortBy}
                    onChange={(e) => setResultSortBy(e.target.value)}
                    className="w-full h-9 rounded-xl border border-border bg-muted/40 px-3 text-xs text-foreground outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="rank_asc" className="bg-card">Thứ hạng (1 ➔ N)</option>
                    <option value="time_asc" className="bg-card">Thời gian thi đấu (Nhanh ➔ Chậm)</option>
                    <option value="points_desc" className="bg-card">Điểm tích lũy (Cao ➔ Thấp)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl space-y-4">
              {filteredDetailedResults.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="font-bold text-sm">Không tìm thấy kết quả phù hợp bộ lọc</p>
                </div>
              ) : (
                <>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-muted-foreground font-black uppercase tracking-wider">
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
                    <tbody className="divide-y divide-border">
                      {paginatedDetailedResults.map((res) => (
                        <tr key={res.id} className="hover:bg-muted/30 transition duration-200">
                          <td className="p-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center size-6 rounded-full font-black text-xs ${
                                res.rank === 1
                                  ? "bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.3)]"
                                  : res.rank === 2
                                  ? "bg-slate-300 text-black"
                                  : res.rank === 3
                                  ? "bg-[#CD7F32] text-foreground"
                                  : "bg-muted border border-border text-muted-foreground"
                              }`}
                            >
                              {res.rank || "—"}
                            </span>
                          </td>
                          <td className="p-4 font-black text-foreground">{res.horseId?.name || "Chiến mã ẩn"}</td>
                          <td className="p-4 text-muted-foreground">{res.horseId?.breed || "Chưa xác định"}</td>
                          <td className="p-4 font-bold text-foreground">{res.jockeyUserId?.fullName || "Nài ngựa ẩn"}</td>
                          <td className="p-4 font-mono font-black text-foreground text-sm">
                            {res.outcome === "finished" ? formatTime(res.finishTimeMs) : "Không hoàn thành"}
                          </td>
                          <td className={`p-4 ${res.incident !== "NONE" ? "text-primary font-bold" : "text-muted-foreground"}`}>
                            {res.note || (res.incident !== "NONE" ? res.incident : "Không")}
                          </td>
                          <td className="p-4 text-right font-black text-teal-600 dark:text-teal-400 text-sm">
                            +{res.points || 0} điểm
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <DataTablePagination
                    currentPage={currentPage}
                    totalItems={filteredDetailedResults.length}
                    pageSize={10}
                    onPageChange={setCurrentPage}
                    className="px-4 pb-4"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
