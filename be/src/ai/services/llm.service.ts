import { GoogleGenAI } from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ProposedRaceInfo } from '../schemas/ai-race-arrangement-suggestion.schema';

export interface HorsePredictionMeta {
  name: string;
  breed?: string;
  age?: number;
  healthStatus: string;
  winCount: number;
  totalRaces: number;
  recentRanks: number[];
  avgSpeedKmh: number;
  jockeySkill?: string;
  predictedRank: number;
  winProbability: number;
  strengthScore: number;
}

export interface RacePredictionContext {
  raceName: string;
  distanceMeters: number;
  raceType?: string;
  trackCondition?: string;
  weather?: string;
}

export interface ArrangementHorseMeta {
  name: string;
  strengthScore: number;
  jockeySkill?: string;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly ai: GoogleGenAI | null;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    this.model = this.config.get<string>('GEMINI_MODEL', 'gemini-2.5-flash');
    this.timeoutMs = this.config.get<number>('GEMINI_TIMEOUT_MS', 10000);

    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY not configured — AI will use rule-based reasoning only',
      );
      this.ai = null;
    } else {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async generatePredictionReasoning(
    horses: HorsePredictionMeta[],
    raceCtx: RacePredictionContext,
  ): Promise<string | null> {
    if (!this.ai) return null;

    const sorted = [...horses].sort((a, b) => a.predictedRank - b.predictedRank);

    const horseLines = sorted
      .map((h) => {
        const winRate =
          h.totalRaces > 0
            ? ((h.winCount / h.totalRaces) * 100).toFixed(0)
            : 'chưa có';
        const recentForm =
          h.recentRanks.length > 0
            ? `3 race gần nhất: hạng ${h.recentRanks.join(', ')}`
            : 'chưa có lịch sử';
        const speed =
          h.avgSpeedKmh > 0 ? `tốc độ trung bình ${h.avgSpeedKmh.toFixed(1)} km/h` : '';
        const jockey = h.jockeySkill ? `jockey ${h.jockeySkill}` : '';
        const extras = [recentForm, speed, jockey].filter(Boolean).join(', ');
        return `  ${h.predictedRank}. ${h.name} (${h.breed ?? 'chưa rõ giống'}, ${h.age ?? '?'} tuổi, sức khoẻ: ${h.healthStatus}) — điểm sức mạnh ${h.strengthScore.toFixed(1)}, tỷ lệ thắng ${winRate}%, ${extras}`;
      })
      .join('\n');

    const raceInfo = [
      `Tên race: ${raceCtx.raceName}`,
      `Cự ly: ${raceCtx.distanceMeters}m`,
      raceCtx.raceType ? `Loại race: ${raceCtx.raceType}` : '',
      raceCtx.trackCondition ? `Mặt đường: ${raceCtx.trackCondition}` : '',
      raceCtx.weather ? `Thời tiết: ${raceCtx.weather}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    const prompt = `Bạn là chuyên gia phân tích đua ngựa chuyên nghiệp. Dựa trên dữ liệu bên dưới, hãy viết nhận xét phân tích (3-5 câu, tiếng Việt tự nhiên) về dự đoán kết quả race này. Đề cập cụ thể tên ngựa, lý do dự đoán, và điểm đáng chú ý. Chỉ trả về JSON có đúng một trường "reasoning".

Thông tin race: ${raceInfo}

Kết quả dự đoán (từ hạng 1 đến cuối):
${horseLines}`;

    return this.callModel(prompt, 'prediction');
  }

  async generateArrangementReasoning(
    tournamentName: string,
    proposedRaces: ProposedRaceInfo[],
    horsesByRace: ArrangementHorseMeta[][],
  ): Promise<string | null> {
    if (!this.ai) return null;

    const raceLines = proposedRaces
      .map((r, i) => {
        const names = (horsesByRace[i] ?? []).map((h) => h.name).join(', ');
        return `  Race ${i + 1} (${r.raceType}, ${r.distanceMeters}m): ${names} — sức mạnh TB ${r.avgStrength.toFixed(1)}, độ chênh lệch ${r.strengthSpread.toFixed(1)}`;
      })
      .join('\n');

    const prompt = `Bạn là chuyên gia tổ chức giải đua ngựa. Dựa trên dữ liệu phân bổ race bên dưới, hãy viết nhận xét ngắn (3-4 câu, tiếng Việt tự nhiên) đánh giá tính công bằng và hợp lý của kế hoạch sắp xếp. Chỉ trả về JSON có đúng một trường "reasoning".

Giải đấu: ${tournamentName}

Kế hoạch sắp xếp:
${raceLines}`;

    return this.callModel(prompt, 'arrangement');
  }

  private async callModel(prompt: string, tag: string): Promise<string | null> {
    try {
      const result = await Promise.race([
        this.ai!.models.generateContent({ model: this.model, contents: prompt }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('LLM timeout')), this.timeoutMs),
        ),
      ]);

      const text = result.text ?? '';
      const parsed = this.parseJson(text) as { reasoning?: string } | null;
      if (!parsed?.reasoning) {
        this.logger.warn(`LLM ${tag}: no reasoning in response — raw: ${text.slice(0, 200)}`);
        return null;
      }
      return parsed.reasoning;
    } catch (err: unknown) {
      this.logger.warn(`LLM ${tag} failed: ${String(err)}`);
      return null;
    }
  }

  private parseJson(text: string): unknown {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return null;
      return JSON.parse(match[0]) as unknown;
    } catch {
      return null;
    }
  }
}
