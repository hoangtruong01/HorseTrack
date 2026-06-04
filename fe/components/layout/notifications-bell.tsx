"use client";

import { Bell } from "lucide-react";
import { useState } from "react";

export function NotificationsBell() {
  const [hasNotifications] = useState(true);
  const [notificationCount] = useState(3);

  return (
    <button
      type="button"
      className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-card/50 text-foreground/60 transition hover:border-primary/30 hover:bg-card hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label="Notifications"
    >
      <Bell className="size-4.5" />
      {hasNotifications && (
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {notificationCount}
        </span>
      )}
    </button>
  );
}