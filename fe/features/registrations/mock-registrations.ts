export type RegistrationStatus = "pending" | "approved" | "rejected";

export type RaceRegistration = {
  id: string;
  horse: string;
  horseCode: string;
  owner: string;
  ownerEmail: string;
  raceId: string;
  race: string;
  tournament: string;
  submittedAt: string;
  status: RegistrationStatus;
  eligibility: string;
  reviewNote: string;
  adminTrail: string[];
};

export const mockRegistrations: RaceRegistration[] = [
  {
    id: "reg-crimson-aurora",
    horse: "Crimson Bolt",
    horseCode: "HB-14",
    owner: "Linh Tran Stable",
    ownerEmail: "linh.stable@example.test",
    raceId: "race-aurora-1200",
    race: "Aurora Sprint 1200",
    tournament: "Spring Velocity Cup",
    submittedAt: "24 May 2026 · 07:42",
    status: "pending",
    eligibility:
      "Horse profile approved · medical check current · slot available",
    reviewNote: "Review lane capacity and owner declaration before approval.",
    adminTrail: [
      "Submitted by owner",
      "Eligibility snapshot generated",
      "Awaiting admin moderation",
    ],
  },
  {
    id: "reg-midnight-neon",
    horse: "Midnight Alloy",
    horseCode: "HB-22",
    owner: "Saigon Equine",
    ownerEmail: "ops@saigonequine.example.test",
    raceId: "race-neon-900",
    race: "Neon Dash 900",
    tournament: "Night Circuit Trophy",
    submittedAt: "24 May 2026 · 06:18",
    status: "approved",
    eligibility: "Horse approved · jockey pending owner handoff",
    reviewNote:
      "Approved for mock participant queue. No backend mutation performed.",
    adminTrail: [
      "Submitted by owner",
      "Reviewed by Admin Control",
      "Approved for race queue",
    ],
  },
  {
    id: "reg-silver-delta",
    horse: "Silver Apex",
    horseCode: "HB-08",
    owner: "North Track Club",
    ownerEmail: "north.track@example.test",
    raceId: "race-delta-1600",
    race: "Delta Endurance 1600",
    tournament: "Mekong Masters",
    submittedAt: "23 May 2026 · 11:03",
    status: "rejected",
    eligibility: "Medical document expired in mock review snapshot",
    reviewNote:
      "Reject reason placeholder: owner must resubmit health clearance.",
    adminTrail: [
      "Submitted by owner",
      "Document mismatch flagged",
      "Rejected with reason placeholder",
    ],
  },
  {
    id: "reg-neon-heritage",
    horse: "Neon Stirrup",
    horseCode: "HB-19",
    owner: "Viet Derby House",
    ownerEmail: "stable@vietderby.example.test",
    raceId: "race-heritage-1400",
    race: "Heritage Classic 1400",
    tournament: "Capital Derby Week",
    submittedAt: "22 May 2026 · 08:35",
    status: "approved",
    eligibility: "Approved historical registration for published race state",
    reviewNote: "Closed race example. Display-only moderation record.",
    adminTrail: [
      "Submitted by owner",
      "Approved",
      "Race later moved to result published",
    ],
  },
];

export function getRegistrationById(registrationId: string) {
  return (
    mockRegistrations.find(
      (registration) => registration.id === registrationId,
    ) ?? mockRegistrations[0]
  );
}
