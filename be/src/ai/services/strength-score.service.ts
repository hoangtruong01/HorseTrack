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

      // 4 thành phần, mỗi cái chuẩn hóa 0–1 nên đóng góp tối đa = trọng số.
      // Chỉ còn 2 trục chính (khả năng thắng + phong độ), không còn trùng lặp.
      const winRate = this.computeWinRate(results);
      const recentForm = this.computeRecentForm(results);
      const jockeyScore = this.computeJockeyScore(jockey, results);
      const horseAttrScore = this.computeHorseAttrScore(horse);

      // Tổng thang ~0–98 (attr tối đa 0.8 nên chỉ đạt 8/10).
      let score =
        winRate * 40 +
        recentForm * 40 +
        jockeyScore * 10 +
        horseAttrScore * 10;

      // Phạt: đang hồi phục và/hoặc nghỉ chưa đủ; có thể cộng dồn.
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

  // Tỷ lệ về nhất / TỔNG số race (kể cả DNF → race bỏ dở kéo tụt điểm).
  // Chưa có lịch sử → 0.2.
  private computeWinRate(results: RaceResultDocument[]): number {
    if (!results.length) return 0.2;
    const finished = results.filter(
      (r) => r.outcome === RaceResultOutcome.FINISHED,
    );
    const wins = finished.filter((r) => r.rank === 1).length;
    return wins / results.length;
  }

  // Phong độ = hạng trung bình 3 race MỚI nhất (results đã sort mới→cũ),
  // ánh xạ 1 - (avgRank-1)/5: hạng 1 → 1.0, hạng 6+ → 0. Không có → 0.5.
  private computeRecentForm(results: RaceResultDocument[]): number {
    const recent = results
      .filter((r) => r.outcome === RaceResultOutcome.FINISHED && r.rank != null)
      .slice(0, 3);
    if (!recent.length) return 0.5;
    const avgRank =
      recent.reduce((sum, r) => sum + (r.rank ?? 5), 0) / recent.length;
    return Math.max(0, 1 - (avgRank - 1) / 5);
  }

  // Chất lượng nài = 40% kinh nghiệm + 60% tỷ lệ thắng của nài trên chính
  // con ngựa này. Không có nài → 0.5.
  private computeJockeyScore(
    jockey: JockeyDocument | null,
    results: RaceResultDocument[],
  ): number {
    if (!jockey) return 0.5;

    // Mỗi năm KN = +0.1, đạt trần 1.0 ở 10 năm.
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

  // Thuộc tính ngựa = tuổi + sức khỏe (đã bỏ baseSpeed/staminaScore).
  // Nền 0.5, tối đa thực tế 0.8; clamp về 0–1.
  private computeHorseAttrScore(horse: HorseDocument): number {
    let score = 0.5;

    // Tuổi vàng 3–7 (+0.2), 7–10 (+0.1), quá 10 giảm (-0.1).
    const age = horse.age ?? 5;
    if (age >= 3 && age <= 7) score += 0.2;
    else if (age > 7 && age <= 10) score += 0.1;
    else if (age > 10) score -= 0.1;

    if (horse.healthStatus === HorseHealthStatus.HEALTHY) score += 0.1;

    return Math.max(0, Math.min(1, score));
  }
}
