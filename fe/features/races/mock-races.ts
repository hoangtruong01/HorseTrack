export type RaceStatus = "scheduled" | "live" | "finished" | "result_published";

export type ParticipantStatus =
  | "confirmed"
  | "checked_in"
  | "pending_assignment"
  | "scratched";

export type RaceParticipant = {
  id: string;
  horse: string;
  horseCode: string;
  owner: string;
  jockey: string;
  lane: number;
  order: number;
  status: ParticipantStatus;
};

export type RaceTimelineStep = {
  id: string;
  label: string;
  time: string;
  status: "complete" | "current" | "pending";
  description: string;
};

export type Race = {
  id: string;
  name: string;
  tournament: string;
  status: RaceStatus;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  track: string;
  distance: string;
  surface: string;
  capacity: number;
  participants: RaceParticipant[];
  referee: {
    name: string;
    license: string;
    status: string;
  };
  metadata: {
    createdBy: string;
    createdAt: string;
    stewardNote: string;
  };
  timeline: RaceTimelineStep[];
};

const baseParticipants: RaceParticipant[] = [
  {
    id: "p-01",
    horse: "Crimson Bolt",
    horseCode: "HB-14",
    owner: "Linh Tran Stable",
    jockey: "Minh Khoa",
    lane: 1,
    order: 1,
    status: "checked_in",
  },
  {
    id: "p-02",
    horse: "Midnight Alloy",
    horseCode: "HB-22",
    owner: "Saigon Equine",
    jockey: "Gia Huy",
    lane: 2,
    order: 2,
    status: "confirmed",
  },
  {
    id: "p-03",
    horse: "Delta Comet",
    horseCode: "HB-31",
    owner: "Red River Farm",
    jockey: "An Nhi",
    lane: 3,
    order: 3,
    status: "confirmed",
  },
  {
    id: "p-04",
    horse: "Silver Apex",
    horseCode: "HB-08",
    owner: "North Track Club",
    jockey: "Bao Nam",
    lane: 4,
    order: 4,
    status: "pending_assignment",
  },
  {
    id: "p-05",
    horse: "Neon Stirrup",
    horseCode: "HB-19",
    owner: "Viet Derby House",
    jockey: "Thanh Vy",
    lane: 5,
    order: 5,
    status: "confirmed",
  },
];

const timeline = (status: RaceStatus): RaceTimelineStep[] => {
  const live = status === "live";
  const finished = status === "finished" || status === "result_published";
  const published = status === "result_published";

  return [
    {
      id: "schedule",
      label: "Scheduled",
      time: "08:00",
      status: "complete",
      description: "Race schedule locked for admin preview.",
    },
    {
      id: "prep",
      label: "Participant prep",
      time: "09:10",
      status: live ? "current" : finished || published ? "complete" : "pending",
      description: "Participants, lanes, referee summary visible.",
    },
    {
      id: "live",
      label: "Live race",
      time: "10:00",
      status: live ? "current" : finished || published ? "complete" : "pending",
      description: "Display-only race status, no socket integration.",
    },
    {
      id: "finish",
      label: "Finished",
      time: "10:18",
      status: finished || published ? "complete" : "pending",
      description: "Race finished marker for later result workflow.",
    },
    {
      id: "publish",
      label: "Result published",
      time: "11:00",
      status: published ? "complete" : "pending",
      description: "Visible only as status, no publish workflow here.",
    },
  ];
};

export const mockRaces: Race[] = [
  {
    id: "race-aurora-1200",
    name: "Aurora Sprint 1200",
    tournament: "Spring Velocity Cup",
    status: "live",
    date: "24 May 2026",
    startTime: "10:00",
    endTime: "10:18",
    location: "Saigon Grand Track",
    track: "North Loop",
    distance: "1,200m",
    surface: "Dry turf",
    capacity: 8,
    participants: baseParticipants,
    referee: {
      name: "Referee Mai Anh",
      license: "RF-2048",
      status: "Assigned · on deck",
    },
    metadata: {
      createdBy: "Admin Control",
      createdAt: "18 May 2026",
      stewardNote: "Wind check display-only. No live socket in Phase 4C.",
    },
    timeline: timeline("live"),
  },
  {
    id: "race-neon-900",
    name: "Neon Dash 900",
    tournament: "Night Circuit Trophy",
    status: "scheduled",
    date: "25 May 2026",
    startTime: "19:30",
    endTime: "19:45",
    location: "Da Nang Coastal Track",
    track: "Floodlight Straight",
    distance: "900m",
    surface: "Synthetic",
    capacity: 6,
    participants: baseParticipants.slice(0, 4),
    referee: {
      name: "Referee Quoc Bao",
      license: "RF-1052",
      status: "Assigned",
    },
    metadata: {
      createdBy: "Race Ops",
      createdAt: "20 May 2026",
      stewardNote: "Evening race; participant check-in pending.",
    },
    timeline: timeline("scheduled"),
  },
  {
    id: "race-delta-1600",
    name: "Delta Endurance 1600",
    tournament: "Mekong Masters",
    status: "finished",
    date: "23 May 2026",
    startTime: "15:00",
    endTime: "15:28",
    location: "Can Tho Heritage Oval",
    track: "River Bend",
    distance: "1,600m",
    surface: "Soft turf",
    capacity: 10,
    participants: baseParticipants.map((p) => ({ ...p, status: "checked_in" })),
    referee: {
      name: "Referee Hoang Lam",
      license: "RF-3310",
      status: "Report pending",
    },
    metadata: {
      createdBy: "Admin Control",
      createdAt: "16 May 2026",
      stewardNote:
        "Finished status only; no result publishing workflow in this phase.",
    },
    timeline: timeline("finished"),
  },
  {
    id: "race-heritage-1400",
    name: "Heritage Classic 1400",
    tournament: "Capital Derby Week",
    status: "result_published",
    date: "22 May 2026",
    startTime: "09:20",
    endTime: "09:42",
    location: "Hanoi Imperial Track",
    track: "Classic Oval",
    distance: "1,400m",
    surface: "Dry turf",
    capacity: 8,
    participants: baseParticipants
      .slice(0, 5)
      .map((p) => ({ ...p, status: "checked_in" })),
    referee: { name: "Referee Thu Ha", license: "RF-4420", status: "Closed" },
    metadata: {
      createdBy: "Race Ops",
      createdAt: "14 May 2026",
      stewardNote: "Published status shown for visibility only.",
    },
    timeline: timeline("result_published"),
  },
];

export function getRaceById(raceId: string) {
  return mockRaces.find((race) => race.id === raceId) ?? mockRaces[0];
}
