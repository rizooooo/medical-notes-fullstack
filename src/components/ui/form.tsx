"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const FormItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
    )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
    React.ElementRef<typeof Label>,
    React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
    return (
        <Label
            ref={ref}
            className={cn("text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1", className)}
            {...props}
        />
    )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
    React.ElementRef<typeof Slot>,
    React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
    return <Slot ref={ref} {...props} />
})
FormControl.displayName = "FormControl"

const FormMessage = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
    if (!children) {
        return null
    }

    const message = React.useMemo(() => {
        if (typeof children === "string") return children
        if (typeof children === "object" && children !== null) {
            if ("message" in children) return String(children.message)
            return JSON.stringify(children)
        }
        return String(children)
    }, [children])

    return (
        <p
            ref={ref}
            className={cn("text-[10px] text-rose-500 font-bold uppercase tracking-tight pl-1 animate-in fade-in slide-in-from-top-1 duration-200", className)}
            {...props}
        >
            {message}
        </p>
    )
})
FormMessage.displayName = "FormMessage"

export {
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
}
