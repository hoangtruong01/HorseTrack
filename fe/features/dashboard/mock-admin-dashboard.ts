import {
  CalendarPlus,
  ClipboardCheck,
  Flag,
  ListChecks,
  RadioTower,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export type AdminStat = {
  label: string;
  value: string;
  helper: string;
  trend?: string;
  tone: "red" | "teal" | "yellow" | "neutral";
  icon: LucideIcon;
  key: string;
};

export type QuickAction = {
  title: string;
  description: string;
  href: string;
  label: string;
  icon: LucideIcon;
  tone: "primary" | "teal" | "yellow" | "neutral";
  key: string;
};

export type RaceStatus = "live" | "upcoming" | "finished";

export type RaceSummary = {
  id: string;
  name: string;
  tournament: string;
  status: RaceStatus;
  startLabel: string;
  track: string;
  horses: number;
  adminNote: string;
  key: string;
};

export type AdminActivity = {
  id: string;
  time: string;
  title: string;
  description: string;
  key: string;
};

export const adminStats: AdminStat[] = [
  {
    label: "Total tournaments",
    value: "08",
    helper: "Active containers for independent races",
    trend: "+2 this month",
    tone: "neutral",
    icon: Trophy,
    key: "tournaments",
  },
  {
    label: "Total races",
    value: "36",
    helper: "Race is the primary operating unit",
    trend: "12 scheduled",
    tone: "red",
    icon: Flag,
    key: "races",
  },
  {
    label: "Live races",
    value: "02",
    helper: "Needs race-control visibility now",
    trend: "Monitor status",
    tone: "teal",
    icon: RadioTower,
    key: "liveRaces",
  },
  {
    label: "Pending registrations",
    value: "18",
    helper: "Horse entries waiting for admin review",
    trend: "Action needed",
    tone: "yellow",
    icon: ClipboardCheck,
    key: "pendingRegistrations",
  },
  {
    label: "Upcoming races",
    value: "12",
    helper: "Scheduled races in the next race window",
    trend: "Next: 14:30",
    tone: "teal",
    icon: CalendarPlus,
    key: "upcomingRaces",
  },
  {
    label: "Results waiting",
    value: "05",
    helper: "Confirmed results ready for publish review",
    trend: "Per-race publishing",
    tone: "red",
    icon: ListChecks,
    key: "resultsWaiting",
  },
];

export const quickActions: QuickAction[] = [
  {
    title: "Create Tournament",
    description: "Open a new container for a themed race set.",
    href: "/admin/tournaments/new",
    label: "Plan container",
    icon: Trophy,
    tone: "neutral",
    key: "createTournament",
  },
  {
    title: "Review Registrations",
    description: "Approve or reject horse entries for each race.",
    href: "/admin/registrations",
    label: "Review queue",
    icon: ClipboardCheck,
    tone: "yellow",
    key: "reviewRegistrations",
  },
  {
    title: "Review Results",
    description: "Check referee-confirmed race results before publish.",
    href: "/admin/results",
    label: "Publish queue",
    icon: ListChecks,
    tone: "teal",
    key: "reviewResults",
  },
];

export const raceSummaries: RaceSummary[] = [
  {
    id: "race-live-01",
    name: "Saigon Night Sprint",
    tournament: "Southern Speed Cup",
    status: "live",
    startLabel: "Lap timing open",
    track: "District 2 Track",
    horses: 10,
    adminNote: "Referee channel active",
    key: "race-live-01",
  },
  {
    id: "race-live-02",
    name: "Red Line Derby",
    tournament: "Independence Trophy",
    status: "live",
    startLabel: "Final stretch",
    track: "Long Thanh Arena",
    horses: 8,
    adminNote: "Result lock pending",
    key: "race-live-02",
  },
  {
    id: "race-upcoming-01",
    name: "Morning Qualifier Run",
    tournament: "Metro Race Weekend",
    status: "upcoming",
    startLabel: "Today 14:30",
    track: "Phu Tho Course",
    horses: 12,
    adminNote: "3 registrations pending",
    key: "race-upcoming-01",
  },
  {
    id: "race-upcoming-02",
    name: "Heritage Mile",
    tournament: "Autumn Stable Series",
    status: "upcoming",
    startLabel: "Tomorrow 09:00",
    track: "Da Lat Highland Track",
    horses: 9,
    adminNote: "Referee assigned",
    key: "race-upcoming-02",
  },
  {
    id: "race-finished-01",
    name: "Coastal Dash",
    tournament: "Central Coast Open",
    status: "finished",
    startLabel: "Finished 11:10",
    track: "Nha Trang Sand Track",
    horses: 7,
    adminNote: "Result waiting publish",
    key: "race-finished-01",
  },
];

export const adminActivities: AdminActivity[] = [
  {
    id: "act-01",
    time: "09:42",
    title: "Registration queue updated",
    description: "4 new horses added to Morning Qualifier Run.",
    key: "act01",
  },
  {
    id: "act-02",
    time: "09:18",
    title: "Race status changed",
    description: "Saigon Night Sprint moved to live monitoring.",
    key: "act02",
  },
  {
    id: "act-03",
    time: "08:55",
    title: "Referee result confirmed",
    description: "Coastal Dash result ready for admin publish review.",
    key: "act03",
  },
];

export const raceStatusCounts = {
  live: raceSummaries.filter((race) => race.status === "live").length,
  upcoming: raceSummaries.filter((race) => race.status === "upcoming").length,
  finished: raceSummaries.filter((race) => race.status === "finished").length,
};
