"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Compass,
  UserCheck,
  Trophy,
  Target,
  CalendarClock,
  Sparkles,
  Users,
  Flag,
  ChevronRight,
  Mail,
  Clock,
  Tv,
  MapPin,
  Calendar,
  DollarSign,
  Activity,
  Award
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { tournamentsApi, racesApi, rankingsApi, TournamentItem, RaceItem, RankingEntry, JockeyRankingEntry } from "@/lib/api-client";
import createGlobe from "cobe";

// Chức năng cốt lõi
const coreFeatures = [
  {
    key: "feat1",
    title: "Quản lý giải đấu",
    desc: "Thiết lập quy mô, thời gian đăng ký và phân bổ cơ cấu giải thưởng tự động.",
    icon: Trophy,
    step: "01",
    glowClass: "hover:shadow-[0_0_35px_rgba(225,6,0,0.14)] hover:border-red-500/40",
    iconClass: "text-red-500 bg-red-500/10 border-red-500/20 group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500 group-hover:shadow-[0_0_15px_rgba(225,6,0,0.35)]",
    textColor: "group-hover:text-red-500",
    gradient: "from-red-500/0 via-red-500/[0.015] to-red-500/[0.06]",
    gridClass: "lg:col-span-2 lg:row-span-2 min-h-[320px]"
  },
  {
    key: "feat2",
    title: "Đăng ký ngựa đua",
    desc: "Hồ sơ sức khỏe, giống loài và chỉ số sức mạnh được cập nhật minh bạch.",
    icon: Compass,
    step: "02",
    glowClass: "hover:shadow-[0_0_35px_rgba(248,205,70,0.14)] hover:border-[#F8CD46]/40",
    iconClass: "text-[#F8CD46] bg-[#F8CD46]/10 border-[#F8CD46]/20 group-hover:bg-[#F8CD46] group-hover:text-black group-hover:border-[#F8CD46] group-hover:shadow-[0_0_15px_rgba(248,205,70,0.35)]",
    textColor: "group-hover:text-[#F8CD46]",
    gradient: "from-[#F8CD46]/0 via-[#F8CD46]/[0.015] to-[#F8CD46]/0.05",
    gridClass: "lg:col-span-1 lg:row-span-1 min-h-[155px]"
  },
  {
    key: "feat3",
    title: "Tuyển chọn nài ngựa",
    desc: "Hệ thống ký hợp đồng và kết nối nài ngựa phù hợp với từng chiến mã.",
    icon: UserCheck,
    step: "03",
    glowClass: "hover:shadow-[0_0_35px_rgba(6,126,106,0.14)] hover:border-[#067E6A]/40",
    iconClass: "text-[#067E6A] bg-[#067E6A]/10 border-[#067E6A]/20 group-hover:bg-[#067E6A] group-hover:text-white group-hover:border-[#067E6A] group-hover:shadow-[0_0_15px_rgba(6,126,106,0.35)]",
    textColor: "group-hover:text-[#067E6A]",
    gradient: "from-[#067E6A]/0 via-[#067E6A]/[0.01] to-[#067E6A]/0.05",
    gridClass: "lg:col-span-1 lg:row-span-1 min-h-[155px]"
  },
  {
    key: "feat4",
    title: "Lịch trình thông minh",
    desc: "Tự động sắp xếp các lượt chạy dựa trên điều kiện thời tiết và mặt sân.",
    icon: CalendarClock,
    step: "04",
    glowClass: "hover:shadow-[0_0_35px_rgba(59,130,246,0.14)] hover:border-blue-500/40",
    iconClass: "text-blue-500 bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.35)]",
    textColor: "group-hover:text-blue-500",
    gradient: "from-blue-500/0 via-blue-500/[0.015] to-blue-500/0.05",
    gridClass: "lg:col-span-2 lg:row-span-1 min-h-[155px]"
  },
  {
    key: "feat5",
    title: "Báo cáo của trọng tài",
    desc: "Ghi nhận lỗi vi phạm trực tiếp bằng hình ảnh và video thời gian thực.",
    icon: Sparkles,
    step: "05",
    glowClass: "hover:shadow-[0_0_35px_rgba(168,85,247,0.14)] hover:border-purple-500/40",
    iconClass: "text-purple-500 bg-purple-500/10 border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-500 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.35)]",
    textColor: "group-hover:text-purple-500",
    gradient: "from-purple-500/0 via-purple-500/[0.015] to-purple-500/0.05",
    gridClass: "lg:col-span-1 lg:row-span-1 min-h-[155px]"
  },
  {
    key: "feat6",
    title: "Kết quả tức thời",
    desc: "Cập nhật chính xác thứ hạng chung cuộc ngay khi ngựa đua cán đích.",
    icon: Flag,
    step: "06",
    glowClass: "hover:shadow-[0_0_35px_rgba(236,72,153,0.14)] hover:border-pink-500/40",
    iconClass: "text-pink-500 bg-pink-500/10 border-pink-500/20 group-hover:bg-pink-500 group-hover:text-white group-hover:border-pink-500 group-hover:shadow-[0_0_15px_rgba(236,72,153,0.35)]",
    textColor: "group-hover:text-pink-500",
    gradient: "from-pink-500/0 via-pink-500/[0.015] to-pink-500/0.05",
    gridClass: "lg:col-span-1 lg:row-span-1 min-h-[155px]"
  },
  {
    key: "feat8",
    title: "Dự đoán & Phần thưởng",
    desc: "Hệ thống điểm thưởng kích thích tương tác, dự đoán thông minh với phân tích AI.",
    icon: Tv,
    step: "07",
    glowClass: "hover:shadow-[0_0_35px_rgba(6,182,212,0.14)] hover:border-cyan-500/40",
    iconClass: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-500 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.35)]",
    textColor: "group-hover:text-cyan-500",
    gradient: "from-cyan-500/0 via-cyan-500/[0.015] to-cyan-500/0.06",
    gridClass: "lg:col-span-2 lg:row-span-1 min-h-[155px]"
  },
];

// Fallback rankings
const fallbackHorseRankings: RankingEntry[] = [
  { horseId: "1", horseName: "Sấm Sét (Thunder Bolt)", breed: "Thoroughbred", totalPoints: 1200, totalRaces: 15, wins: 8 },
  { horseId: "2", horseName: "Bão Cát (Desert Storm)", breed: "Arabian", totalPoints: 950, totalRaces: 12, wins: 5 },
  { horseId: "3", horseName: "Tia Chớp (Flash)", breed: "Quarter Horse", totalPoints: 880, totalRaces: 14, wins: 4 },
  { horseId: "4", horseName: "Huyền Thoại (Legacy)", breed: "Appaloosa", totalPoints: 720, totalRaces: 10, wins: 3 },
  { horseId: "5", horseName: "Kỵ Sĩ Bóng Đêm", breed: "Mustang", totalPoints: 650, totalRaces: 9, wins: 2 },
];

const fallbackJockeyRankings: JockeyRankingEntry[] = [
  { jockeyUserId: "1", jockeyName: "Trần Văn An", experienceYears: 8, totalPoints: 1400, totalRaces: 18, wins: 9 },
  { jockeyUserId: "2", jockeyName: "Nguyễn Minh Hải", experienceYears: 6, totalPoints: 1100, totalRaces: 15, wins: 7 },
  { jockeyUserId: "3", jockeyName: "Lê Hoàng Đức", experienceYears: 5, totalPoints: 920, totalRaces: 13, wins: 5 },
  { jockeyUserId: "4", jockeyName: "Phạm Quốc Bảo", experienceYears: 4, totalPoints: 800, totalRaces: 12, wins: 4 },
  { jockeyUserId: "5", jockeyName: "Vũ Tiến Đạt", experienceYears: 3, totalPoints: 680, totalRaces: 10, wins: 3 },
];

const GLOBE_MARKERS = [
  { name: "Việt Nam", location: [10.77, 106.65] },
  { name: "UAE (Dubai)", location: [25.15, 55.30] },
  { name: "Mỹ (Kentucky)", location: [38.20, -85.77] },
  { name: "Anh (London)", location: [51.41, -0.68] },
  { name: "Úc (Melbourne)", location: [-37.78, 144.90] },
  { name: "Nhật Bản (Tokyo)", location: [35.66, 139.48] }
];

export default function Home() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [races, setRaces] = useState<RaceItem[]>([]);
  const [horseRankings, setHorseRankings] = useState<RankingEntry[]>([]);
  const [jockeyRankings, setJockeyRankings] = useState<JockeyRankingEntry[]>([]);
  
  const globeCanvasRef = useRef<HTMLCanvasElement>(null);
  const markerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let animationId: number;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let phi = 0;

    const canvas = globeCanvasRef.current;
    if (!canvas) return;

    const isDark = resolvedTheme === "dark";
    const dpr = window.devicePixelRatio || 1;

    globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: 450 * dpr,
      height: 450 * dpr,
      phi: 0,
      theta: 0.25,
      dark: isDark ? 1 : 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [1, 1, 1],
      markerColor: [225 / 255, 6 / 255, 0],
      glowColor: isDark ? [0.15, 0.15, 0.22] : [1, 1, 1],
      markers: GLOBE_MARKERS.map(m => ({ location: m.location as [number, number], size: 0.05 })),
    });

    const theta = 0.25; // Góc nghiêng của cobe
    const r = 225; // Bán kính hiển thị (width / 2)
    const center = 225; // Tâm của container (width / 2)

    function animate() {
      phi += 0.005;
      globe?.update({ phi });

      // Cập nhật vị trí nhãn quốc gia 2D đè lên canvas WebGL
      GLOBE_MARKERS.forEach((m, idx) => {
        const el = markerRefs.current[idx];
        if (!el) return;

        // Chuyển Lat/Lon sang Radian
        const latRad = (m.location[0] * Math.PI) / 180;
        // Cộng phi vào kinh độ để quay theo quả cầu
        const lonRad = (m.location[1] * Math.PI) / 180 + phi;

        // Tọa độ 3D trên quả cầu đơn vị
        const x = Math.cos(latRad) * Math.sin(lonRad);
        const y = Math.sin(latRad);
        const z = Math.cos(latRad) * Math.cos(lonRad);

        // Quay quanh trục X một góc nghiêng theta
        const yRot = y * Math.cos(theta) - z * Math.sin(theta);
        const zRot = y * Math.sin(theta) + z * Math.cos(theta);

        // zRot > 0.05 nghĩa là điểm nằm ở mặt trước quả địa cầu
        if (zRot > 0.05) {
          // Tính toán vị trí screenX, screenY trong container 450x450
          const screenX = center + x * r * 0.95;
          const screenY = center - yRot * r * 0.95;

          el.style.left = `${screenX}px`;
          el.style.top = `${screenY}px`;
          el.style.opacity = "1";
          
          // Tạo hiệu ứng scale nhỏ lại khi điểm xoay về phía rìa
          const scale = 0.7 + zRot * 0.3;
          el.style.transform = `translate(-50%, -50%) scale(${scale})`;
        } else {
          el.style.opacity = "0";
        }
      });

      animationId = requestAnimationFrame(animate);
    }
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      globe?.destroy();
      globe = null;
    };
  }, [mounted, resolvedTheme]);
  
  // Stats thực tế + fallback
  const [stats, setStats] = useState({
    tournaments: 0,
    races: 0,
    horses: 256,
    jockeys: 98,
  });

  // Tìm cuộc đua theo các trạng thái
  const [liveRace, setLiveRace] = useState<RaceItem | null>(null);
  const [upcomingRace, setUpcomingRace] = useState<RaceItem | null>(null);
  const [finishedRace, setFinishedRace] = useState<RaceItem | null>(null);
  const [countdown, setCountdown] = useState("00:00:00");

  // Fetch dữ liệu thật từ Backend
  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);
        
        // 1. Tải danh sách giải đấu
        const tourRes = await tournamentsApi.list({ page: 1, limit: 100 });
        const tourList = tourRes?.data || [];
        setTournaments(tourList);

        // 2. Tải danh sách trận đua
        const raceRes = await racesApi.list({ page: 1, limit: 100 });
        const raceList = raceRes?.data || [];
        setRaces(raceList);

        // Phân loại các trận đua thực tế
        // LIVE
        const live = raceList.find(r => r.status === "LIVE");
        setLiveRace(live || null);

        // UPCOMING (SCHEDULED, CHECKING, READY)
        const upcomingList = raceList.filter(r => ["SCHEDULED", "CHECKING", "READY"].includes(r.status));
        const nextUpcoming = upcomingList.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
        setUpcomingRace(nextUpcoming || null);

        // FINISHED (FINISHED, RESULT_PUBLISHED)
        const finishedList = raceList.filter(r => ["FINISHED", "RESULT_PUBLISHED"].includes(r.status));
        const lastFinished = finishedList.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];
        setFinishedRace(lastFinished || null);

        // 3. Gọi API đếm số lượng Horse và Jockey an toàn (không dùng apiFetch để tránh redirect khi chưa đăng nhập)
        let horsesCount = 184; // Mockup đẹp nếu lỗi
        let jockeysCount = 76;   // Mockup đẹp nếu lỗi

        try {
          const resHorses = await fetch("/api/v1/horses?limit=1");
          if (resHorses.ok) {
            const resJson = await resHorses.json();
            if (resJson && resJson.success) {
              horsesCount = resJson.meta?.total || resJson.data?.meta?.total || resJson.data?.length || horsesCount;
            } else if (resJson && resJson.meta) {
              horsesCount = resJson.meta.total || horsesCount;
            }
          }
        } catch (e) {
          console.log("Horses API require login, using placeholder count.");
        }

        try {
          const resJockeys = await fetch("/api/v1/jockeys/admin/all?limit=1");
          if (resJockeys.ok) {
            const resJson = await resJockeys.json();
            if (resJson && resJson.success) {
              jockeysCount = resJson.meta?.total || resJson.data?.meta?.total || resJson.data?.length || jockeysCount;
            } else if (resJson && resJson.meta) {
              jockeysCount = resJson.meta.total || jockeysCount;
            }
          }
        } catch (e) {
          console.log("Jockeys API require login, using placeholder count.");
        }

        setStats({
          tournaments: tourRes?.meta?.total || tourList.length,
          races: raceRes?.meta?.total || raceList.length,
          horses: horsesCount,
          jockeys: jockeysCount
        });

        // 4. Tải bảng xếp hạng ngựa toàn cầu
        try {
          const horseRankRes = await rankingsApi.getGlobalHorseRankings();
          if (horseRankRes && horseRankRes.length > 0) {
            setHorseRankings(horseRankRes.slice(0, 5));
          } else {
            setHorseRankings(fallbackHorseRankings);
          }
        } catch (e) {
          console.log("Error loading horse rankings, using fallback.");
          setHorseRankings(fallbackHorseRankings);
        }

        // 5. Tải bảng xếp hạng nài ngựa toàn cầu
        try {
          const jockeyRankRes = await rankingsApi.getGlobalJockeyRankings();
          if (jockeyRankRes && jockeyRankRes.length > 0) {
            setJockeyRankings(jockeyRankRes.slice(0, 5));
          } else {
            setJockeyRankings(fallbackJockeyRankings);
          }
        } catch (e) {
          console.log("Error loading jockey rankings, using fallback.");
          setJockeyRankings(fallbackJockeyRankings);
        }

      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", err);
      } finally {
        setLoading(false);
      }
    }

    initData();
  }, []);

  // Đồng hồ đếm ngược cho trận đua sắp diễn ra
  useEffect(() => {
    let targetTime = 0;
    if (upcomingRace) {
      targetTime = new Date(upcomingRace.startTime).getTime();
    } else {
      // Nếu không có trận nào sắp diễn ra, đếm ngược giả lập 2 giờ để giữ UI động sinh động
      targetTime = new Date().getTime() + 2 * 60 * 60 * 1000;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setCountdown("00:00:00");
        clearInterval(interval);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(
          [h, m, s].map((v) => String(v).padStart(2, "0")).join(":")
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [upcomingRace]);

  // Format hiển thị tiền thưởng
  const formatPrize = (val?: number) => {
    if (!val) return "---";
    return val.toLocaleString("vi-VN") + " VND";
  };

  // Format ngày tháng thân thiện
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }) + " " + date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* 1. Header (Navbar) */}
      <AppHeader />

      {/* 2. Hero Section */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center py-16 overflow-hidden">
        {/* Background Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.12] pointer-events-none mix-blend-lighten"
          style={{ backgroundImage: "url('/hero_horse_racing.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/90 to-primary/5 pointer-events-none" />
        
        {/* Decorative Neon Blurs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-[#067E6A]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          
          {/* Left Block: Hero Intro */}
          <div className="space-y-8 animate-fade-in duration-700">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-primary">
              <span className="size-2 rounded-full bg-primary animate-ping" />
              {t("homepage.badge", "NỀN TẢNG GIẢI ĐẤU TRỰC TUYẾN")}
            </span>

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl uppercase">
              {t("homepage.heroTitle1", "Quản Lý Giải Đua Ngựa")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-amber-400 drop-shadow-[0_2px_15px_rgba(225,6,0,0.15)]">
                {t("homepage.heroTitleHighlight", "Thông Minh & Toàn Diện")}
              </span>
            </h1>

            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground font-medium">
              {t(
                "homepage.heroSubtitle",
                "Đăng ký chiến mã, kết nối nài ngựa chuyên nghiệp, xếp lịch đua tự động, cập nhật kết quả thời gian thực và tham gia dự đoán kịch tính.",
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/register"
                className="group relative flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-8 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/95 transition-all duration-300 shadow-[0_8px_30px_rgb(225,6,0,0.3)] hover:shadow-[0_8px_35px_rgb(225,6,0,0.5)] hover:-translate-y-0.5 active:translate-y-0"
              >
                {t("homepage.getStarted", "Bắt Đầu Ngay")}
                <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/races"
                className="flex h-14 items-center justify-center gap-2.5 rounded-2xl border border-border bg-card/50 hover:bg-card px-8 text-sm font-bold uppercase tracking-wider text-foreground transition-all duration-300 hover:border-primary/30 hover:-translate-y-0.5"
              >
                <CalendarClock className="size-4.5 text-primary" />
                {t("homepage.viewRaces", "Lịch Đua Đang Chạy")}
              </Link>
            </div>
          </div>

          {/* Right Block: Live Status Board */}
          <div className="rounded-[2.5rem] border border-border/80 bg-card/60 p-6 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl space-y-6 relative overflow-hidden animate-fade-in duration-1000">
            {/* Top glass reflection */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-border/50 pb-4 relative z-10">
              <div className="flex items-center gap-2">
                <Activity className="size-5 text-primary animate-pulse" />
                <h2 className="text-lg font-black uppercase tracking-wider text-foreground">
                  {t("homepage.liveRaceStatus", "Bảng Đua Thực Tế")}
                </h2>
              </div>
              <Link
                href="/races"
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
              >
                {t("homepage.viewAllRaces", "Xem Tất Cả")}
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="space-y-4 relative z-10">
              {/* Card 1: LIVE RACE */}
              {loading ? (
                <div className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
              ) : liveRace ? (
                <div className="group relative rounded-2xl border border-primary/30 bg-primary/5 p-4.5 hover:border-primary/60 transition-all duration-300">
                  <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-primary/20 border border-primary/40 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                    <span className="size-1.5 rounded-full bg-primary animate-ping" />
                    Đang Đua
                  </div>
                  <span className="inline-block rounded-md bg-primary px-2.5 py-0.5 text-[9px] font-black tracking-wider text-primary-foreground">
                    LIVE
                  </span>
                  <h3 className="mt-2 font-bold uppercase text-base text-foreground group-hover:text-primary transition-colors">
                    {liveRace.name}
                  </h3>
                  <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" /> {liveRace.location || "Sân vận động"}
                    </span>
                    <span className="font-mono text-primary font-bold flex items-center gap-1">
                      <Tv className="size-3.5" /> Trực tiếp
                    </span>
                  </div>
                  <Link
                    href={`/races/${liveRace._id}`}
                    className="mt-3.5 flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest transition hover:bg-primary/90"
                  >
                    Xem Trực Tiếp
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              ) : (
                <div className="group relative rounded-2xl border border-border/60 bg-muted/10 p-4.5 text-center">
                  <span className="inline-block rounded-md bg-muted text-muted-foreground px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                    LIVE
                  </span>
                  <p className="mt-2 text-xs text-muted-foreground font-medium">Hiện không có cuộc đua nào đang diễn ra trực tiếp.</p>
                  <Link
                    href="/races"
                    className="mt-3 inline-flex text-xs font-bold text-primary hover:underline"
                  >
                    Xem lịch trình đua &rarr;
                  </Link>
                </div>
              )}

              {/* Card 2: UPCOMING RACE */}
              {loading ? (
                <div className="h-28 rounded-2xl bg-muted/40 animate-pulse" />
              ) : upcomingRace ? (
                <div className="group relative rounded-2xl border border-border/80 bg-card/40 p-4.5 hover:border-chart-3/45 transition-all duration-300">
                  <div className="absolute right-4 top-4 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#F8CD46]">
                    <Clock className="size-3.5 animate-spin-slow" />
                    Khởi tranh: {countdown}
                  </div>
                  <span className="inline-block rounded-md border border-[#F8CD46]/30 bg-[#F8CD46]/10 px-2.5 py-0.5 text-[9px] font-black tracking-wider text-[#F8CD46]">
                    SẮP DIỄN RA
                  </span>
                  <h3 className="mt-2 font-bold uppercase text-base text-foreground group-hover:text-[#F8CD46] transition-colors">
                    {upcomingRace.name}
                  </h3>
                  <div className="mt-2.5 flex flex-col gap-1 text-xs text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" /> {upcomingRace.location || "Trường đua"}
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="flex items-center gap-1 text-[#F8CD46]">
                        <Trophy className="size-3.5" /> Thưởng: {formatPrize(upcomingRace.prize)}
                      </span>
                      <span className="font-mono text-muted-foreground">{formatDate(upcomingRace.startTime)}</span>
                    </div>
                  </div>
                  <Link
                    href={`/races/${upcomingRace._id}`}
                    className="mt-3.5 flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#F8CD46]/30 bg-[#F8CD46]/5 hover:bg-[#F8CD46]/10 text-[#F8CD46] text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Đặt Cược Dự Đoán
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              ) : (
                <div className="group relative rounded-2xl border border-border/60 bg-muted/10 p-4.5 text-center">
                  <span className="inline-block rounded-md bg-[#F8CD46]/10 text-[#F8CD46] border border-[#F8CD46]/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                    SẮP DIỄN RA
                  </span>
                  <p className="mt-2 text-xs text-muted-foreground font-medium">Hiện không có cuộc đua nào sắp diễn ra.</p>
                </div>
              )}

              {/* Card 3: FINISHED RACE */}
              {loading ? (
                <div className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
              ) : finishedRace ? (
                <div className="group relative rounded-2xl border border-border/80 bg-card/40 p-4.5 hover:border-[#067E6A]/45 transition-all duration-300">
                  <span className="inline-block rounded-md border border-[#067E6A]/30 bg-[#067E6A]/10 px-2.5 py-0.5 text-[9px] font-black tracking-wider text-[#067E6A]">
                    ĐÃ KẾT THÚC
                  </span>
                  <h3 className="mt-2 font-bold uppercase text-base text-foreground group-hover:text-[#067E6A] transition-colors">
                    {finishedRace.name}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" /> {finishedRace.location || "Đại lộ"}
                    </span>
                    <span className="text-[#067E6A] font-bold">Hoàn thành</span>
                  </div>
                  <Link
                    href={`/races/${finishedRace._id}`}
                    className="mt-3 flex h-8 items-center justify-center gap-1 rounded-lg bg-[#067E6A]/10 hover:bg-[#067E6A]/20 text-[#067E6A] text-[9.5px] font-bold uppercase tracking-wider transition"
                  >
                    Xem Kết Quả Chi Tiết
                  </Link>
                </div>
              ) : (
                <div className="group relative rounded-2xl border border-border/60 bg-muted/10 p-4.5 text-center">
                  <span className="inline-block rounded-md bg-[#067E6A]/10 text-[#067E6A] border border-[#067E6A]/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                    ĐÃ KẾT THÚC
                  </span>
                  <p className="mt-2 text-xs text-muted-foreground font-medium">Chưa có kết quả cuộc đua nào trước đây.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Quick Stats Section (Thống kê thời gian thực) */}
      <section className="py-14 bg-secondary/15 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.01] to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Stat 1: Tournaments */}
            <div className="group flex items-center gap-5 rounded-2xl border border-border bg-card/50 p-6 transition-all duration-300 hover:bg-card hover:-translate-y-1 hover:shadow-lg">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/10 bg-primary/5 text-primary group-hover:scale-110 transition-transform duration-300">
                <Trophy className="size-7" />
              </div>
              <div>
                <span className="block text-3xl font-extrabold text-foreground leading-none">
                  {loading ? "..." : stats.tournaments}
                </span>
                <span className="block text-xs font-black uppercase tracking-wider text-muted-foreground mt-2 leading-none">
                  Giải đấu
                </span>
                <span className="block text-[10px] font-bold text-[#067E6A] mt-1.5 flex items-center gap-0.5">
                  <span className="size-1 bg-[#067E6A] rounded-full inline-block" /> Đang cập nhật
                </span>
              </div>
            </div>

            {/* Stat 2: Registered Horses */}
            <div className="group flex items-center gap-5 rounded-2xl border border-border bg-card/50 p-6 transition-all duration-300 hover:bg-card hover:-translate-y-1 hover:shadow-lg">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-[#F8CD46]/10 bg-[#F8CD46]/5 text-[#F8CD46] group-hover:scale-110 transition-transform duration-300">
                <Compass className="size-7" />
              </div>
              <div>
                <span className="block text-3xl font-extrabold text-foreground leading-none">
                  {loading ? "..." : stats.horses}+
                </span>
                <span className="block text-xs font-black uppercase tracking-wider text-muted-foreground mt-2 leading-none">
                  Ngựa đua đăng ký
                </span>
                <span className="block text-[10px] font-bold text-[#F8CD46] mt-1.5 flex items-center gap-0.5">
                  Đã kiểm định sức khỏe
                </span>
              </div>
            </div>

            {/* Stat 3: Assigned Jockeys */}
            <div className="group flex items-center gap-5 rounded-2xl border border-border bg-card/50 p-6 transition-all duration-300 hover:bg-card hover:-translate-y-1 hover:shadow-lg">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-[#067E6A]/10 bg-[#067E6A]/5 text-[#067E6A] group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="size-7" />
              </div>
              <div>
                <span className="block text-3xl font-extrabold text-foreground leading-none">
                  {loading ? "..." : stats.jockeys}+
                </span>
                <span className="block text-xs font-black uppercase tracking-wider text-muted-foreground mt-2 leading-none">
                  Nài ngựa chuyên nghiệp
                </span>
                <span className="block text-[10px] font-bold text-[#067E6A] mt-1.5 flex items-center gap-0.5">
                  Chứng chỉ quốc tế
                </span>
              </div>
            </div>

            {/* Stat 4: Completed Races */}
            <div className="group flex items-center gap-5 rounded-2xl border border-border bg-card/50 p-6 transition-all duration-300 hover:bg-card hover:-translate-y-1 hover:shadow-lg">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/10 bg-blue-500/5 text-blue-500 group-hover:scale-110 transition-transform duration-300">
                <Flag className="size-7" />
              </div>
              <div>
                <span className="block text-3xl font-extrabold text-foreground leading-none">
                  {loading ? "..." : stats.races}
                </span>
                <span className="block text-xs font-black uppercase tracking-wider text-muted-foreground mt-2 leading-none">
                  Trận đua đã kết thúc
                </span>
                <span className="block text-[10px] font-bold text-blue-500 mt-1.5 flex items-center gap-0.5">
                  Thành tích ghi nhận
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Featured Tournaments Section (Giải đấu nổi bật - Dữ liệu thực tế) */}
      <section className="py-20 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.24em] text-primary">
                GIẢI ĐẤU CÔNG KHAI
              </span>
              <h2 className="text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
                Giải Đấu Đang Hoạt Động
              </h2>
            </div>
            <Link
              href="/tournaments"
              className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition"
            >
              Xem tất cả giải đấu
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-72 rounded-3xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : tournaments.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tournaments.slice(0, 3).map((tour) => {
                const isOngoing = tour.status === "ONGOING";
                const isOpenReg = tour.status === "OPEN_REGISTRATION";
                
                return (
                  <div
                    key={tour._id}
                    className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card/40 p-6 transition-all duration-300 hover:border-primary/25 hover:bg-card hover:-translate-y-1 hover:shadow-xl overflow-hidden"
                  >
                    {/* Glow lines */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div>
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-5">
                        {isOngoing ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-red-500">
                            <span className="size-1.5 rounded-full bg-red-500 animate-ping" />
                            Đang diễn ra
                          </span>
                        ) : isOpenReg ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-500">
                            Mở đăng ký
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                            {tour.status}
                          </span>
                        )}
                        
                        <div className="text-right">
                          <span className="block text-[9px] uppercase tracking-wider text-muted-foreground">QUỸ GIẢI THƯỞNG</span>
                          <span className="block text-sm font-extrabold text-[#F8CD46] flex items-center justify-end gap-0.5">
                            <DollarSign className="size-3.5" />
                            {formatPrize(tour.prizePool)}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <h3 className="font-extrabold text-lg uppercase text-foreground leading-snug group-hover:text-primary transition-colors duration-300">
                        {tour.name}
                      </h3>
                      
                      <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {tour.description || "Chưa có mô tả chi tiết cho giải đấu này."}
                      </p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-border/50">
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground font-semibold mb-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-primary/70" />
                          <span className="truncate">{tour.location || "Chưa cập nhật"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                          <Calendar className="size-3.5 text-[#067E6A]/70" />
                          <span>{tour.startDate ? new Date(tour.startDate).toLocaleDateString("vi-VN") : "---"}</span>
                        </div>
                      </div>

                      <Link
                        href={`/tournaments/${tour._id}`}
                        className="flex h-10 w-full items-center justify-center gap-1 rounded-2xl bg-secondary/80 hover:bg-primary hover:text-white text-xs font-bold uppercase tracking-wider text-foreground transition-all duration-300"
                      >
                        Chi Tiết Giải Đấu
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center max-w-md mx-auto">
              <Trophy className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base font-bold text-foreground">Không Tìm Thấy Giải Đấu</h3>
              <p className="mt-2 text-xs text-muted-foreground">Hiện tại chưa có giải đấu nào đang hoạt động trong hệ thống.</p>
              <Link
                href="/tournaments"
                className="mt-4 inline-flex h-9 items-center justify-center rounded-xl bg-primary text-white text-xs font-bold px-4 hover:bg-primary/95 transition"
              >
                Tạo giải đấu mới
              </Link>
            </div>
          )}

        </div>
      </section>

      {/* 5. Rankings Section (Bảng xếp hạng toàn cầu - Thiết kế hiện đại & Animated) */}
      <section className="py-20 bg-secondary/10 relative overflow-hidden">
        {/* Style injection for smooth staggered animations */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes rankRowSlideUp {
            from {
              opacity: 0;
              transform: translateY(18px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .animate-rank-row {
            animation: rankRowSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
        `}} />

        {/* Neon blur background */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#067E6A]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          
          <ScrollReveal direction="up">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.24em] text-primary flex items-center gap-1.5">
                  <Sparkles className="size-4 text-primary animate-pulse" />
                  BẢNG XẾP HẠNG TOÀN CẦU
                </span>
                <h2 className="text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
                  Chiến Mã & Nài Ngựa Xuất Sắc Nhất
                </h2>
              </div>
              <Link
                href="/rankings"
                className="group flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-all"
              >
                Xem chi tiết bảng xếp hạng
                <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={100}>
            <div className="grid gap-8 lg:grid-cols-2">
            
            {/* Cột 1: Xếp hạng ngựa */}
            <div className="rounded-[2.5rem] border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group/board">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.01] to-transparent pointer-events-none" />
              <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Trophy className="size-5" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-foreground">Top 5 Chiến Mã Hàng Đầu</h3>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/80 px-2.5 py-1 rounded-lg">
                  Global Horses
                </span>
              </div>

              <div className="space-y-3.5 relative z-10">
                {loading ? (
                  [1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />
                  ))
                ) : horseRankings.length > 0 ? (
                  horseRankings.map((item, index) => {
                    const rank = index + 1;
                    const initial = item.horseName ? item.horseName.charAt(0) : "H";
                    // Rank #1 — Card vàng đặc biệt, nổi bật nhất
                    if (rank === 1) return (
                      <div
                        key={item.horseId}
                        style={{ animationDelay: "0ms" }}
                        className="animate-rank-row group relative overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/10 via-yellow-400/5 to-orange-500/8 p-4 shadow-[0_0_25px_rgba(245,158,11,0.12)] hover:shadow-[0_0_35px_rgba(245,158,11,0.25)] hover:-translate-y-1 hover:border-amber-400/70 transition-all duration-300"
                      >
                        {/* Crown shimmer background */}
                        <div className="absolute -right-4 -top-4 text-[80px] opacity-[0.06] select-none pointer-events-none">👑</div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Rank badge #1 */}
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-black font-black text-base shadow-[0_0_18px_rgba(245,158,11,0.5)]">
                              1
                            </div>
                            {/* Avatar */}
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-amber-500 border border-amber-400/30 font-black text-lg uppercase">
                              {initial}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-black text-sm text-foreground group-hover:text-amber-500 transition-colors">{item.horseName || "Chiến mã ẩn danh"}</h4>
                                <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">🏆 #1</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{item.breed || "Chưa rõ giống"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-right">
                            <div className="hidden sm:block">
                              <span className="block text-[8px] text-muted-foreground uppercase font-black tracking-wider">Trận (Thắng)</span>
                              <span className="font-mono text-xs font-bold text-foreground/80">{item.totalRaces} ({item.wins})</span>
                            </div>
                            <div className="bg-gradient-to-br from-amber-400/15 to-orange-500/10 border border-amber-400/30 text-amber-500 px-4 py-2 rounded-xl text-center min-w-[84px]">
                              <span className="block text-[8px] text-amber-500/70 uppercase font-black tracking-wider">Điểm số</span>
                              <span className="font-mono font-black text-base">{item.totalPoints}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );

                    // Rank #2 — Card bạc nổi bật
                    if (rank === 2) return (
                      <div
                        key={item.horseId}
                        style={{ animationDelay: "80ms" }}
                        className="animate-rank-row group relative overflow-hidden rounded-2xl border border-slate-400/30 bg-gradient-to-br from-slate-300/8 via-slate-200/4 to-slate-400/5 p-4 hover:shadow-[0_0_28px_rgba(148,163,184,0.18)] hover:-translate-y-0.5 hover:border-slate-400/50 transition-all duration-300"
                      >
                        <div className="absolute -right-3 -top-3 text-[65px] opacity-[0.05] select-none pointer-events-none">🥈</div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-200 to-slate-400 text-black font-black text-sm shadow-[0_0_12px_rgba(203,213,225,0.35)]">
                              2
                            </div>
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-200/10 text-slate-400 border border-slate-400/20 font-bold uppercase">
                              {initial}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-foreground group-hover:text-slate-400 transition-colors">{item.horseName || "Chiến mã ẩn danh"}</h4>
                              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{item.breed || "Chưa rõ giống"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-right">
                            <div className="hidden sm:block">
                              <span className="block text-[8px] text-muted-foreground uppercase font-black tracking-wider">Trận (Thắng)</span>
                              <span className="font-mono text-xs font-bold text-foreground/80">{item.totalRaces} ({item.wins})</span>
                            </div>
                            <div className="bg-slate-200/10 border border-slate-400/20 text-slate-400 px-3.5 py-1.5 rounded-xl text-center min-w-[80px]">
                              <span className="block text-[8px] text-slate-400/70 uppercase font-black tracking-wider">Điểm số</span>
                              <span className="font-mono font-black text-sm">{item.totalPoints}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );

                    // Rank 3–5
                    return (
                      <div
                        key={item.horseId}
                        style={{ animationDelay: `${index * 80}ms` }}
                        className="animate-rank-row group flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-card/40 hover:border-primary/30 hover:bg-primary/[0.03] hover:scale-[1.015] hover:-translate-y-0.5 transition-all duration-300 ease-out shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-xl font-black text-sm",
                            rank === 3 ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-[0_0_10px_rgba(180,83,9,0.3)]" :
                              "bg-secondary/80 text-muted-foreground border border-border"
                          )}>
                            {rank}
                          </div>
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-orange-500/10 text-primary border border-primary/10 font-bold uppercase">
                            {initial}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors">{item.horseName || "Chiến mã ẩn danh"}</h4>
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{item.breed || "Chưa rõ giống"}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <div className="hidden sm:block">
                            <span className="block text-[8px] text-muted-foreground uppercase font-black tracking-wider">Trận (Thắng)</span>
                            <span className="font-mono text-xs font-bold text-foreground/80">{item.totalRaces} ({item.wins})</span>
                          </div>
                          <div className="bg-primary/5 border border-primary/20 text-primary px-3.5 py-1.5 rounded-xl text-center min-w-[80px]">
                            <span className="block text-[8px] text-primary/70 uppercase font-black tracking-wider">Điểm số</span>
                            <span className="font-mono font-black text-sm">{item.totalPoints}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-xs text-muted-foreground py-6">Chưa có dữ liệu xếp hạng ngựa.</p>
                )}
              </div>
            </div>

            {/* Cột 2: Xếp hạng nài ngựa */}
            <div className="rounded-[2.5rem] border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group/board">
              <div className="absolute inset-0 bg-gradient-to-b from-[#067E6A]/[0.01] to-transparent pointer-events-none" />
              <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-[#067E6A]/10 text-[#067E6A]">
                    <Users className="size-5" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-foreground">Top 5 Nài Ngựa Xuất Sắc</h3>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/80 px-2.5 py-1 rounded-lg">
                  Global Jockeys
                </span>
              </div>

              <div className="space-y-3.5 relative z-10">
                {loading ? (
                  [1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />
                  ))
                ) : jockeyRankings.length > 0 ? (
                  jockeyRankings.map((item, index) => {
                    const rank = index + 1;
                    const initial = item.jockeyName ? item.jockeyName.split(" ").pop()?.charAt(0) : "N";
                    if (rank === 1) return (
                      <div
                        key={item.jockeyUserId}
                        style={{ animationDelay: "0ms" }}
                        className="animate-rank-row group relative overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/10 via-yellow-400/5 to-orange-500/8 p-4 shadow-[0_0_25px_rgba(245,158,11,0.12)] hover:shadow-[0_0_35px_rgba(245,158,11,0.25)] hover:-translate-y-1 hover:border-amber-400/70 transition-all duration-300"
                      >
                        <div className="absolute -right-4 -top-4 text-[80px] opacity-[0.06] select-none pointer-events-none">👑</div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-black font-black text-base shadow-[0_0_18px_rgba(245,158,11,0.5)]">
                              1
                            </div>
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-amber-500 border border-amber-400/30 font-black text-lg uppercase">
                              {initial}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-black text-sm text-foreground group-hover:text-amber-500 transition-colors">{item.jockeyName || "Nài ngựa ẩn danh"}</h4>
                                <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">🏆 #1</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Kinh nghiệm: {item.experienceYears || 0} năm</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-right">
                            <div className="hidden sm:block">
                              <span className="block text-[8px] text-muted-foreground uppercase font-black tracking-wider">Trận (Thắng)</span>
                              <span className="font-mono text-xs font-bold text-foreground/80">{item.totalRaces} ({item.wins})</span>
                            </div>
                            <div className="bg-gradient-to-br from-amber-400/15 to-orange-500/10 border border-amber-400/30 text-amber-500 px-4 py-2 rounded-xl text-center min-w-[84px]">
                              <span className="block text-[8px] text-amber-500/70 uppercase font-black tracking-wider">Điểm số</span>
                              <span className="font-mono font-black text-base">{item.totalPoints}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );

                    if (rank === 2) return (
                      <div
                        key={item.jockeyUserId}
                        style={{ animationDelay: "80ms" }}
                        className="animate-rank-row group relative overflow-hidden rounded-2xl border border-slate-400/30 bg-gradient-to-br from-slate-300/8 via-slate-200/4 to-slate-400/5 p-4 hover:shadow-[0_0_28px_rgba(148,163,184,0.18)] hover:-translate-y-0.5 hover:border-slate-400/50 transition-all duration-300"
                      >
                        <div className="absolute -right-3 -top-3 text-[65px] opacity-[0.05] select-none pointer-events-none">🥈</div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-200 to-slate-400 text-black font-black text-sm shadow-[0_0_12px_rgba(203,213,225,0.35)]">
                              2
                            </div>
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-200/10 text-slate-400 border border-slate-400/20 font-bold uppercase">
                              {initial}
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-foreground group-hover:text-slate-400 transition-colors">{item.jockeyName || "Nài ngựa ẩn danh"}</h4>
                              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Kinh nghiệm: {item.experienceYears || 0} năm</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-right">
                            <div className="hidden sm:block">
                              <span className="block text-[8px] text-muted-foreground uppercase font-black tracking-wider">Trận (Thắng)</span>
                              <span className="font-mono text-xs font-bold text-foreground/80">{item.totalRaces} ({item.wins})</span>
                            </div>
                            <div className="bg-slate-200/10 border border-slate-400/20 text-slate-400 px-3.5 py-1.5 rounded-xl text-center min-w-[80px]">
                              <span className="block text-[8px] text-slate-400/70 uppercase font-black tracking-wider">Điểm số</span>
                              <span className="font-mono font-black text-sm">{item.totalPoints}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );

                    return (
                      <div
                        key={item.jockeyUserId}
                        style={{ animationDelay: `${index * 80}ms` }}
                        className="animate-rank-row group flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-card/40 hover:border-[#067E6A]/30 hover:bg-[#067E6A]/[0.03] hover:scale-[1.015] hover:-translate-y-0.5 transition-all duration-300 ease-out shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-xl font-black text-sm",
                            rank === 3 ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-[0_0_10px_rgba(180,83,9,0.3)]" :
                              "bg-secondary/80 text-muted-foreground border border-border"
                          )}>
                            {rank}
                          </div>
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#067E6A]/10 to-emerald-500/10 text-[#067E6A] border border-[#067E6A]/10 font-bold uppercase">
                            {initial}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-foreground group-hover:text-[#067E6A] transition-colors">{item.jockeyName || "Nài ngựa ẩn danh"}</h4>
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Kinh nghiệm: {item.experienceYears || 0} năm</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <div className="hidden sm:block">
                            <span className="block text-[8px] text-muted-foreground uppercase font-black tracking-wider">Trận (Thắng)</span>
                            <span className="font-mono text-xs font-bold text-foreground/80">{item.totalRaces} ({item.wins})</span>
                          </div>
                          <div className="bg-[#067E6A]/5 border border-[#067E6A]/20 text-[#067E6A] px-3.5 py-1.5 rounded-xl text-center min-w-[80px]">
                            <span className="block text-[8px] text-[#067E6A]/70 uppercase font-black tracking-wider">Điểm số</span>
                            <span className="font-mono font-black text-sm">{item.totalPoints}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-xs text-muted-foreground py-6">Chưa có dữ liệu xếp hạng nài ngựa.</p>
                )}
              </div>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 5.5. Global Globe Tournaments Section */}
      <section className="py-24 relative overflow-hidden bg-background">
        {/* Glow Effects */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-yellow-500/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            
            {/* Cột trái: Quả địa cầu cobe 3D */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 bg-radial-gradient from-primary/10 via-transparent to-transparent blur-3xl pointer-events-none scale-150" />
              
              {/* Quả địa cầu cobe 3D và các nhãn quốc gia */}
              <div className="relative flex items-center justify-center w-[300px] h-[300px] sm:w-[450px] sm:h-[450px]">
                <canvas
                  ref={globeCanvasRef}
                  style={{
                    width: 450,
                    height: 450,
                    maxWidth: "100%",
                    aspectRatio: "1",
                  }}
                  className="relative z-10 cursor-grab active:cursor-grabbing"
                />

                {/* Các nhãn tên quốc gia 3D bay xung quanh quả cầu */}
                {mounted && GLOBE_MARKERS.map((marker, idx) => (
                  <div
                    key={idx}
                    ref={(el) => {
                      markerRefs.current[idx] = el;
                    }}
                    className="absolute z-20 pointer-events-none px-2 py-0.5 rounded-md bg-background/80 dark:bg-background/90 border border-border/40 text-[9px] sm:text-[10px] font-black shadow-md text-foreground transition-all duration-200 select-none backdrop-blur-[2px]"
                    style={{
                      opacity: 0,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-pulse" />
                      {marker.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cột phải: Danh sách các giải đấu đua ngựa thế giới */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-[0.24em] text-primary flex items-center gap-1.5">
                  <Flag className="size-4 text-primary" />
                  MẠNG LƯỚI QUỐC TẾ
                </span>
                <h2 className="text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
                  Giải Đấu Đua Ngựa Toàn Cầu
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  Hệ thống kết nối các giải đua huyền thoại trên khắp thế giới. Từ Việt Nam làm điểm kết nối trung tâm, các giải đấu hàng đầu đưa các nài ngựa và chiến mã vươn tầm thế giới.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    name: "Dubai World Cup",
                    location: "Meydan, Dubai, UAE",
                    prize: "$12,000,000 USD",
                    desc: "Giải đua danh giá với đường chạy cát hiện đại bậc nhất thế giới.",
                    accentColor: "border-[#F8CD46]/20 hover:border-[#F8CD46]/40 hover:bg-[#F8CD46]/[0.03]",
                    badgeColor: "bg-[#F8CD46]/10 text-[#F8CD46]",
                  },
                  {
                    name: "Kentucky Derby",
                    location: "Kentucky, Hoa Kỳ",
                    prize: "$5,000,000 USD",
                    desc: "Giải đấu lâu đời bậc nhất nước Mỹ còn được gọi là \"Run for the Roses\".",
                    accentColor: "border-primary/20 hover:border-primary/40 hover:bg-primary/[0.03]",
                    badgeColor: "bg-primary/10 text-primary",
                  },
                  {
                    name: "Royal Ascot",
                    location: "Ascot, London, Anh Quốc",
                    prize: "£10,000,000 GBP",
                    desc: "Giải đua truyền thống hoàng gia với sự tham gia của các chiến mã xuất sắc nhất.",
                    accentColor: "border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/[0.03]",
                    badgeColor: "bg-blue-500/10 text-blue-400",
                  },
                  {
                    name: "Melbourne Cup",
                    location: "Melbourne, Australia",
                    prize: "$8,000,000 AUD",
                    desc: "Giải đua cúp quốc gia làm cả nước Úc ngừng hoạt động để dõi theo.",
                    accentColor: "border-[#067E6A]/20 hover:border-[#067E6A]/40 hover:bg-[#067E6A]/[0.03]",
                    badgeColor: "bg-[#067E6A]/10 text-[#067E6A]",
                  }
                ].map((league, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-5 rounded-3xl border bg-card/40 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 group shadow-sm flex flex-col justify-between space-y-4",
                      league.accentColor
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-extrabold text-base text-foreground transition-colors group-hover:text-primary">
                          {league.name}
                        </h4>
                        <span className={cn("text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shrink-0", league.badgeColor)}>
                          {league.prize}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                        <MapPin className="size-3.5 text-primary/80 shrink-0" />
                        {league.location}
                      </div>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed font-normal pt-1">
                        {league.desc}
                      </p>
                    </div>
                    
                    <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                      <span>Xem thông tin giải</span>
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Core Features Section (Tính năng cốt lõi - Thiết kế hiện đại & Hiệu ứng tương tác) */}
      <section className="py-24 relative overflow-hidden bg-background">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes featureCardFadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.97);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .animate-feature-card {
            animation: featureCardFadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
        `}} />

        {/* Nền mờ ảo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
        {/* Dot pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.02] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
          
          <div className="space-y-3 text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-black uppercase tracking-[0.2em] text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              QUY TRÌNH HỆ THỐNG
            </span>
            <h2 className="text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-5xl bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent">
              Tính Năng Cốt Lõi
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-semibold max-w-2xl mx-auto">
              Hệ thống vận hành tối ưu với các module khép kín từ đăng ký, tổ chức cho đến trực tiếp và trả thưởng tự động.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:grid-flow-row-dense">
            {coreFeatures.map((feat, index) => {
              const Icon = feat.icon;
              const isLarge = feat.key === "feat1";
              const isWide = feat.key === "feat4" || feat.key === "feat8";
              
              return (
                <div
                  key={feat.key}
                  style={{ animationDelay: `${index * 80}ms` }}
                  className={cn(
                    "animate-feature-card group relative flex flex-col justify-between rounded-[2rem] border border-border/60 bg-card/20 p-7 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:bg-card/70 overflow-hidden",
                    feat.glowClass,
                    feat.gridClass
                  )}
                >
                  {/* Hover gradient background layer */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none",
                    feat.gradient
                  )} />

                  {/* Step number on background */}
                  <span className="absolute top-4 right-6 text-7xl font-black text-foreground/[0.02] group-hover:text-foreground/[0.06] transition-colors duration-500 select-none pointer-events-none font-mono">
                    {feat.step}
                  </span>

                  {/* Nội dung bên trong thẻ */}
                  <div className={cn("h-full flex flex-col justify-between relative z-10", isWide ? "lg:flex-row lg:items-center lg:gap-8" : "")}>
                    <div className="space-y-6 flex-1">
                      <div className={cn(
                        "flex size-12 items-center justify-center rounded-2xl border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                        feat.iconClass
                      )}>
                        <Icon className="size-6 transition-transform duration-500" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className={cn(
                          "font-extrabold text-sm uppercase tracking-wider text-foreground transition-colors duration-300 relative inline-block",
                          feat.textColor
                        )}>
                          {feat.title}
                          <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-current transition-all duration-300 group-hover:w-full" />
                        </h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold group-hover:text-foreground/85 transition-colors duration-300">
                          {feat.desc}
                        </p>
                      </div>
                    </div>

                    {/* Phần visual thêm cho Card Lớn (2x2) */}
                    {isLarge && feat.key === "feat1" && (
                      <div className="mt-6 p-4 rounded-2xl border border-border/40 bg-background/30 backdrop-blur-sm space-y-2.5 text-[10px] font-semibold text-muted-foreground transition-colors duration-500 group-hover:bg-background/50 group-hover:border-red-500/20">
                        <div className="flex items-center justify-between border-b border-border/30 pb-2">
                          <span className="font-extrabold text-foreground tracking-wider uppercase">Grand Prix Championship</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[8px] font-black text-red-500 uppercase">
                            <span className="size-1 rounded-full bg-red-500 animate-ping" />
                            Đang chạy
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] uppercase tracking-wider font-black">
                            <span>Tiến độ đăng ký</span>
                            <span className="text-red-500">80% (64/80)</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full w-[80%] shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Phần visual thêm cho Card Rộng (2x1) - Dự đoán */}
                    {isWide && feat.key === "feat8" && (
                      <div className="mt-4 lg:mt-0 p-4 rounded-2xl border border-border/40 bg-background/30 backdrop-blur-sm space-y-3 text-[10px] font-semibold text-muted-foreground transition-colors duration-500 group-hover:bg-background/50 group-hover:border-cyan-500/20 min-w-[210px] lg:max-w-[240px]">
                        <div className="flex items-center justify-between border-b border-border/30 pb-2">
                          <span className="font-extrabold text-foreground tracking-wider uppercase">Dự Đoán AI</span>
                          <span className="text-cyan-500 font-bold flex items-center gap-0.5">
                            <Sparkles className="size-3 text-cyan-500 animate-pulse" /> 87.4%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-cyan-500/5 hover:bg-cyan-500/15 border border-cyan-500/10 p-2 text-center transition-all duration-300 cursor-pointer">
                            <span className="block text-[8px] uppercase tracking-wider text-muted-foreground font-black">Ngựa A</span>
                            <span className="font-mono text-[10px] font-black text-cyan-400">1.85</span>
                          </div>
                          <div className="rounded-lg bg-secondary/35 hover:bg-secondary/60 border border-border/40 p-2 text-center transition-all duration-300 cursor-pointer">
                            <span className="block text-[8px] uppercase tracking-wider text-muted-foreground font-black">Ngựa B</span>
                            <span className="font-mono text-[10px] font-black text-foreground/80">2.10</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Newsletter Subscription Section */}
      <section id="contact" className="scroll-mt-24 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-gradient-to-br from-card/90 to-primary/5 p-8 sm:p-12 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            {/* Glowing gold border line */}
            <div className="absolute inset-y-12 left-0 w-[2px] bg-gradient-to-b from-transparent via-[#F8CD46] to-transparent shadow-[0_0_12px_rgba(248,205,70,0.9)] opacity-70" />

            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center relative z-10">
              
              {/* Left Side Info */}
              <div className="flex items-center gap-6">
                <div
                  className="size-24 sm:size-28 shrink-0 bg-contain bg-center bg-no-repeat drop-shadow-[0_0_20px_rgba(248,205,70,0.35)]"
                  style={{ backgroundImage: "url('/subscription_trophy.png')" }}
                />
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[#F8CD46] flex items-center gap-1">
                    <Award className="size-3.5" /> Đăng Ký Tin Tức & Quà Tặng
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-foreground leading-tight">
                    Cập Nhật Lịch Đua <br />
                    Và Dự Đoán Nhanh
                  </h3>
                </div>
              </div>

              {/* Right Side Input */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:pl-8">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="Nhập địa chỉ email của bạn..."
                    className="h-13 w-full rounded-2xl border border-border bg-background/80 pl-11.5 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  />
                </div>
                <button
                  type="button"
                  className="group relative h-13 rounded-2xl bg-primary hover:bg-primary/95 px-8 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-all duration-300 shadow-[0_4px_15px_rgba(225,6,0,0.25)] hover:scale-[1.01] active:scale-[0.99] overflow-hidden"
                >
                  <span className="relative z-10">Đăng Ký Ngay</span>
                  {/* shine effect */}
                  <span className="absolute inset-0 w-1/2 bg-white/10 skew-x-[-25deg] translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer Section */}
      <footer className="bg-background py-16 text-xs sm:text-sm text-muted-foreground font-semibold tracking-wide">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-border/50">
          
          {/* Logo & Description */}
          <div className="space-y-5">
            <Link
              href="/"
              className="flex items-center gap-3 group focus:outline-none"
            >
              <Image
                src="/logo.png"
                alt="HorseTrack Logo"
                width={44}
                height={44}
                className="size-11 rounded-2xl object-cover border border-border shadow-[0_0_20px_rgba(225,6,0,0.25)] transition group-hover:scale-105"
              />
              <span className="text-xl font-black uppercase tracking-[0.16em]">
                Horse<span className="text-primary">Track</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium max-w-xs">
              Hệ thống quản lý toàn diện các giải thi đấu đua ngựa chuyên nghiệp. Mang lại sự công bằng, minh bạch và trải nghiệm tuyệt vời cho mọi người chơi.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
              Đường Dẫn Nhanh
            </h4>
            <div className="flex flex-col gap-2.5 text-xs font-medium">
              {[
                { name: "Danh sách giải đấu", href: "/tournaments" },
                { name: "Lịch thi đấu đua ngựa", href: "/races" },
                { name: "Bảng xếp hạng", href: "/rankings" },
                { name: "Dự đoán kết quả", href: "/predictions" }
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
              Hỗ Trợ Người Dùng
            </h4>
            <div className="flex flex-col gap-2.5 text-xs font-medium">
              {[
                { name: "Trung tâm hỗ trợ", href: "/support" },
                { name: "Hướng dẫn sử dụng", href: "/support" },
                { name: "Câu hỏi thường gặp", href: "/support" },
                { name: "Liên hệ chúng tôi", href: "/support" }
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Follow Us */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
              Mạng Xã Hội
            </h4>
            <div className="flex items-center gap-3">
              <Link
                href="https://facebook.com"
                className="flex size-10 items-center justify-center rounded-xl bg-secondary/50 border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </Link>
              <Link
                href="https://twitter.com"
                className="flex size-10 items-center justify-center rounded-xl bg-secondary/50 border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link
                href="https://instagram.com"
                className="flex size-10 items-center justify-center rounded-xl bg-secondary/50 border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300"
              >
                <svg
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </Link>
              <Link
                href="https://youtube.com"
                className="flex size-10 items-center justify-center rounded-xl bg-secondary/50 border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
          <span>
            © 2026 Hệ thống Quản lý Giải đấu Đua ngựa. Bảo lưu mọi quyền.
          </span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Điều khoản dịch vụ
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
