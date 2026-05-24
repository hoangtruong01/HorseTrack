export type ResultStatus = "draft" | "referee_confirmed" | "published";
export type PenaltyStatus = "clean" | "warning" | "penalty";

export type RaceRanking = {
  id: string;
  rank: number;
  horse: string;
  horseCode: string;
  jockey: string;
  finishTime: string;
  penaltyStatus: PenaltyStatus;
  finalStatus: ResultStatus;
};

export type RaceResultReview = {
  raceId: string;
  race: string;
  tournament: string;
  distance: string;
  track: string;
  finishedAt: string;
  referee: string;
  refereeSummary: string;
  status: ResultStatus;
  publishState: string;
  rankings: RaceRanking[];
};

const auroraRankings: RaceRanking[] = [
  {
    id: "rr-1",
    rank: 1,
    horse: "Crimson Bolt",
    horseCode: "HB-14",
    jockey: "Minh Khoa",
    finishTime: "01:10.842",
    penaltyStatus: "clean",
    finalStatus: "referee_confirmed",
  },
  {
    id: "rr-2",
    rank: 2,
    horse: "Midnight Alloy",
    horseCode: "HB-22",
    jockey: "Gia Huy",
    finishTime: "01:11.206",
    penaltyStatus: "warning",
    finalStatus: "referee_confirmed",
  },
  {
    id: "rr-3",
    rank: 3,
    horse: "Delta Comet",
    horseCode: "HB-31",
    jockey: "An Nhi",
    finishTime: "01:12.004",
    penaltyStatus: "clean",
    finalStatus: "referee_confirmed",
  },
  {
    id: "rr-4",
    rank: 4,
    horse: "Neon Stirrup",
    horseCode: "HB-19",
    jockey: "Thanh Vy",
    finishTime: "01:13.560",
    penaltyStatus: "penalty",
    finalStatus: "referee_confirmed",
  },
];

export const mockRaceResults: RaceResultReview[] = [
  {
    raceId: "race-aurora-1200",
    race: "Aurora Sprint 1200",
    tournament: "Spring Velocity Cup",
    distance: "1,200m",
    track: "North Loop",
    finishedAt: "24 May 2026 · 10:18",
    referee: "Referee Mai Anh",
    refereeSummary:
      "Referee confirmed finish order. One warning, one mock penalty note. Ready for admin publish review.",
    status: "referee_confirmed",
    publishState:
      "Publish enabled after referee confirmation. Admin confirmation remains mock-only.",
    rankings: auroraRankings,
  },
  {
    raceId: "race-delta-1600",
    race: "Delta Endurance 1600",
    tournament: "Mekong Masters",
    distance: "1,600m",
    track: "River Bend",
    finishedAt: "23 May 2026 · 15:28",
    referee: "Referee Hoang Lam",
    refereeSummary:
      "Draft result needs referee confirmation before publish CTA becomes available.",
    status: "draft",
    publishState: "Publish disabled until referee confirms race result.",
    rankings: auroraRankings.map((row, index) => ({
      ...row,
      id: `delta-${row.id}`,
      rank: index + 1,
      finalStatus: "draft",
    })),
  },
  {
    raceId: "race-heritage-1400",
    race: "Heritage Classic 1400",
    tournament: "Capital Derby Week",
    distance: "1,400m",
    track: "Classic Oval",
    finishedAt: "22 May 2026 · 09:42",
    referee: "Referee Thu Ha",
    refereeSummary:
      "Result already published. Public result state is locked for display.",
    status: "published",
    publishState:
      "Published result state. Confirmation CTA replaced by status UI.",
    rankings: auroraRankings.map((row, index) => ({
      ...row,
      id: `heritage-${row.id}`,
      rank: index + 1,
      finalStatus: "published",
    })),
  },
];

export function getRaceResultById(raceId: string) {
  return (
    mockRaceResults.find((result) => result.raceId === raceId) ??
    mockRaceResults[0]
  );
}
