import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { HorseDocument } from '../../horses/schemas/horse.schema';
import { HorseHealthStatus } from '../../horses/schemas/horse.schema';
import type { JockeyDocument } from '../../jockeys/schemas/jockey.schema';
import type { RaceResultDocument } from '../../race-results/schemas/race-result.schema';
import { RaceResultOutcome } from '../../race-results/schemas/race-result.schema';

export interface HorseStrengthResult {
  horseId: string;
  strengthScore: number;
  hasHealthRisk: boolean;
  isTooCloseToLastRace: boolean;
}

@Injectable()
export class StrengthScoreService {
  private readonly minRestDays: number;

  constructor(private readonly config: ConfigService) {
    this.minRestDays = this.config.get<number>('AI_MIN_REST_DAYS', 3);
  }

  compute(
    horse: HorseDocument,
    results: RaceResultDocument[],
    jockey: JockeyDocument | null,
    lastRaceDate: Date | null,
    raceDate: Date,
  ): HorseStrengthResult {
    try {
      const hasHealthRisk = horse.healthStatus === HorseHealthStatus.RECOVERING;

      const daysSinceLast =
        lastRaceDate != null
          ? (raceDate.getTime() - lastRaceDate.getTime()) / 86_400_000
          : null;

      const isTooCloseToLastRace =
        daysSinceLast != null &&
        daysSinceLast > 0 &&
        daysSinceLast < this.minRestDays;

      const winRate = this.computeWinRate(results);
      const avgRankScore = this.computeAvgRankScore(results);
      const recentForm = this.computeRecentForm(results);
      const jockeyScore = this.computeJockeyScore(jockey, results);
      const horseAttrScore = this.computeHorseAttrScore(horse);

      let score =
        winRate * 30 +
        avgRankScore * 25 +
        recentForm * 25 +
        jockeyScore * 10 +
        horseAttrScore * 10;

      if (hasHealthRisk) score *= 0.85;
      if (isTooCloseToLastRace) score *= 0.9;

      return {
        horseId: (horse._id as { toString(): string }).toString(),
        strengthScore: Math.max(0, Math.round(score * 100) / 100),
        hasHealthRisk,
        isTooCloseToLastRace,
      };
    } catch {
      return {
        horseId: (horse._id as { toString(): string }).toString(),
        strengthScore: 50,
        hasHealthRisk: false,
        isTooCloseToLastRace: false,
      };
    }
  }

  private computeWinRate(results: RaceResultDocument[]): number {
    if (!results.length) return 0.2;
    const finished = results.filter(
      (r) => r.outcome === RaceResultOutcome.FINISHED,
    );
    const wins = finished.filter((r) => r.rank === 1).length;
    return wins / results.length;
  }

  private computeAvgRankScore(results: RaceResultDocument[]): number {
    const ranked = results.filter(
      (r) => r.rank != null && r.outcome === RaceResultOutcome.FINISHED,
    );
    if (!ranked.length) return 0.5;
    const avg =
      ranked.reduce((sum, r) => sum + (r.rank ?? 5), 0) / ranked.length;
    return Math.max(0, 1 - (avg - 1) / 10);
  }

  private computeRecentForm(results: RaceResultDocument[]): number {
    const recent = results
      .filter((r) => r.outcome === RaceResultOutcome.FINISHED && r.rank != null)
      .slice(-3);
    if (!recent.length) return 0.5;
    const avgRank =
      recent.reduce((sum, r) => sum + (r.rank ?? 5), 0) / recent.length;
    return Math.max(0, 1 - (avgRank - 1) / 5);
  }

  private computeJockeyScore(
    jockey: JockeyDocument | null,
    results: RaceResultDocument[],
  ): number {
    if (!jockey) return 0.5;

    const expScore = Math.min(1, (jockey.experienceYears ?? 0) / 10);

    const jockeyResults = results.filter(
      (r) =>
        r.jockeyUserId?.toString() ===
        (jockey._id as { toString(): string }).toString(),
    );
    const winRate =
      jockeyResults.length > 0
        ? jockeyResults.filter((r) => r.rank === 1).length /
          jockeyResults.length
        : 0.2;

    return expScore * 0.4 + winRate * 0.6;
  }

  private computeHorseAttrScore(horse: HorseDocument): number {
    let score = 0.5;

    const age = horse.age ?? 5;
    if (age >= 3 && age <= 7) score += 0.2;
    else if (age > 7 && age <= 10) score += 0.1;
    else if (age > 10) score -= 0.1;

    if (horse.baseSpeed) score += (horse.baseSpeed - 60) / 100;
    if (horse.staminaScore) score += (horse.staminaScore - 70) / 100;

    if (horse.healthStatus === HorseHealthStatus.HEALTHY) score += 0.1;

    return Math.max(0, Math.min(1, score));
  }
}
