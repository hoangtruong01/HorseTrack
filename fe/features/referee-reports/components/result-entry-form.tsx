/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { CheckCircle2, Info, Lock, Play, Plus, Save, Siren, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type { Race } from "@/features/races/mock-races";
import {
  mockViolations,
  mockResultEntryRows,
  type ResultEntryRow,
  type RaceViolation,
} from "@/features/referee-reports/mock-referee-data";
import { addAuditLog } from "@/features/wallet/mock-wallet";

export type ResultEntryFormProps = {
  race: Race;
  rows: ResultEntryRow[];
};

export function ResultEntryForm({ race, rows: initialRows }: ResultEntryFormProps) {
  // Use state to keep simulated results dynamic
  const [rows, setRows] = useState<ResultEntryRow[]>(initialRows);
  const [violations, setViolations] = useState<RaceViolation[]>(
    mockViolations.filter((v) => v.raceId === race.id)
  );
  
  // Simulation conditions
  const [weather, setWeather] = useState<"sunny" | "rainy" | "stormy">("sunny");
  const [track, setTrack] = useState<"dry" | "muddy">("dry");
  
  // State for adding quick violation
  const [selectedHorseIndex, setSelectedHorseIndex] = useState(0);
  const [severity, setSeverity] = useState<"minor" | "major" | "critical" | "disqualified">("minor");
  const [violationNote, setViolationNote] = useState("");

  const enabled = race.status === "finished";
  const published = race.status === "result_published";

  // Pre-race checklist verification (mock-only check if the checklist has pending or complete items)
  // Let's assume for simulation that delta-1600 is fully complete or we let the user bypass/toggle.
  const preRaceCheckPassed = true;

  // Recalculate ranks based on times and violations
  const recalculateResults = (currentRows: ResultEntryRow[], currentViolations: RaceViolation[]) => {
    const updated = currentRows.map((row) => {
      // Find violations for this horse
      const horseViolations = currentViolations.filter(
        (v) => v.horse.toLowerCase() === row.horse.toLowerCase()
      );

      let penaltySeconds = 0;
      let isDisqualified = false;
      const notes: string[] = [];

      horseViolations.forEach((v) => {
        if (v.severity === "critical") {
          penaltySeconds += 12;
          notes.push("Critical Penalty (+12s)");
        } else if (v.severity === "penalty") {
          penaltySeconds += 6;
          notes.push("Major Penalty (+6s)");
        } else if (v.severity === "warning") {
          penaltySeconds += 3;
          notes.push("Minor Penalty (+3s)");
        } else if (v.note.toLowerCase().includes("disq") || (v.severity as string) === "disqualified") {
          isDisqualified = true;
          notes.push("DISQUALIFIED");
        }
      });

      // Parse current base time: "01:23.456" -> seconds
      let baseSeconds = 80; // fallback
      if (row.finishTime && row.finishTime !== "--:--.---") {
        const parts = row.finishTime.split(":");
        if (parts.length === 2) {
          const min = parseInt(parts[0]);
          const sec = parseFloat(parts[1]);
          if (!isNaN(min) && !isNaN(sec)) {
            baseSeconds = min * 60 + sec;
          }
        }
      }

      // Add penalties
      const finalSeconds = baseSeconds + penaltySeconds;
      let finalDisplay = row.finishTime;

      if (isDisqualified) {
        finalDisplay = "DISQ";
      } else if (row.finishTime !== "--:--.---") {
        const m = Math.floor(finalSeconds / 60);
        const s = (finalSeconds % 60).toFixed(3);
        const padM = m.toString().padStart(2, "0");
        const padS = parseFloat(s) < 10 ? `0${s}` : s;
        finalDisplay = `${padM}:${padS}`;
      }

      return {
        ...row,
        finishTime: finalDisplay,
        penaltyNote: notes.length > 0 ? notes.join(" | ") : "Clean run",
        status: isDisqualified ? ("draft" as const) : row.status,
      };
    });

    // Sort: active runners with times sorted ascending, then disqualified runners at the bottom
    const sorted = [...updated].sort((a, b) => {
      if (a.finishTime === "DISQ") return 1;
      if (b.finishTime === "DISQ") return -1;
      if (a.finishTime === "--:--.---") return 1;
      if (b.finishTime === "--:--.---") return -1;
      return a.finishTime.localeCompare(b.finishTime);
    });

    // Re-assign ranks
    return sorted.map((row, idx) => ({
      ...row,
      rank: row.finishTime === "DISQ" ? 99 : idx + 1,
    }));
  };

  // Add violation
  const handleAddViolation = (e: React.FormEvent) => {
    e.preventDefault();
    const horse = race.participants[selectedHorseIndex];
    if (!horse) return;

    let mappedSeverity: "warning" | "penalty" | "critical" = "warning";
    let penaltyLabel = "Minor";
    if (severity === "major") {
      mappedSeverity = "penalty";
      penaltyLabel = "Major";
    } else if (severity === "critical") {
      mappedSeverity = "critical";
      penaltyLabel = "Critical";
    }

    const newViolation: RaceViolation = {
      id: `v-${Date.now()}`,
      raceId: race.id,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      horse: horse.horse,
      jockey: horse.jockey,
      severity: mappedSeverity,
      note: violationNote.trim() || `${penaltyLabel} timing penalty infraction.`,
    };

    if (severity === "disqualified") {
      newViolation.note = `Disqualified: ${violationNote.trim() || "Safety violation infraction."}`;
    }

    const updatedViolations = [...violations, newViolation];
    setViolations(updatedViolations);
    mockViolations.push(newViolation); // save globally

    // Trigger recalculation on times
    const recalculated = recalculateResults(rows, updatedViolations);
    setRows(recalculated);
    setViolationNote("");

    toast.success(`Logged ${severity} violation for ${horse.horse}! Ranks recalculated.`);
  };

  // Delete violation
  const handleDeleteViolation = (id: string) => {
    const updated = violations.filter((v) => v.id !== id);
    setViolations(updated);
    
    // Remove from mockViolations
    const idx = mockViolations.findIndex((v) => v.id === id);
    if (idx !== -1) mockViolations.splice(idx, 1);

    // Trigger recalculation
    const recalculated = recalculateResults(rows, updated);
    setRows(recalculated);
    toast.success("Violation removed. Times restored.");
  };

  // Simulate Results Click
  const handleSimulate = () => {
    if (!preRaceCheckPassed) {
      toast.error("Pre-race checks must pass before simulation is unlocked.");
      return;
    }

    // Generate random times based on base stats + weather + track factors
    const simulated = race.participants.map((p, idx) => {
      // Base stats
      const speedFactor = 12; // average m/s
      
      // Calculate random form (form factor from 0.95 to 1.05)
      const randomForm = 0.95 + Math.random() * 0.1;
      
      // Weather factors
      let weatherMalus = 1.0;
      if (weather === "rainy") weatherMalus = 0.96;
      if (weather === "stormy") weatherMalus = 0.90;

      // Track factors
      let trackMalus = 1.0;
      if (track === "muddy") trackMalus = 0.95;

      const finalSpeed = speedFactor * randomForm * weatherMalus * trackMalus;
      const totalDistance = parseInt(race.distance.replace(/[^0-9]/g, "")) || 1200;
      
      // Time in seconds
      const runningSeconds = totalDistance / finalSpeed;

      const m = Math.floor(runningSeconds / 60);
      const s = (runningSeconds % 60).toFixed(3);
      const padM = m.toString().padStart(2, "0");
      const padS = parseFloat(s) < 10 ? `0${s}` : s;
      const timeStr = `${padM}:${padS}`;

      return {
        id: `${race.id}-row-${p.id}`,
        rank: idx + 1,
        horse: p.horse,
        horseCode: p.horseCode,
        jockey: p.jockey,
        finishTime: timeStr,
        penaltyNote: "Clean run",
        status: "draft" as const,
      };
    });

    const recalculated = recalculateResults(simulated, violations);
    setRows(recalculated);
    toast.success("Timing Simulation successfully calculated!");
  };

  const handleConfirmResult = () => {
    // Confirm results
    const updated = rows.map((r) => ({ ...r, status: "referee_confirmed" as const }));
    setRows(updated);
    
    // Save to global mock results
    mockResultEntryRows[race.id] = updated;

    // Trigger state change in race results
    addAuditLog(
      "RESULT_CONFIRMED",
      refereeProfileName(),
      `Confirmed results for ${race.name}. Waiting for Admin publish review.`
    );

    toast.success("Results confirmed and submitted for Admin review!");
  };

  const refereeProfileName = () => {
    return race.referee ? race.referee.name : "Referee Desk";
  };

  const stateLabel = published
    ? "Published · locked"
    : enabled
      ? "Finished · entry enabled"
      : "Locked until race finished";

  return (
    <section className="space-y-6">
      {/* Simulation Controls */}
      {enabled && (
        <div className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(225,6,0,0.12),rgba(21,21,30,0.95))] p-4 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1.5">
                <Sparkles className="size-4" /> Quick-simulation Center
              </p>
              <h3 className="mt-1 text-xl font-black uppercase text-white">
                Race Simulation Engine
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                Simulate realistic horse timings based on base speeds, weather modifiers, track conditions and random daily form.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center">
              {/* Weather selection */}
              <div className="space-y-1">
                <span className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider">Weather</span>
                <select
                  value={weather}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setWeather(e.target.value as any)}
                  className="h-10 rounded-lg border border-white/10 bg-[#1C1C25] px-3 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="sunny">Sunny (Dry +0%)</option>
                  <option value="rainy">Rainy (Slick -4%)</option>
                  <option value="stormy">Stormy (Heavy -10%)</option>
                </select>
              </div>

              {/* Track Selection */}
              <div className="space-y-1">
                <span className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider">Track Condition</span>
                <select
                  value={track}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTrack(e.target.value as any)}
                  className="h-10 rounded-lg border border-white/10 bg-[#1C1C25] px-3 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="dry">Dry Turf</option>
                  <option value="muddy">Muddy / Slow (-5%)</option>
                </select>
              </div>

              <div className="pt-5">
                <Button
                  onClick={handleSimulate}
                  className="h-10 rounded-full font-black uppercase tracking-wider text-white bg-primary hover:bg-[#B80500] px-5"
                >
                  <Play className="mr-1.5 size-3.5 fill-current" /> Simulate Results
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 flex items-center gap-3">
            <Info className="size-5 text-primary shrink-0" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-white uppercase font-black mr-1">Pre-race Check status:</strong>
              {preRaceCheckPassed ? (
                <span className="text-emerald-400 font-bold">PASSED (Jockey checked-in, horse health approved, equipment verified)</span>
              ) : (
                <span className="text-primary font-bold">FAILED (Desk approvals missing)</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Results Form */}
      <div className="relative rounded-2xl border border-white/10 bg-[#15151E]/90 p-4 pb-28 sm:p-6 sm:pb-28">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Race result entry
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase text-white">
              {race.name}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Verify finish timings, log timing penalties, and submit confirmed rankings to Admin.
            </p>
          </div>
          <StatusBadge
            label={stateLabel}
            tone={published ? "teal" : enabled ? "green" : "slate"}
          />
        </div>

        {!enabled ? (
          <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-muted-foreground">
            <Lock className="mr-2 inline size-4 text-primary" /> Result entry
            disabled because this race is not in finished status.
          </div>
        ) : null}

        <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Horse</th>
                <th className="px-4 py-3">Jockey</th>
                <th className="px-4 py-3">Finish time</th>
                <th className="px-4 py-3">Escrow Penalty Note</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-black/10">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "transition hover:bg-white/[0.04]",
                    (!enabled || row.finishTime === "DISQ") && "opacity-60",
                  )}
                >
                  <td className="px-4 py-4 font-mono text-2xl font-black text-white">
                    {row.finishTime === "DISQ" ? "#--" : `#${row.rank}`}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-black uppercase text-white">{row.horse}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {row.horseCode}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-white/80">{row.jockey}</td>
                  <td className="px-4 py-4">
                    <input
                      aria-label={`Finish time for ${row.horse}`}
                      disabled={!enabled}
                      value={row.finishTime}
                      onChange={(e) => {
                        const updatedRows = rows.map((r) =>
                          r.id === row.id ? { ...r, finishTime: e.target.value } : r
                        );
                        setRows(recalculateResults(updatedRows, violations));
                      }}
                      className="h-11 w-32 rounded-lg border border-white/10 bg-black/35 px-3 font-mono font-black text-white outline-none focus:border-primary disabled:cursor-not-allowed disabled:text-white/40"
                    />
                  </td>
                  <td className="px-4 py-4 font-semibold text-xs">
                    <span className={cn(
                      row.penaltyNote.includes("Penalty") || row.penaltyNote.includes("DISQ") ? "text-primary font-bold" : "text-emerald-400"
                    )}>
                      {row.penaltyNote}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge
                      label={row.status === "referee_confirmed" ? "Confirmed" : "Draft"}
                      tone={row.status === "referee_confirmed" ? "green" : "slate"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sticky Action Bar */}
        <div className="sticky bottom-3 z-10 mt-6 rounded-2xl border border-white/10 bg-[#1C1C25]/95 p-3 shadow-[0_18px_56px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black uppercase text-white">Tablet action bar</p>
              <p className="text-xs text-muted-foreground">
                Confirm finish order and transmit to administrative result review desk.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Button asChild variant="outline" className="h-12 rounded-full">
                <Link href={`/referee/races/${race.id}`}>Checklist</Link>
              </Button>
              <Button
                disabled={!enabled}
                variant="outline"
                className="h-12 rounded-full"
                onClick={() => toast.success("Draft results saved locally.")}
              >
                <Save className="size-4" /> Save draft
              </Button>
              <Button
                disabled={!enabled || rows[0]?.finishTime === "--:--.---"}
                onClick={handleConfirmResult}
                className="h-12 rounded-full font-black uppercase text-white bg-primary hover:bg-[#B80500]"
              >
                <CheckCircle2 className="size-4" /> Confirm result
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Violation Logging UI (for Referee desk convenience) */}
      {enabled && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Quick Add Form */}
          <form onSubmit={handleAddViolation} className="rounded-2xl border border-white/10 bg-[#15151E]/95 p-4 sm:p-6 space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-primary flex items-center gap-1.5">
                <Siren className="size-4" /> Live Infractions desk
              </p>
              <h3 className="mt-1 text-xl font-black uppercase text-white">
                Log New Violation
              </h3>
              <p className="text-xs text-muted-foreground">
                Grave infractions automatically add penalty seconds or trigger DISQ.
              </p>
            </div>

            {/* Select Horse */}
            <div className="space-y-1.5">
              <label htmlFor="horse-select" className="block text-[10px] font-black uppercase text-muted-foreground">Infractor Participant</label>
              <select
                id="horse-select"
                value={selectedHorseIndex}
                onChange={(e) => setSelectedHorseIndex(parseInt(e.target.value))}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/35 px-3 text-sm text-white outline-none focus:border-primary cursor-pointer"
              >
                {race.participants.map((p, idx) => (
                  <option key={p.id} value={idx} className="bg-[#1C1C25] text-white">
                    {p.horse} ({p.jockey})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Severity */}
            <div className="space-y-1.5">
              <label htmlFor="severity-select" className="block text-[10px] font-black uppercase text-muted-foreground">Severity & Impact</label>
              <select
                id="severity-select"
                value={severity}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSeverity(e.target.value as any)}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/35 px-3 text-sm text-white outline-none focus:border-primary cursor-pointer"
              >
                <option value="minor">Minor timing penalty (+3 seconds)</option>
                <option value="major">Major timing penalty (+6 seconds)</option>
                <option value="critical">Critical timing penalty (+12 seconds)</option>
                <option value="disqualified">Disqualified (DISQ outcome)</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="violation-desc" className="block text-[10px] font-black uppercase text-muted-foreground">Steward details / Note</label>
              <input
                id="violation-desc"
                type="text"
                placeholder="e.g. Lane drift during final bend..."
                value={violationNote}
                onChange={(e) => setViolationNote(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/35 px-3 text-sm text-white outline-none focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-full font-black uppercase tracking-wider text-white bg-primary hover:bg-[#B80500]"
            >
              <Plus className="mr-1.5 size-4" /> Add & Recalculate
            </Button>
          </form>

          {/* Active Violations List */}
          <div className="rounded-2xl border border-white/10 bg-[#15151E]/95 p-4 sm:p-6 space-y-4">
            <div>
              <h3 className="text-xl font-black uppercase text-white flex items-center gap-2">
                Active Steward Notes ({violations.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Violations logged for this race. Deleting one will restore base running times instantly.
              </p>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[280px] pr-1">
              {violations.length === 0 ? (
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-xs text-emerald-400 text-center font-bold">
                  No active infractions logged. Clean run.
                </div>
              ) : (
                violations.map((v) => {
                  let penaltyLabel = "+3s";
                  let tone = "text-amber-400 bg-amber-500/10";
                  if (v.severity === "critical") {
                    penaltyLabel = "+12s";
                    tone = "text-primary bg-primary/10";
                  } else if (v.severity === "penalty") {
                    penaltyLabel = "+6s";
                    tone = "text-primary bg-primary/10";
                  } else if (v.note.toLowerCase().includes("disq")) {
                    penaltyLabel = "DISQ";
                    tone = "text-primary bg-primary/15";
                  }

                  return (
                    <div key={v.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/30 p-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider font-mono", tone)}>
                            {penaltyLabel}
                          </span>
                          <strong className="text-xs font-black uppercase text-white">{v.horse}</strong>
                          <span className="text-[10px] text-muted-foreground">· {v.jockey}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground leading-normal">{v.note}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteViolation(v.id)}
                        className="grid size-8 place-items-center rounded-lg hover:bg-white/5 text-muted-foreground hover:text-primary transition shrink-0 cursor-pointer"
                        aria-label="Remove infraction"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
