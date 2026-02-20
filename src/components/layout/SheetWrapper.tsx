"use client"

import React from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface SheetWrapperProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    children: React.ReactNode
    footer?: React.ReactNode
    className?: string
}

export function SheetWrapper({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    className,
}: SheetWrapperProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className={cn(
                    "sm:max-w-md border-l-0 shadow-2xl p-0 overflow-hidden flex flex-col bg-white",
                    className
                )}
            >
                <div className="p-6 flex-1 overflow-y-auto">
                    <SheetHeader className="space-y-1 pb-4">
                        <SheetTitle className="text-2xl font-black tracking-tight text-slate-900">
                            {title}
                        </SheetTitle>
                        {description && (
                            <SheetDescription className="text-slate-500 font-medium">
                                {description}
                            </SheetDescription>
                        )}
                    </SheetHeader>

                    <div className="h-px bg-slate-100 my-6" />

                    <div className="flex flex-col gap-8">
                        {children}
                    </div>
                </div>

                {footer && (
                    <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                        {footer}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
