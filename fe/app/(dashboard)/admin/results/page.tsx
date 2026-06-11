"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ArrowLeft, Search, ChevronRight, Trophy } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

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
  status: "DRAFT" | "CONFIRMED" | "PUBLISHED" | "CANCELLED";
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
    status: string;
  };
}

interface RaceGroup {
  raceId: string;
  name: string;
  raceNumber: number;
  status: string;
  resultsStatus: "DRAFT" | "CONFIRMED" | "PUBLISHED" | "CANCELLED";
  results: RaceResultItem[];
}

export default function AdminResultsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [raceGroups, setRaceGroups] = useState<RaceGroup[]>([]);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Load all tournaments
  useEffect(() => {
    async function loadTournaments() {
      try {
        setIsLoadingTournaments(true);
        const res = await fetch("/api/admin/results");
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
      return;
    }

    const tId = selectedTournament.id;

    async function loadResults() {
      try {
        setIsLoadingResults(true);
        setError(null);
        const res = await fetch(`/api/admin/results?tournamentId=${tId}`);
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
                status: raceObj.status,
                resultsStatus: item.status,
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

  const filteredTournaments = tournaments.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate counts of races with results in different statuses across the loaded race groups
  const confirmedCount = raceGroups.filter((g) => g.resultsStatus === "CONFIRMED").length;
  const publishedCount = raceGroups.filter((g) => g.resultsStatus === "PUBLISHED").length;

  return (
    <main className="space-y-6 max-w-6xl mx-auto pb-12 px-4 sm:px-6">
      {!selectedTournament ? (
        <>
          <PageHeader
            eyebrow="Kết quả & Giải thưởng"
            title="Duyệt & Công Bố Kết Quả"
            description="Duyệt các lượt đua đã được trọng tài khóa kết quả và bấm nút Công bố để chia thưởng điểm và cập nhật bảng xếp hạng toàn hệ thống."
          />

          {/* Search Box */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm giải đấu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-black/25 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Tournaments Grid */}
          {isLoadingTournaments ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-40 rounded-2xl border border-border bg-card animate-pulse" />
              ))}
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="text-center py-12 border border-border bg-card rounded-2xl">
              <p className="text-muted-foreground text-sm">Không tìm thấy giải đấu nào phù hợp.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTournaments.map((t) => (
                <div
                  key={t.id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/30 hover:bg-[#1C1C25] transition duration-300 p-5 flex flex-col justify-between h-44"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-muted border border-border text-foreground/70">
                        {t.status}
                      </span>
                    </div>
                    <h3 className="font-black uppercase text-foreground group-hover:text-primary transition duration-300 leading-tight tracking-tight line-clamp-2">
                      {t.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      {t.description || "Không có mô tả chi tiết giải đấu."}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] font-mono text-muted-foreground/60 flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {t.startDate ? new Date(t.startDate).toLocaleDateString("vi-VN") : "N/A"}
                    </span>
                    <button
                      onClick={() => setSelectedTournament(t)}
                      className="text-xs font-bold uppercase tracking-wider text-foreground/80 group-hover:text-primary flex items-center gap-1 transition"
                    >
                      Duyệt Kết Quả <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Race Selection View */
        <div className="space-y-6">
          <Button
            onClick={() => setSelectedTournament(null)}
            variant="ghost"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground -ml-2 rounded-xl"
          >
            <ArrowLeft className="size-4 mr-2" /> Quay lại danh sách giải
          </Button>

          <PageHeader
            eyebrow={selectedTournament?.name || ""}
            title="Duyệt biên bản lượt đua"
            description="Xem trạng thái và thực hiện phê duyệt, xuất bản kết quả chính thức cho từng lượt đua."
          />

          {/* Quick Stats */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <Trophy className="size-5 text-primary" />
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-primary">
                Chờ công bố (Referee Confirmed)
              </p>
              <p className="mt-2 font-mono text-4xl font-black text-foreground">
                {confirmedCount}
              </p>
              <StatusBadge
                className="mt-3"
                label="Referee confirmed"
                tone="green"
                pulse={confirmedCount > 0}
              />
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                Đã công bố (Published)
              </p>
              <p className="mt-2 font-mono text-4xl font-black text-foreground">
                {publishedCount}
              </p>
              <StatusBadge className="mt-3" label="Public state" tone="teal" />
            </div>
          </section>

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
          ) : raceGroups.length === 0 ? (
            <div className="text-center py-12 border border-border bg-card rounded-2xl">
              <p className="text-muted-foreground text-sm">Chưa có lượt đua nào có kết quả được lập trong giải đấu này.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {raceGroups.map((group) => {
                const isConfirmed = group.resultsStatus === "CONFIRMED";
                const isPublished = group.resultsStatus === "PUBLISHED" || group.status === "RESULT_PUBLISHED";
                
                return (
                  <article
                    key={group.raceId}
                    className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <StatusBadge
                        label={
                          isPublished
                            ? "Published"
                            : isConfirmed
                              ? "Referee Confirmed"
                              : "Draft"
                        }
                        tone={
                          isPublished
                            ? "teal"
                            : isConfirmed
                              ? "green"
                              : "slate"
                        }
                        pulse={isConfirmed}
                      />
                      <h2 className="mt-3 text-2xl font-black uppercase text-foreground">
                        {group.name}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Trận #{group.raceNumber} · {group.results.length} chiến mã tham dự
                      </p>
                    </div>
                    <Button
                      asChild
                      variant={isConfirmed ? "default" : "outline"}
                      className="min-h-11 rounded-full font-black uppercase text-xs px-6"
                    >
                      <Link href={`/admin/results/${group.raceId}`}>
                        {isConfirmed ? "Duyệt & Công Bố ngay" : "Xem chi tiết"}
                      </Link>
                    </Button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
