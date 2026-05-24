import { getRaceById, mockRaces, type Race } from "@/features/races/mock-races";

export type ChecklistStatus = "complete" | "attention" | "pending";
export type ViolationSeverity = "warning" | "penalty" | "critical";
export type ResultEntryStatus = "draft" | "referee_confirmed" | "published";

export type RaceChecklistItem = {
  id: string;
  label: string;
  detail: string;
  status: ChecklistStatus;
};

export type RaceViolation = {
  id: string;
  raceId: string;
  time: string;
  horse: string;
  jockey: string;
  severity: ViolationSeverity;
  note: string;
};

export type ResultEntryRow = {
  id: string;
  rank: number;
  horse: string;
  horseCode: string;
  jockey: string;
  finishTime: string;
  penaltyNote: string;
  status: ResultEntryStatus;
};

export type RefereeReport = {
  raceId: string;
  race: string;
  tournament: string;
  referee: string;
  submittedAt: string;
  checklistComplete: number;
  checklistTotal: number;
  violationCount: number;
  confirmationStatus: ResultEntryStatus;
  summary: string;
};

export type RefereeAssignment = {
  raceId: string;
  priority: "now" | "next" | "review" | "closed";
  callout: string;
};

export const refereeProfile = {
  name: "Referee Hoang Lam",
  license: "RF-3310",
  station: "Tablet desk · Gate C",
};

export const refereeAssignments: RefereeAssignment[] = [
  {
    raceId: "race-delta-1600",
    priority: "now",
    callout: "Finished race · result entry enabled",
  },
  {
    raceId: "race-aurora-1200",
    priority: "review",
    callout: "Live race · violation log open",
  },
  {
    raceId: "race-neon-900",
    priority: "next",
    callout: "Scheduled race · pre-race checklist",
  },
  {
    raceId: "race-heritage-1400",
    priority: "closed",
    callout: "Published result · report locked",
  },
];

export const mockRaceChecklists: Record<string, RaceChecklistItem[]> = {
  "race-delta-1600": [
    {
      id: "c1",
      label: "Participant lane check",
      detail: "All horses matched lane/order sheet.",
      status: "complete",
    },
    {
      id: "c2",
      label: "Jockey confirmation",
      detail: "All jockey IDs verified before start.",
      status: "complete",
    },
    {
      id: "c3",
      label: "Track condition",
      detail: "Soft turf noted; result entry requires note.",
      status: "attention",
    },
    {
      id: "c4",
      label: "Finish capture",
      detail: "Manual timing sheet ready for referee confirm.",
      status: "complete",
    },
  ],
  "race-aurora-1200": [
    {
      id: "c1",
      label: "Participant lane check",
      detail: "Lane two under steward observation.",
      status: "attention",
    },
    {
      id: "c2",
      label: "Jockey confirmation",
      detail: "Live race locked; no roster edits.",
      status: "complete",
    },
    {
      id: "c3",
      label: "Track condition",
      detail: "Dry turf confirmed.",
      status: "complete",
    },
    {
      id: "c4",
      label: "Finish capture",
      detail: "Pending race finish.",
      status: "pending",
    },
  ],
  "race-neon-900": [
    {
      id: "c1",
      label: "Participant lane check",
      detail: "Check-in opens 18:50.",
      status: "pending",
    },
    {
      id: "c2",
      label: "Jockey confirmation",
      detail: "One assignment needs desk confirmation.",
      status: "attention",
    },
    {
      id: "c3",
      label: "Track condition",
      detail: "Synthetic surface inspection pending.",
      status: "pending",
    },
    {
      id: "c4",
      label: "Finish capture",
      detail: "Timing desk not armed yet.",
      status: "pending",
    },
  ],
  "race-heritage-1400": [
    {
      id: "c1",
      label: "Participant lane check",
      detail: "Closed.",
      status: "complete",
    },
    {
      id: "c2",
      label: "Jockey confirmation",
      detail: "Closed.",
      status: "complete",
    },
    {
      id: "c3",
      label: "Track condition",
      detail: "Closed.",
      status: "complete",
    },
    {
      id: "c4",
      label: "Finish capture",
      detail: "Published result locked.",
      status: "complete",
    },
  ],
};

export const mockViolations: RaceViolation[] = [
  {
    id: "v1",
    raceId: "race-delta-1600",
    time: "15:21",
    horse: "Neon Stirrup",
    jockey: "Thanh Vy",
    severity: "penalty",
    note: "Lane drift after final bend; +0.40s note only.",
  },
  {
    id: "v2",
    raceId: "race-delta-1600",
    time: "15:24",
    horse: "Midnight Alloy",
    jockey: "Gia Huy",
    severity: "warning",
    note: "Contact warning logged by desk referee.",
  },
  {
    id: "v3",
    raceId: "race-aurora-1200",
    time: "10:09",
    horse: "Silver Apex",
    jockey: "Bao Nam",
    severity: "warning",
    note: "Start gate delay observed; no result impact yet.",
  },
  {
    id: "v4",
    raceId: "race-neon-900",
    time: "19:02",
    horse: "Midnight Alloy",
    jockey: "Gia Huy",
    severity: "critical",
    note: "Pre-race tack inspection pending before check-in closure.",
  },
];

const rowsFromRace = (
  race: Race,
  status: ResultEntryStatus,
): ResultEntryRow[] =>
  race.participants.map((participant, index) => ({
    id: `${race.id}-row-${participant.id}`,
    rank: index + 1,
    horse: participant.horse,
    horseCode: participant.horseCode,
    jockey: participant.jockey,
    finishTime:
      status === "published"
        ? `01:${10 + index}.${842 + index * 91}`
        : status === "referee_confirmed"
          ? `01:${18 + index}.${204 + index * 88}`
          : index < 4
            ? `01:${20 + index}.${132 + index * 74}`
            : "--:--.---",
    penaltyNote:
      index === 3 ? "Penalty note" : index === 1 ? "Warning note" : "Clean",
    status,
  }));

export const mockResultEntryRows: Record<string, ResultEntryRow[]> = {
  "race-delta-1600": rowsFromRace(getRaceById("race-delta-1600"), "draft"),
  "race-aurora-1200": rowsFromRace(getRaceById("race-aurora-1200"), "draft"),
  "race-neon-900": rowsFromRace(getRaceById("race-neon-900"), "draft"),
  "race-heritage-1400": rowsFromRace(
    getRaceById("race-heritage-1400"),
    "published",
  ),
};

export const mockRefereeReports: RefereeReport[] = [
  {
    raceId: "race-delta-1600",
    race: "Delta Endurance 1600",
    tournament: "Mekong Masters",
    referee: refereeProfile.name,
    submittedAt: "Draft · 23 May 2026 15:40",
    checklistComplete: 3,
    checklistTotal: 4,
    violationCount: 2,
    confirmationStatus: "draft",
    summary: "Result entry ready; referee confirmation still pending.",
  },
  {
    raceId: "race-aurora-1200",
    race: "Aurora Sprint 1200",
    tournament: "Spring Velocity Cup",
    referee: "Referee Mai Anh",
    submittedAt: "Live · report in progress",
    checklistComplete: 2,
    checklistTotal: 4,
    violationCount: 1,
    confirmationStatus: "draft",
    summary: "Live race report accumulating checklist and violation notes.",
  },
  {
    raceId: "race-heritage-1400",
    race: "Heritage Classic 1400",
    tournament: "Capital Derby Week",
    referee: "Referee Thu Ha",
    submittedAt: "22 May 2026 10:05",
    checklistComplete: 4,
    checklistTotal: 4,
    violationCount: 0,
    confirmationStatus: "published",
    summary:
      "Published result is locked and distinct from referee confirmed state.",
  },
];

export const assignedRaces = refereeAssignments.map((assignment) => ({
  ...assignment,
  race: mockRaces.find((race) => race.id === assignment.raceId) ?? mockRaces[0],
}));

export function getChecklistByRaceId(raceId: string) {
  return mockRaceChecklists[raceId] ?? mockRaceChecklists["race-delta-1600"];
}

export function getViolationsByRaceId(raceId: string) {
  return mockViolations.filter((violation) => violation.raceId === raceId);
}

export function getResultRowsByRaceId(raceId: string) {
  return mockResultEntryRows[raceId] ?? mockResultEntryRows["race-delta-1600"];
}

export function getReportByRaceId(raceId: string) {
  return (
    mockRefereeReports.find((report) => report.raceId === raceId) ??
    mockRefereeReports[0]
  );
}
