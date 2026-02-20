"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface DetailWrapperProps {
    children: React.ReactNode
    className?: string
}

export function DetailWrapper({ children, className }: DetailWrapperProps) {
    return (
        <div className={cn(
            "flex flex-col gap-6 p-4 lg:p-6 max-w-7xl mx-auto w-full h-full bg-background overflow-y-auto overflow-x-hidden",
            className
        )}>
            {children}
        </div>
    )
}
