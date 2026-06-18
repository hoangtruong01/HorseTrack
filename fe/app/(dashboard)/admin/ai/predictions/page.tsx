"use client";
import Image from "next/image";

import { useCallback, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { aiApi, racesApi, type AiPredictionItem, type RaceItem } from "@/lib/api-client";

const sourceLabels: Record<string, string> = {
  LLM: "LLM",
  RULE_BASED: "Rule-based",
  MANUAL: "Manual",
};

const sourceColors: Record<string, string> = {
  LLM: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  RULE_BASED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  MANUAL: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

function getHorseName(field: AiPredictionItem["rankings"][number]["horseId"]): string {
  if (!field) return "—";
  if (typeof field === "object" && "name" in field) return field.name;
  return String(field);
}

export default function AdminAiPredictionsPage() {
  const [races, setRaces] = useState<RaceItem[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState("");
  const [prediction, setPrediction] = useState<AiPredictionItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    racesApi.list({ limit: 100 })
      .then((res) => setRaces(res.data))
      .catch(() => { /* races load silently */ });
  }, []);

  const fetchPrediction = useCallback(async (raceId: string) => {
    setLoading(true);
    setPrediction(null);
    try {
      const data = await aiApi.getPrediction(raceId);
      setPrediction(data);
    } catch {
      // no prediction yet — normal state
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRaceSelect = (raceId: string) => {
    setSelectedRaceId(raceId);
    if (raceId) void fetchPrediction(raceId);
  };

  const handleGenerate = async () => {
    if (!selectedRaceId) return;
    setGenerating(true);
    try {
      const data = await aiApi.generatePrediction(selectedRaceId);
      setPrediction(data);
      toast.success("Sinh dự đoán AI thành công");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="AI Service"
        title="Dự Đoán AI Theo Race"
        description="Chọn một cuộc đua để xem hoặc sinh dự đoán AI dựa trên sức mạnh ngựa và lịch sử thi đấu."
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5 flex-1 min-w-48">
          <label className="text-xs font-medium text-muted-foreground">Chọn cuộc đua</label>
          <select
            value={selectedRaceId}
            onChange={(e) => handleRaceSelect(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">-- Chọn race --</option>
            {races.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name} — {new Date(r.startTime).toLocaleDateString("vi-VN")}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => { void handleGenerate(); }}
          disabled={!selectedRaceId || generating}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition"
        >
          <Sparkles className="size-4" />
          {generating ? "Đang sinh..." : "Sinh dự đoán AI"}
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-foreground/55">
  <Image src="/skeletonHorse.gif" alt="Đang tải..." width={80} height={80} unoptimized className="object-contain mx-auto" />
  <p className="mt-4 text-xs font-mono uppercase tracking-widest">Đang tải...</p>
</div>
      )}

      {!loading && selectedRaceId && !prediction && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center text-muted-foreground text-sm">
          Chưa có dự đoán cho race này. Nhấn <strong className="text-foreground">&quot;Sinh dự đoán AI&quot;</strong> để tạo.
        </div>
      )}

      {!loading && prediction && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex-1 space-y-0.5">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Nguồn</p>
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${sourceColors[prediction.source] ?? ""}`}>
                {sourceLabels[prediction.source] ?? prediction.source}
              </span>
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Độ tin cậy</p>
              <p className="text-2xl font-black text-primary">{prediction.confidenceLevel}%</p>
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Sinh lúc</p>
              <p className="text-sm text-foreground">{new Date(prediction.generatedAt).toLocaleString("vi-VN")}</p>
            </div>
          </div>

          {prediction.reasoning && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Lý giải của AI</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{prediction.reasoning}</p>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Xếp hạng</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Ngựa</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Xác suất thắng</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Điểm sức mạnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...prediction.rankings]
                  .sort((a, b) => a.predictedRank - b.predictedRank)
                  .map((r) => (
                    <tr key={typeof r.horseId === "object" && "_id" in r.horseId ? r.horseId._id : String(r.horseId)} className="hover:bg-muted transition-colors">
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex size-7 items-center justify-center rounded-full text-sm font-black ${r.predictedRank === 1 ? "bg-yellow-400/20 text-yellow-400" : r.predictedRank === 2 ? "bg-slate-400/20 text-slate-300" : r.predictedRank === 3 ? "bg-orange-400/20 text-orange-400" : "bg-muted text-muted-foreground"}`}>
                          {r.predictedRank}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-foreground">{getHorseName(r.horseId)}</td>
                      <td className="px-5 py-4 text-right font-mono text-sm text-foreground">{(r.winProbability * 100).toFixed(1)}%</td>
                      <td className="px-5 py-4 text-right font-mono text-sm text-foreground">{r.strengthScore.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
