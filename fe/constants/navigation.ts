import {
  Bell,
  CalendarClock,
  Flag,
  Gauge,
  Home,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";

import type { NavigationItem } from "@/types/navigation";

export const publicNavigation: NavigationItem[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "Tournaments", href: "/tournaments", icon: Trophy },
  { title: "Races", href: "/races", icon: Flag },
  { title: "Live Status", href: "/races", icon: Gauge },
];

export const dashboardNavigation: NavigationItem[] = [
  {
    title: "Race Control",
    href: "/admin/races",
    role: "Admin",
    icon: Flag,
    description: "Create races, schedule, participants, results.",
  },
  {
    title: "Tournament Hub",
    href: "/admin/tournaments",
    role: "Admin",
    icon: Trophy,
    description: "Container view for independent races.",
  },
  {
    title: "Owner Stable",
    href: "/owner/horses",
    role: "Owner",
    icon: Users,
    description: "Horses, race registration, jockey assignment.",
  },
  {
    title: "Jockey Schedule",
    href: "/jockey/schedule",
    role: "Jockey",
    icon: CalendarClock,
    description: "Race assignments and timing.",
  },
  {
    title: "Referee Desk",
    href: "/referee/assignments",
    role: "Referee",
    icon: ShieldCheck,
    description: "Assigned races, violations, result confirmation.",
  },
  {
    title: "Spectator Live",
    href: "/spectator/races",
    role: "Spectator",
    icon: Bell,
    description: "Live race view and prediction status.",
  },
];
