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
                    "sm:max-w-sm p-0 flex flex-col border-l bg-white shadow-xl",
                    className
                )}
            >
                <div className="flex-1 overflow-y-auto p-4">
                    <SheetHeader className="space-y-1 mb-4">
                        <SheetTitle className="text-base font-bold text-slate-900 tracking-tight">
                            {title}
                        </SheetTitle>
                        {description && (
                            <SheetDescription className="text-xs text-slate-500 font-medium">
                                {description}
                            </SheetDescription>
                        )}
                    </SheetHeader>

                    <div className="space-y-4 mt-2">
                        {children}
                    </div>
                </div>

                {footer && (
                    <div className="p-4 border-t bg-slate-50/30">
                        {footer}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
