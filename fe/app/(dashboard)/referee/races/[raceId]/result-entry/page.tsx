"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Siren,
  Sparkles,
  Award,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import { racesApi, raceChecksApi, raceResultsApi, type RaceResultItem } from "@/lib/api-client";

// Types
type Race = {
  _id: string;
  name: string;
  startTime: string;
  status: string;
  distanceMeter: number;
};

type RaceCheck = {
  _id: string;
  raceRegistrationId: {
    _id: string;
  };
  horseId: {
    _id: string;
    name: string;
    breed: string;
  };
};


export default function RefereeResultEntryPage() {
  const params = useParams();
  const raceId = params.raceId as string;
  const router = useRouter();

  const [race, setRace] = useState<Race | null>(null);
  const [results, setResults] = useState<RaceResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Operations loading
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Manual entry table state
  const [entryRows, setEntryRows] = useState<
    {
      raceRegistrationId: string;
      horseId: string;
      horseName: string;
      horseBreed: string;
      outcome: "finished" | "disqualified" | "did_not_start" | "did_not_finish";
      incident: "none" | "minor_stumble" | "lane_drift" | "gate_delay" | "collision" | "injury";
      finishTimeSecs: string; // User enters seconds (e.g. 72.45)
      rank: string;
      note: string;
    }[]
  >([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch race info
      const raceData = await racesApi.get(raceId);
      setRace(raceData as unknown as Race);

      // 2. Fetch horses (pre-race checks list represents the approved horses list)
      let horsesList: RaceCheck[] = [];
      const checksData = await raceChecksApi.listByRace(raceId);
      horsesList = (checksData || []) as unknown as RaceCheck[];
      // 3. Fetch current race results
      let existingResults: RaceResultItem[] = [];
      try {
        existingResults = await raceResultsApi.listByRace(raceId) || [];
        setResults(existingResults);
      } catch {
        existingResults = [];
      }

      // 4. Map existing results or initialize blank rows
      const rows = horsesList.map((h) => {
        const existing = existingResults.find((r) => {
          const rHorseId = typeof r.horseId === "object" ? r.horseId?._id : r.horseId;
          return rHorseId === h.horseId?._id;
        });

        return {
          raceRegistrationId: h.raceRegistrationId?._id,
          horseId: h.horseId?._id,
          horseName: h.horseId?.name,
          horseBreed: h.horseId?.breed,
          outcome: existing?.outcome || "finished",
          incident: existing?.incident || "none",
          finishTimeSecs: existing?.finishTimeMs ? (existing.finishTimeMs / 1000).toString() : "",
          rank: existing?.rank ? existing.rank.toString() : "",
          note: existing?.note || "",
        };
      });
      setEntryRows(rows);
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Lỗi khi tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!raceId || raceId === "undefined") return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceId]);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch(`/api/referee/race-results/race/${raceId}/simulate`, {
        method: "POST",
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Lỗi chạy giả lập");
      }

      toast.success("Giả lập cuộc đua thành công! Ranks và chỉ số đã tự động kết xuất.");
      await fetchData();
    } catch (err) {
      toast.error((err as Error).message || "Lỗi khi chạy giả lập.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRowChange = (index: number, field: string, value: unknown) => {
    const updated = [...entryRows];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setEntryRows(updated);
  };

  const handleBulkSave = async () => {
    setIsSaving(true);
    try {
      // Convert rows to payload format
      const payloadResults = entryRows.map((row) => {
        const secs = parseFloat(row.finishTimeSecs);
        return {
          raceRegistrationId: row.raceRegistrationId,
          horseId: row.horseId,
          outcome: row.outcome,
          incident: row.incident,
          finishTimeMs: isNaN(secs) ? undefined : Math.round(secs * 1000),
          rank: row.rank ? parseInt(row.rank) : undefined,
          note: row.note,
        };
      });

      const res = await fetch(`/api/referee/race-results/race/${raceId}/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: payloadResults }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Không thể lưu kết quả nháp");
      }

      toast.success("Lưu nháp kết quả và tự động xếp thứ hạng thành công!");
      await fetchData();
    } catch (err) {
      toast.error((err as Error).message || "Lỗi khi lưu kết quả.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirm = async () => {
    if (results.length === 0) {
      toast.error("Vui lòng lưu nháp kết quả trước khi bấm Xác nhận khóa.");
      return;
    }

    setIsConfirming(true);
    try {
      const res = await fetch(`/api/referee/race-results/race/${raceId}/confirm`, {
        method: "PATCH",
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Xác nhận kết quả thất bại");
      }

      toast.success("Khóa và xác nhận biên bản kết quả thi đấu thành công! Kết quả sẵn sàng cho Ban tổ chức công bố.");
      await fetchData();
    } catch (err) {
      toast.error((err as Error).message || "Lỗi khi xác nhận kết quả.");
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!race) {
    return (
      <main className="max-w-4xl mx-auto p-8 space-y-4 text-center">
        <h2 className="text-xl font-bold text-white">Không tìm thấy cuộc đua</h2>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </main>
    );
  }

  const resultsStatus = results[0]?.status || "DRAFT";
  const isLocked = resultsStatus === "CONFIRMED" || resultsStatus === "PUBLISHED";

  return (
    <main className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Back link */}
      <Link href={`/referee/races/${raceId}`} className="inline-flex items-center text-xs text-white/50 hover:text-white transition">
        <ArrowLeft className="size-3.5 mr-1" /> Quay lại kiểm duyệt ngựa
      </Link>

      <PageHeader
        eyebrow="Ghi nhận thứ hạng"
        title="Nhập Kết Quả Thi Đấu"
        description="Nhập thời gian về đích thủ công hoặc kích hoạt thuật toán giả lập thời gian chạy dựa trên các chỉ số ngựa và biến cố trên sân."
        actions={
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="h-11 rounded-full border-white/10 hover:bg-white/5 text-white hover:text-white">
              <Link href={`/referee/races/${raceId}/violations`}>
                <Siren className="size-4 mr-1 text-primary" /> Vi phạm
              </Link>
            </Button>
          </div>
        }
      />

      {/* Control Actions / Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#15151E] p-5 shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(225,6,0,0.1),transparent_25rem)]" />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-teal-400">TRẠNG THÁI BIÊN BẢN KẾT QUẢ</span>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge
                label={
                  resultsStatus === "DRAFT" ? "Bản Nháp (Draft)" :
                  resultsStatus === "CONFIRMED" ? "Đã Xác Nhận (Confirmed)" : "Đã Công Bố (Published)"
                }
                tone={
                  resultsStatus === "PUBLISHED" ? "green" :
                  resultsStatus === "CONFIRMED" ? "teal" : "yellow"
                }
                pulse={resultsStatus === "DRAFT" && results.length > 0}
              />
              <span className="text-sm font-bold text-white uppercase">{race.name}</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              *Sau khi Xác nhận, dữ liệu kết quả sẽ được khóa cứng, tự động tính điểm xếp hạng để chia thưởng.*
            </p>
          </div>

          {!isLocked && (
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                onClick={handleSimulate}
                disabled={isSimulating || isSaving}
                className="h-10 px-5 rounded-full bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-black uppercase flex items-center gap-1.5"
              >
                <Sparkles className="size-3.5 fill-current" /> {isSimulating ? "Đang chạy giả lập..." : "Chạy giả lập kết quả"}
              </Button>

              <Button
                onClick={handleConfirm}
                disabled={isConfirming || results.length === 0}
                className="h-10 px-5 rounded-full bg-[#E10600] hover:bg-[#B80500] text-white text-xs font-black uppercase flex items-center gap-1.5"
              >
                <Lock className="size-3.5" /> {isConfirming ? "Đang khóa..." : "Khóa & Xác nhận biên bản"}
              </Button>
            </div>
          )}

          {isLocked && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shrink-0">
              <CheckCircle2 className="size-4" /> Biên bản kết quả đã khóa
            </div>
          )}
        </div>
      </section>

      {/* Manual Entry Form */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-white">
            Bảng kê chi tiết kết quả về đích
          </h3>

          {!isLocked && entryRows.length > 0 && (
            <Button
              onClick={handleBulkSave}
              disabled={isSaving || isSimulating}
              className="h-9 px-4 rounded-full bg-teal-500 hover:bg-teal-600 text-white text-xs font-black uppercase flex items-center gap-1.5"
            >
              <Save className="size-3.5" /> {isSaving ? "Đang lưu..." : "Lưu nháp"}
            </Button>
          )}
        </div>

        {entryRows.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-white/10 bg-[#15151E]/40 text-white/40 text-xs">
            Chưa có ngựa nào được duyệt kiểm tra trước cuộc đua này.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#15151E] shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-[10px] font-black uppercase tracking-widest text-white/50">
                  <th className="p-4">Xếp hạng</th>
                  <th className="p-4">Chiến mã (Horse)</th>
                  <th className="p-4">Kết quả (Outcome)</th>
                  <th className="p-4">Thời gian về đích (Giây)</th>
                  <th className="p-4">Sự cố (Incident)</th>
                  <th className="p-4">Ghi chú / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {entryRows.map((row, i) => {
                  const existingResult = results.find((r) => {
                    const rHorseId = typeof r.horseId === "object" ? r.horseId?._id : r.horseId;
                    return rHorseId === row.horseId;
                  });

                  return (
                    <tr key={row.horseId} className="hover:bg-white/5 transition">
                      <td className="p-4 font-black text-sm text-white">
                        {isLocked && existingResult ? (
                          <div className="flex items-center gap-1.5">
                            <Award className={`size-4 ${existingResult.rank === 1 ? "text-yellow-400" : existingResult.rank === 2 ? "text-slate-300" : "text-amber-600"}`} />
                            {existingResult.rank || "—"}
                          </div>
                        ) : existingResult?.rank ? (
                          <span className="text-teal-400 font-bold">{existingResult.rank}</span>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-white uppercase">{row.horseName}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">{row.horseBreed}</p>
                      </td>
                      <td className="p-4">
                        {isLocked ? (
                          <span className="text-white font-bold uppercase">{row.outcome}</span>
                        ) : (
                          <select
                            value={row.outcome}
                            onChange={(e) => handleRowChange(i, "outcome", e.target.value)}
                            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          >
                            <option value="finished" className="bg-[#15151E]">FINISHED (Hoàn thành)</option>
                            <option value="disqualified" className="bg-[#15151E]">DISQUALIFIED (Truất quyền)</option>
                            <option value="did_not_start" className="bg-[#15151E]">DID_NOT_START (Không xuất phát)</option>
                            <option value="did_not_finish" className="bg-[#15151E]">DID_NOT_FINISH (Không về đích)</option>
                          </select>
                        )}
                      </td>
                      <td className="p-4">
                        {isLocked ? (
                          <span className="text-white font-black">{row.finishTimeSecs ? `${row.finishTimeSecs}s` : "—"}</span>
                        ) : (
                          <div className="flex items-center gap-1.5 max-w-[120px]">
                            <input
                              type="number"
                              step="0.001"
                              min="0"
                              placeholder="72.450"
                              value={row.finishTimeSecs}
                              onChange={(e) => handleRowChange(i, "finishTimeSecs", e.target.value)}
                              disabled={row.outcome !== "finished"}
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white focus:border-primary focus:outline-none placeholder-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                            />
                            <span className="text-white/40">s</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {isLocked ? (
                          <span className="text-white/60 font-bold uppercase">{row.incident}</span>
                        ) : (
                          <select
                            value={row.incident}
                            onChange={(e) => handleRowChange(i, "incident", e.target.value)}
                            disabled={row.outcome !== "finished"}
                            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <option value="none" className="bg-[#15151E]">NONE (Không có)</option>
                            <option value="minor_stumble" className="bg-[#15151E]">MINOR_STUMBLE (Vấp nhẹ)</option>
                            <option value="lane_drift" className="bg-[#15151E]">LANE_DRIFT (Chệch làn)</option>
                            <option value="gate_delay" className="bg-[#15151E]">GATE_DELAY (Kẹt cổng)</option>
                            <option value="collision" className="bg-[#15151E]">COLLISION (Va chạm)</option>
                            <option value="injury" className="bg-[#15151E]">INJURY (Chấn thương)</option>
                          </select>
                        )}
                      </td>
                      <td className="p-4">
                        {isLocked ? (
                          <p className="text-white/50">{row.note || "—"}</p>
                        ) : (
                          <input
                            type="text"
                            placeholder="Ghi chú thêm..."
                            value={row.note}
                            onChange={(e) => handleRowChange(i, "note", e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white focus:border-primary focus:outline-none placeholder-white/25"
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
