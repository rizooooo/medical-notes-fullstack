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
                "sm:max-w-[480px] border-none shadow-2xl rounded-3xl overflow-hidden p-0 bg-white",
                className
            )}>
                <div className="bg-slate-900 p-6 text-white relative">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black tracking-tight text-white leading-tight">
                            {title}
                        </DialogTitle>
                        {description && (
                            <DialogDescription className="text-slate-400 text-sm font-medium">
                                {description}
                            </DialogDescription>
                        )}
                    </DialogHeader>
                </div>

                <div className="p-6">
                    {children}
                </div>

                {footer && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-50">
                        {footer}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
