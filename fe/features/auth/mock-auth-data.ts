import {
  Crown,
  Flag,
  ShieldCheck,
  Sparkles,
  Telescope,
  Trophy,
} from "lucide-react";

import type { AuthRole, RolePreview } from "./types";

export const defaultDemoRole: AuthRole = "owner";

export const rolePreviews: RolePreview[] = [
  {
    role: "admin",
    label: "Admin",
    eyebrow: "Control tower",
    description:
      "Operate tournaments, race schedules, approvals, result publishing, and user role governance.",
    entryPath: "/admin",
    icon: Crown,
    highlights: ["User governance", "Race operations", "Result publish"],
  },
  {
    role: "owner",
    label: "Horse Owner",
    eyebrow: "Stable lane",
    description:
      "Manage horses, track registrations, invite jockeys, and follow race outcomes per independent race.",
    entryPath: "/owner",
    icon: ShieldCheck,
    highlights: ["Horse profiles", "Race registration", "Jockey invites"],
  },
  {
    role: "jockey",
    label: "Jockey",
    eyebrow: "Starting gate",
    description:
      "Review assignments, confirm rides, inspect race schedule, and stay aligned before race start.",
    entryPath: "/jockey",
    icon: Trophy,
    highlights: ["Assignments", "Schedule", "Ride status"],
  },
  {
    role: "referee",
    label: "Referee",
    eyebrow: "Race control",
    description:
      "Monitor assigned races, capture violations, confirm results, and prepare reports for publishing.",
    entryPath: "/referee",
    icon: Flag,
    highlights: ["Race review", "Violation log", "Result confirm"],
  },
  {
    role: "spectator",
    label: "Spectator",
    eyebrow: "Grandstand",
    description:
      "Browse races, follow live status, make mock predictions, and view published rankings.",
    entryPath: "/spectator",
    icon: Telescope,
    highlights: ["Race discovery", "Prediction", "Ranking view"],
  },
];

export const authAssurances = [
  "Mock-first demo only — no API request is made.",
  "Future auth should use httpOnly cookies for session security.",
  "No localStorage JWT, no token handling, no real middleware in Phase 3.",
];

export const authStats = [
  { label: "Roles", value: "05" },
  { label: "Mock session", value: "UI" },
  { label: "API calls", value: "0" },
];

export const roleIcon = Sparkles;
