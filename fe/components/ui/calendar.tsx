"use client";
import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-bold text-foreground",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent hover:bg-muted rounded-lg flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
        row: "flex w-full mt-2",
        cell: cn(
          "h-9 w-9 text-center text-sm p-0 relative",
          "focus-within:relative focus-within:z-20",
        ),
        day: cn(
          "h-9 w-9 p-0 font-normal rounded-md",
          "inline-flex items-center justify-center text-foreground transition-colors",
          "hover:bg-muted hover:text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
        ),
        day_selected:
          "bg-primary text-foreground hover:bg-primary hover:text-foreground font-bold",
        day_today: "border border-primary/50 text-primary font-bold",
        day_outside: "text-muted-foreground/40",
        day_disabled:
          "text-muted-foreground/25 cursor-not-allowed line-through pointer-events-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
