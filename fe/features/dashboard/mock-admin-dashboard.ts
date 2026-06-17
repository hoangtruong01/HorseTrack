import {
  ClipboardCheck,
  Flag,
  ListChecks,
  RadioTower,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

// ─── Stat Card ────────────────────────────────────────────────────────────────

export type StatCardSemantic = "danger" | "warning" | "success" | "neutral";

export type AdminStat = {
  label: string;
  value: string;
  helper: string;
  trend?: string;
  semantic: StatCardSemantic;
  icon: LucideIcon;
  key: string;
};

// ─── Quick Action ─────────────────────────────────────────────────────────────

export type QuickAction = {
  title: string;
  description: string;
  href: string;
  label: string;
  icon: LucideIcon;
  tone: "primary" | "teal" | "yellow" | "neutral";
  key: string;
};

// ─── Race Operations ──────────────────────────────────────────────────────────

export type RaceStatus = "live" | "upcoming" | "finished";

export type RaceSummary = {
  id: string;
  name: string;
  tournament: string;
  status: RaceStatus;
  startLabel: string;
  track: string;
  horses: number;
  pendingTasks: number;
  href: string;
  key: string;
};

// ─── Attention Center ─────────────────────────────────────────────────────────

export type AttentionSeverity = "critical" | "warning" | "info";

export type AttentionItem = {
  id: string;
  severity: AttentionSeverity;
  title: string;
  description: string;
  count?: number;
  actionLabel: string;
  actionHref: string;
  key: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

export const adminStats: AdminStat[] = [
  {
    label: "Đăng ký chờ duyệt",
    value: "18",
    helper: "Horse entries chờ admin xem xét",
    trend: "Cần xử lý",
    semantic: "danger",
    icon: ClipboardCheck,
    key: "pendingRegistrations",
  },
  {
    label: "Cảnh báo hệ thống",
    value: "3",
    helper: "Sự cố cần chú ý ngay",
    trend: "Cần xử lý",
    semantic: "danger",
    icon: Flag,
    key: "systemAlerts",
  },
  {
    label: "Kết quả chờ công bố",
    value: "5",
    helper: "Kết quả đã xác nhận, chờ publish",
    trend: "Theo từng cuộc đua",
    semantic: "warning",
    icon: ListChecks,
    key: "resultsWaiting",
  },
  {
    label: "Cuộc đua đang diễn ra",
    value: "2",
    helper: "Cần giám sát race-control",
    trend: "Đang theo dõi",
    semantic: "success",
    icon: RadioTower,
    key: "liveRaces",
  },
  {
    label: "Tổng giải đấu",
    value: "8",
    helper: "Container cho các cuộc đua độc lập",
    trend: "+2 tháng này",
    semantic: "neutral",
    icon: Trophy,
    key: "tournaments",
  },
  {
    label: "Tổng người dùng",
    value: "124",
    helper: "Tất cả vai trò đã đăng ký",
    trend: "+7 tuần này",
    semantic: "neutral",
    icon: Users,
    key: "totalUsers",
  },
];

export const quickActions: QuickAction[] = [
  {
    title: "Tạo giải đấu",
    description: "Mở container mới cho bộ cuộc đua.",
    href: "/admin/tournaments/new",
    label: "Tạo ngay",
    icon: Trophy,
    tone: "neutral",
    key: "createTournament",
  },
  {
    title: "Duyệt đăng ký",
    description: "Xét duyệt horse entries cho từng cuộc đua.",
    href: "/admin/registrations",
    label: "Vào hàng chờ",
    icon: ClipboardCheck,
    tone: "yellow",
    key: "reviewRegistrations",
  },
  {
    title: "Duyệt kết quả",
    description: "Kiểm tra kết quả referee trước khi publish.",
    href: "/admin/results",
    label: "Publish queue",
    icon: ListChecks,
    tone: "teal",
    key: "reviewResults",
  },
  {
    title: "Quản lý người dùng",
    description: "Xem, ban/unban và phân quyền người dùng.",
    href: "/admin/users",
    label: "Xem tất cả",
    icon: Users,
    tone: "primary",
    key: "manageUsers",
  },
];

export const raceSummaries: RaceSummary[] = [
  {
    id: "race-live-01",
    name: "Saigon Night Sprint",
    tournament: "Southern Speed Cup",
    status: "live",
    startLabel: "Đang mở tính giờ",
    track: "Đường đua Quận 2",
    horses: 10,
    pendingTasks: 2,
    href: "/admin/races",
    key: "race-live-01",
  },
  {
    id: "race-live-02",
    name: "Derby Đường Đỏ",
    tournament: "Independence Trophy",
    status: "live",
    startLabel: "Vòng cuối",
    track: "Đài trường Long Thạnh",
    horses: 8,
    pendingTasks: 1,
    href: "/admin/races",
    key: "race-live-02",
  },
  {
    id: "race-upcoming-01",
    name: "Vòng Loại Buổi Sáng",
    tournament: "Metro Race Weekend",
    status: "upcoming",
    startLabel: "Hôm nay 14:30",
    track: "Sân Phú Thọ",
    horses: 12,
    pendingTasks: 3,
    href: "/admin/races",
    key: "race-upcoming-01",
  },
  {
    id: "race-upcoming-02",
    name: "Đặm Di Sản",
    tournament: "Autumn Stable Series",
    status: "upcoming",
    startLabel: "Ngày mai 09:00",
    track: "Đường cao thấp nguyên Đồ Lọt",
    horses: 9,
    pendingTasks: 0,
    href: "/admin/races",
    key: "race-upcoming-02",
  },
  {
    id: "race-finished-01",
    name: "Tốc Độ Ven Biển",
    tournament: "Central Coast Open",
    status: "finished",
    startLabel: "Kết thúc 11:10",
    track: "Đường đôi Nha Trang",
    horses: 7,
    pendingTasks: 0,
    href: "/admin/results",
    key: "race-finished-01",
  },
];

export const attentionItems: AttentionItem[] = [
  {
    id: "att-01",
    severity: "critical",
    title: "Đăng ký chờ duyệt",
    description: "18 horse entries đang chờ admin xem xét và phê duyệt.",
    count: 18,
    actionLabel: "Duyệt ngay",
    actionHref: "/admin/registrations",
    key: "pendingRegistrations",
  },
  {
    id: "att-02",
    severity: "critical",
    title: "Cảnh báo hệ thống",
    description: "3 sự cố cần chú ý: kết nối WebSocket bất thường.",
    count: 3,
    actionLabel: "Xem chi tiết",
    actionHref: "/admin/audit-logs",
    key: "systemAlerts",
  },
  {
    id: "att-03",
    severity: "warning",
    title: "Kết quả chờ công bố",
    description: "5 kết quả đã được referee xác nhận, chờ admin publish.",
    count: 5,
    actionLabel: "Publish queue",
    actionHref: "/admin/results",
    key: "pendingPublish",
  },
  {
    id: "att-04",
    severity: "info",
    title: "2 cuộc đua đang diễn ra",
    description: "Saigon Night Sprint và Derby Đường Đỏ đang live.",
    count: 2,
    actionLabel: "Giám sát",
    actionHref: "/admin/races",
    key: "liveMonitor",
  },
];
