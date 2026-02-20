"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-4 bg-white", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-6",
                caption: "flex justify-center pt-2 relative items-center mb-4",
                caption_label: "text-sm font-bold text-slate-900",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-xl border-slate-100 hover:bg-slate-50 transition-all"
                ),
                nav_button_previous: "absolute left-2",
                nav_button_next: "absolute right-2",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                    "text-slate-400 rounded-md w-9 font-black text-[10px] uppercase tracking-widest",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-lg [&:has([aria-selected].day-outside)]:bg-slate-50 [&:has([aria-selected])]:bg-slate-50 first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20",
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-bold text-slate-600 aria-selected:opacity-100 rounded-lg transition-all hover:bg-slate-100"
                ),
                day_range_end: "day-range-end",
                day_selected:
                    "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white focus:bg-indigo-600 focus:text-white shadow-lg shadow-indigo-100 rounded-lg font-black",
                day_today: "bg-slate-100 text-slate-900 font-black rounded-lg outline outline-2 outline-indigo-500/20",
                day_outside:
                    "day-outside text-slate-300 opacity-50 aria-selected:bg-slate-50/50 aria-selected:text-slate-400 aria-selected:opacity-30",
                day_disabled: "text-slate-300 opacity-50",
                day_range_middle:
                    "aria-selected:bg-slate-50 aria-selected:text-slate-900",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                IconLeft: () => <ChevronLeft className="h-4 w-4 text-slate-500" />,
                IconRight: () => <ChevronRight className="h-4 w-4 text-slate-500" />,
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
