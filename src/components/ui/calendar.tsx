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
                month_caption: "flex justify-center pt-2 relative items-center mb-4",
                caption_label: "text-sm font-bold text-slate-900",
                nav: "space-x-1 flex items-center",
                button_previous: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-xl border-slate-100 hover:bg-slate-50 transition-all absolute left-2 z-10"
                ),
                button_next: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-xl border-slate-100 hover:bg-slate-50 transition-all absolute right-2 z-10"
                ),
                month_grid: "w-full border-collapse space-y-1",
                weekdays: "flex",
                weekday:
                    "text-slate-400 rounded-md w-9 font-black text-[10px] uppercase tracking-widest text-center",
                week: "flex w-full mt-2",
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-bold text-slate-600 aria-selected:opacity-100 rounded-lg transition-all hover:bg-slate-100"
                ),
                range_end: "day-range-end",
                selected:
                    "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white focus:bg-indigo-600 focus:text-white shadow-lg shadow-indigo-100 rounded-lg font-black",
                today: "bg-slate-100 text-slate-900 font-black rounded-lg outline outline-2 outline-indigo-500/20",
                outside:
                    "day-outside text-slate-300 opacity-50 aria-selected:bg-slate-50/50 aria-selected:text-slate-400 aria-selected:opacity-30",
                disabled: "text-slate-300 opacity-50",
                range_middle:
                    "aria-selected:bg-slate-50 aria-selected:text-slate-900",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => orientation === 'left'
                    ? <ChevronLeft className="h-4 w-4 text-slate-500" />
                    : <ChevronRight className="h-4 w-4 text-slate-500" />,
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
