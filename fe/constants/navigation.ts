import {
  Bell,
  ClipboardCheck,
  Flag,
  Gauge,
  Home,
  ListChecks,
  PlusCircle,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";

import type { NavigationItem } from "@/types/navigation";

export const publicNavigation: NavigationItem[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "Tournaments", href: "/tournaments", icon: Trophy },
  { title: "Races", href: "/races", icon: Flag },
  { title: "Login", href: "/login", icon: Gauge },
];

export const dashboardNavigation: NavigationItem[] = [
  {
    title: "Admin home",
    href: "/admin",
    role: "Admin",
    icon: Gauge,
    description:
      "Race control shell for tournaments, races, registrations, results.",
  },
  {
    title: "Create tournament",
    href: "/admin/tournaments/new",
    role: "Admin",
    icon: PlusCircle,
    description: "Future entry for tournament container creation.",
  },
  {
    title: "Create race",
    href: "/admin/races/new",
    role: "Admin",
    icon: Flag,
    description: "Future entry for independent race scheduling.",
  },
  {
    title: "Registrations",
    href: "/admin/registrations",
    role: "Admin",
    icon: ClipboardCheck,
    description: "Horse registration moderation queue.",
  },
  {
    title: "Results",
    href: "/admin/results",
    role: "Admin",
    icon: ListChecks,
    description: "Per-race result review and publish queue.",
  },
  {
    title: "Owner home",
    href: "/owner",
    role: "Owner",
    icon: Users,
    description: "Stable shell for horses, registration, jockey handoff.",
  },
  {
    title: "Jockey home",
    href: "/jockey",
    role: "Jockey",
    icon: Flag,
    description: "Mobile-first assignment and schedule shell.",
  },
  {
    title: "Referee home",
    href: "/referee",
    role: "Referee",
    icon: ShieldCheck,
    description: "Tablet-first assigned race and result shell.",
  },
  {
    title: "Spectator home",
    href: "/spectator",
    role: "Spectator",
    icon: Bell,
    description: "Race view, prediction, notification shell.",
  },
];
