"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"


interface DatePickerProps {
    date?: Date
    onChange?: (date: Date | undefined) => void
    placeholder?: string
    formatStr?: string
    className?: string
    calendarProps?: Omit<React.ComponentProps<typeof Calendar>, "mode" | "selected" | "onSelect">
}

export function DatePicker({
    date,
    onChange,
    placeholder = "Pick a date",
    formatStr = "PPP",
    className,
    calendarProps,
}: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left h-12 border-slate-200 rounded-xl font-bold transition-all hover:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                    {date ? format(date, formatStr) : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-2xl overflow-hidden mt-1" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={onChange as any}
                    initialFocus
                    className="bg-white"
                    {...calendarProps}
                />
            </PopoverContent>
        </Popover>
    )
}
