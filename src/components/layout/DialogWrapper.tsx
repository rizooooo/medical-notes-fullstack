"use client"

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface DialogWrapperProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    children: React.ReactNode
    footer?: React.ReactNode
    className?: string
}

export function DialogWrapper({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    className,
}: DialogWrapperProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "sm:max-w-[420px] p-0 rounded-lg overflow-hidden border shadow-lg bg-white",
                className
            )}>
                <DialogHeader className="p-4 border-b bg-slate-50/50">
                    <DialogTitle className="text-sm font-bold text-slate-900 tracking-tight">
                        {title}
                    </DialogTitle>
                    {description && (
                        <DialogDescription className="text-[11px] text-slate-500 font-medium">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="p-4">
                    {children}
                </div>

                {footer && (
                    <div className="px-4 pb-4 pt-4 border-t bg-slate-50/30">
                        {footer}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
