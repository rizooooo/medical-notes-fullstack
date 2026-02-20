"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface Option {
    label: string
    value: string
    subLabel?: string
}

interface MultiSelectProps {
    options: Option[]
    selected: string[]
    onChange: (values: string[]) => void
    placeholder?: string
    className?: string
    onOpenChange?: (open: boolean) => void
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select items...",
    className,
    onOpenChange,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false)

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        onOpenChange?.(newOpen)
    }

    const handleUnselect = (value: string) => {
        onChange(selected.filter((s) => s !== value))
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between h-auto min-h-12 py-2 px-3 rounded-xl border-slate-200 hover:bg-white transition-all",
                        className
                    )}
                >
                    <div className="flex flex-wrap gap-1">
                        {selected.length > 0 ? (
                            options
                                .filter((option) => selected.includes(option.value))
                                .map((option) => (
                                    <Badge
                                        key={option.value}
                                        variant="secondary"
                                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none rounded-lg px-2 py-1 flex items-center gap-1 group transition-all"
                                    >
                                        <span className="text-[11px] font-bold uppercase tracking-tight">{option.label}</span>
                                        <button
                                            className="ml-0.5 outline-none focus:ring-0"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleUnselect(option.value)
                                                }
                                            }}
                                            onMouseDown={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                            }}
                                            onClick={() => handleUnselect(option.value)}
                                        >
                                            <X className="h-3 w-3 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                                        </button>
                                    </Badge>
                                ))
                        ) : (
                            <span className="text-slate-400 font-medium text-sm pl-1">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-slate-400" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 border-none shadow-2xl rounded-2xl overflow-hidden mt-1">
                <Command className="bg-white">
                    <CommandInput
                        placeholder={`Search ${placeholder.toLowerCase()}...`}
                        className="h-12 border-none focus:ring-0 text-sm font-medium"
                    />
                    <CommandList className="max-h-[300px] overflow-y-auto">
                        <CommandEmpty className="py-6 text-center text-sm text-slate-500 font-medium">
                            No results found.
                        </CommandEmpty>
                        <CommandGroup className="p-2">
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => {
                                        onChange(
                                            selected.includes(option.value)
                                                ? selected.filter((s) => s !== option.value)
                                                : [...selected, option.value]
                                        )
                                    }}
                                    className="rounded-xl h-11 px-3 flex items-center justify-between aria-selected:bg-slate-50 cursor-pointer mb-1 last:mb-0"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700">{option.label}</span>
                                        {option.subLabel && (
                                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{option.subLabel}</span>
                                        )}
                                    </div>
                                    <div
                                        className={cn(
                                            "flex h-5 w-5 items-center justify-center rounded-lg border-2 border-slate-200 transition-all",
                                            selected.includes(option.value)
                                                ? "bg-indigo-600 border-indigo-600"
                                                : "opacity-50"
                                        )}
                                    >
                                        {selected.includes(option.value) && (
                                            <Check className="h-3 w-3 text-white" strokeWidth={4} />
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
