import {
  Bell,
  ClipboardCheck,
  FileText,
  Flag,
  Gauge,
  Home,
  ListChecks,
  PlusCircle,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";

import type { NavigationItem } from "@/types/navigation";

export const publicNavigation: NavigationItem[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "Tournaments", href: "/tournaments", icon: Trophy },
  { title: "Races", href: "/races", icon: Flag },
  { title: "Rankings", href: "#", icon: Gauge },
  { title: "Predictions", href: "#", icon: Bell },
  { title: "News", href: "#", icon: ClipboardCheck },
  { title: "Contact", href: "/#contact", icon: Users },
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
    title: "Cashout Queue",
    href: "/admin/cashouts",
    role: "Admin",
    icon: Wallet,
    description: "Process points redemption requests for Owners and Jockeys.",
  },
  {
    title: "Audit Logs",
    href: "/admin/audit-logs",
    role: "Admin",
    icon: FileText,
    description: "View system operations and secure transactions trails.",
  },
  {
    title: "Owner home",
    href: "/owner",
    role: "Owner",
    icon: Users,
    description: "Stable shell for horses, registration, jockey handoff.",
  },
  {
    title: "My Wallet",
    href: "/owner/wallet",
    role: "Owner",
    icon: Wallet,
    description: "View rewards ledger, split earnings, and request cashouts.",
  },
  {
    title: "Jockey home",
    href: "/jockey",
    role: "Jockey",
    icon: Flag,
    description: "Mobile-first assignment and schedule shell.",
  },
  {
    title: "My Wallet",
    href: "/jockey/wallet",
    role: "Jockey",
    icon: Wallet,
    description: "View jockey splitting rewards ledger and cashouts.",
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
  {
    title: "My Wallet",
    href: "/spectator/wallet",
    role: "Spectator",
    icon: Wallet,
    description: "Xem điểm thưởng free tích lũy từ dự đoán và đổi thưởng tại quầy.",
  },
];
