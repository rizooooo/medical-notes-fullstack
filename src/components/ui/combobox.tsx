"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
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

export interface Option {
    label: string
    value: string
    subLabel?: string
}

interface ComboboxProps {
    options: Option[]
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    emptyMessage?: string
    className?: string
    onOpenChange?: (open: boolean) => void
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = "Select option...",
    emptyMessage = "No option found.",
    className,
    onOpenChange,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        onOpenChange?.(newOpen)
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between h-11 rounded-xl border-slate-200 px-3 font-bold text-slate-700", className)}
                >
                    {value
                        ? options.find((option) => option.value === value)?.label
                        : <span className="text-slate-400 font-medium">{placeholder}</span>}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-slate-400" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 border-none shadow-2xl rounded-2xl overflow-hidden mt-1">
                <Command className="bg-white">
                    <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} className="h-11 border-none focus:ring-0 text-sm font-medium" />
                    <CommandList>
                        <CommandEmpty className="py-6 text-center text-sm font-medium text-slate-500">{emptyMessage}</CommandEmpty>
                        <CommandGroup className="p-2">
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue: string) => {
                                        onChange(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                    className="rounded-xl h-11 px-3 flex items-center justify-between aria-selected:bg-slate-50 cursor-pointer mb-1 last:mb-0"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700">{option.label}</span>
                                        {option.subLabel && (
                                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{option.subLabel}</span>
                                        )}
                                    </div>
                                    <Check
                                        className={cn(
                                            "h-4 w-4 text-indigo-600 transition-opacity",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                        strokeWidth={3}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
