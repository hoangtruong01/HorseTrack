"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  PlusCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { toast } from "sonner";

// Types
type RaceInfo = {
  _id: string;
  name: string;
  startTime: string;
  status: string;
};

type Assignment = {
  _id: string;
  raceId: RaceInfo;
  status: string;
};

type RefereeReport = {
  _id: string;
  raceId: {
    _id: string;
    name: string;
  };
  refereeId: {
    _id: string;
    fullName: string;
  };
  horseId?: {
    _id: string;
    name: string;
  };
  type: "PRE_RACE" | "POST_RACE";
  description: string;
  violation?: string;
  penalty?: string;
  createdAt: string;
};

type RaceCheck = {
  _id: string;
  horseId: {
    _id: string;
    name: string;
  };
};

export default function RefereeReportsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [reports, setReports] = useState<Record<string, RefereeReport[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expanded race IDs for viewing reports
  const [expandedRaces, setExpandedRaces] = useState<Record<string, boolean>>({});

  // Form states
  const [selectedRaceId, setSelectedRaceId] = useState("");
  const [horsesForSelectedRace, setHorsesForSelectedRace] = useState<RaceCheck[]>([]);
  const [selectedHorseId, setSelectedHorseId] = useState("");
  const [reportType, setReportType] = useState<"PRE_RACE" | "POST_RACE">("POST_RACE");
  const [description, setDescription] = useState("");
  const [violation, setViolation] = useState("");
  const [penalty, setPenalty] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all accepted assignments for this referee
      const res = await fetch("/api/referee/referee-assignments/my-assignments?limit=100");
      if (!res.ok) throw new Error("Không thể tải danh sách cuộc đua");
      const resData = await res.json();
      const rawData = resData.data;
      const rawArray = Array.isArray(rawData) ? rawData : (rawData?.data || []);
      const myAssignments = rawArray.filter(
        (a: Assignment) => a.status === "accepted" && a.raceId
      );
      setAssignments(myAssignments);

      // 2. Fetch reports for each race in parallel
      const reportsMap: Record<string, RefereeReport[]> = {};
      await Promise.all(
        myAssignments.map(async (a: Assignment) => {
          const rId = a.raceId._id || (a.raceId as any).id;
          const repRes = await fetch(`/api/referee/referee-reports/race/${rId}`);
          if (repRes.ok) {
            const repData = await repRes.json();
            reportsMap[rId] = repData.data || [];
          }
        })
      );
      setReports(reportsMap);
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Lỗi tải danh sách cuộc đua.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch horses when selected race changes in create report form
  useEffect(() => {
    if (!selectedRaceId) {
      setHorsesForSelectedRace([]);
      return;
    }

    const fetchHorses = async () => {
      try {
        const res = await fetch(`/api/referee/race-checks/race/${selectedRaceId}`);
        if (res.ok) {
          const resData = await res.json();
          setHorsesForSelectedRace(resData.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHorses();
  }, [selectedRaceId]);

  const toggleExpand = (raceId: string) => {
    setExpandedRaces((prev) => ({
      ...prev,
      [raceId]: !prev[raceId],
    }));
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRaceId) {
      toast.error("Vui lòng chọn cuộc đua");
      return;
    }
    if (!description.trim()) {
      toast.error("Vui lòng nhập mô tả biên bản");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        raceId: selectedRaceId,
        horseId: selectedHorseId || undefined,
        type: reportType,
        description,
        violation: violation || undefined,
        penalty: penalty || undefined,
      };

      const res = await fetch("/api/referee/referee-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Lập biên bản thất bại");
      }

      toast.success("Lập biên bản thi đấu chính thức thành công!");
      // Reset form
      setSelectedRaceId("");
      setSelectedHorseId("");
      setReportType("POST_RACE");
      setDescription("");
      setViolation("");
      setPenalty("");

      // Reload
      await fetchData();
    } catch (err) {
      toast.error((err as Error).message || "Lỗi khi gửi biên bản.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <PageHeader
        eyebrow="Tư liệu chính thức"
        title="Biên Bản Thi Đấu (Referee Reports)"
        description="Lập biên bản ghi nhận diễn biến trước trận (PRE_RACE) hoặc sự cố vi phạm thực tế sau trận (POST_RACE) để lưu vết lịch sử hệ thống."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
        {/* Reports Create Form */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <PlusCircle className="size-4 text-primary" />
            Lập biên bản thi đấu mới
          </h3>

          <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Chọn cuộc đua phân công</label>
                <select
                  value={selectedRaceId}
                  onChange={(e) => setSelectedRaceId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  required
                >
                  <option value="" className="bg-card">-- Chọn cuộc đua giám sát --</option>
                  {assignments.map((a) => {
                    const rId = a.raceId?._id || (a.raceId as any)?.id;
                    const aId = a._id || (a as any).id || rId;
                    return (
                      <option key={aId} value={rId || ""} className="bg-card">
                        {a.raceId?.name} ({a.raceId?.status})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Phân loại biên bản</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as "PRE_RACE" | "POST_RACE")}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="POST_RACE" className="bg-card">Biên bản sau trận (POST_RACE)</option>
                  <option value="PRE_RACE" className="bg-card">Biên bản trước trận (PRE_RACE)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Chiến mã liên quan (Tùy chọn)</label>
                <select
                  value={selectedHorseId}
                  onChange={(e) => setSelectedHorseId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  disabled={!selectedRaceId}
                >
                  <option value="" className="bg-card">-- Tất cả / Không chọn --</option>
                  {horsesForSelectedRace.map((h) => {
                    const horseId = h.horseId?._id || (h.horseId as any)?.id;
                    const hId = h._id || (h as any).id || horseId;
                    return (
                      <option key={hId} value={horseId || ""} className="bg-card">
                        {h.horseId?.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Sự cố vi phạm (Tùy chọn)</label>
                <input
                  type="text"
                  value={violation}
                  onChange={(e) => setViolation(e.target.value)}
                  placeholder="Ví dụ: Lấn làn đối thủ"
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Hình phạt đề xuất (Tùy chọn)</label>
                <input
                  type="text"
                  value={penalty}
                  onChange={(e) => setPenalty(e.target.value)}
                  placeholder="Ví dụ: Cộng 3 giây"
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Nội dung biên bản chi tiết</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ghi nhận tổng quan về diễn biến cuộc đua, các quyết định điều khiển hoặc kiến nghị xử lý..."
                rows={4}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                required
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || !selectedRaceId}
                className="rounded-full bg-primary hover:bg-primary-dark font-black uppercase text-xs h-10 px-6 text-white"
              >
                {isSubmitting ? "Đang gửi..." : "Ký & Gửi biên bản"}
              </Button>
            </div>
          </form>
        </section>

        {/* Reports Queue List */}
        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
            Hồ sơ biên bản theo cuộc đua ({assignments.length})
          </h3>

          {assignments.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-muted/30 text-muted-foreground text-xs">
              Bạn chưa chấp nhận giám sát cuộc đua nào nên chưa có biên bản lưu trữ.
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => {
                if (!assignment.raceId) return null;
                const raceId = assignment.raceId._id || (assignment.raceId as any).id;
                const raceReports = reports[raceId] || [];
                const isExpanded = expandedRaces[raceId] || false;
                const assignmentId = assignment._id || (assignment as any).id || raceId;

                return (
                  <article
                    key={assignmentId}
                    className="rounded-xl border border-border bg-card/95 shadow overflow-hidden"
                  >
                    {/* Header bar click to toggle expansion */}
                    <div
                      onClick={() => toggleExpand(raceId)}
                      className="p-4 flex items-center justify-between cursor-pointer bg-muted/50 hover:bg-muted transition select-none"
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black uppercase text-foreground leading-tight">
                          {assignment.raceId.name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">
                          Biên bản lưu vết: <strong className="text-teal-400">{raceReports.length} bản</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground uppercase font-black">
                          {assignment.raceId.status}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Reports List for this race */}
                    {isExpanded && (
                      <div className="p-4 border-t border-border space-y-4 bg-muted/40">
                        {raceReports.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic py-2">
                            Cuộc đua này chưa có biên bản nào được lập.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {raceReports.map((rep) => (
                              <div
                                key={rep._id}
                                className="p-3.5 rounded-lg border border-border bg-card space-y-2 text-xs"
                              >
                                <div className="flex justify-between items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                    rep.type === "PRE_RACE" 
                                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" 
                                      : "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                                  }`}>
                                    {rep.type === "PRE_RACE" ? "TRƯỚC TRẬN" : "SAU TRẬN"}
                                  </span>
                                  <span className="text-[9px] text-muted-foreground">
                                    {new Date(rep.createdAt).toLocaleString("vi-VN")}
                                  </span>
                                </div>

                                {rep.horseId && (
                                  <p className="text-[10px] font-bold text-foreground">
                                    Chiến mã liên quan: <span className="text-teal-400 font-bold uppercase">{rep.horseId.name}</span>
                                  </p>
                                )}

                                <p className="text-foreground leading-relaxed font-medium">
                                  {rep.description}
                                </p>

                                {(rep.violation || rep.penalty) && (
                                  <div className="mt-2 grid grid-cols-2 gap-2 p-2 rounded bg-muted/50 text-[10px]">
                                    {rep.violation && (
                                      <p className="text-muted-foreground">
                                        Lỗi vi phạm: <strong className="text-yellow-400 font-bold">{rep.violation}</strong>
                                      </p>
                                    )}
                                    {rep.penalty && (
                                      <p className="text-muted-foreground">
                                        Hình phạt: <strong className="text-red-400 font-bold">{rep.penalty}</strong>
                                      </p>
                                    )}
                                  </div>
                                )}

                                <p className="text-[9px] text-muted-foreground pt-1.5 border-t border-border text-right uppercase font-bold">
                                  Ký tên: {rep.refereeId?.fullName}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="pt-2 flex justify-end">
                          <Button asChild variant="outline" className="h-9 px-4 rounded-full text-xs font-bold uppercase">
                            <Link href={`/referee/races/${assignment.raceId._id || (assignment.raceId as any).id}`}>
                              Đi tới Cuộc Đua <ArrowRight className="size-3.5 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
