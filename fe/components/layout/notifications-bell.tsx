"use client";

import { Bell } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

function formatTime(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function NotificationsBell() {
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<{ _id?: string; id?: string; isRead?: boolean; title?: string; body?: string; createdAt?: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!user) {
      setNotificationCount(0);
      setNotifications([]);
      return;
    }

    async function fetchNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.notifications)) {
            setNotifications(data.notifications);
            const unreadCount = data.notifications.filter((n: Record<string, unknown>) => !n.isRead).length;
            setNotificationCount(unreadCount);
          }
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;

    try {
      const res = await fetch(`/api/notifications?id=${id}`, {
        method: "PATCH",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => {
            const nId = n._id || n.id;
            return nId === id ? { ...n, isRead: true } : n;
          })
        );
        setNotificationCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications?all=true", {
        method: "PATCH",
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setNotificationCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const hasNotifications = notificationCount > 0;

  return (
    <div className="relative" ref={bellRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-card/50 text-foreground/60 transition hover:border-primary/30 hover:bg-card hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer z-50"
        aria-label="Notifications"
      >
        <Bell className="size-4.5" />
        {hasNotifications && (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {notificationCount > 99 ? "99+" : notificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4 bg-card">
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
              Thông báo
            </h3>
            {hasNotifications && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary/80 transition cursor-pointer"
              >
                Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[320px] overflow-y-auto divide-y divide-border bg-card">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-muted-foreground">
                <Bell className="size-8 mb-2 opacity-30" />
                <p className="text-xs">Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notif, index) => {
                const notifId = notif._id || notif.id || `notif-${index}`;
                return (
                  <button
                    key={notifId}
                    onClick={() => handleMarkAsRead(notifId, notif.isRead ?? false)}
                    className={cn(
                      "w-full flex gap-3 p-4 text-left transition hover:bg-secondary/50 cursor-pointer relative items-start",
                      !notif.isRead && "bg-primary/5"
                    )}
                  >
                    {!notif.isRead && (
                      <span className="absolute right-4 top-5 size-2 rounded-full bg-primary" />
                    )}
                    <div className="flex-1 min-w-0 pr-4">
                      <p className={cn(
                        "text-xs font-semibold text-foreground truncate",
                        !notif.isRead && "font-bold"
                      )}>
                        {notif.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {notif.body}
                      </p>
                      <p className="mt-1.5 text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                        {formatTime(notif.createdAt ?? "")}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
}