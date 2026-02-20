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
        <div ref={ref} className={cn("space-y-1.5", className)} {...props} />
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
            className={cn("text-xs font-semibold text-slate-700", className)}
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
    const error = React.useMemo(() => {
        if (!children) return null

        const firstError = Array.isArray(children) ? children[0] : children
        if (!firstError) return null

        if (typeof firstError === "string") return firstError

        // Handle objects (like Zod errors)
        if (typeof firstError === "object") {
            // Priority 1: Direct .message property
            if ("message" in firstError && typeof firstError.message === "string") {
                return firstError.message
            }
            // Priority 2: Zod-style error arrays
            if ("_errors" in firstError && Array.isArray(firstError._errors) && firstError._errors[0]) {
                return String(firstError._errors[0])
            }
            // Priority 3: TanStack Form sometimes wraps errors
            if ("error" in firstError && typeof firstError.error === "string") {
                return firstError.error
            }
        }

        return String(firstError)
    }, [children])

    if (!error) return null

    return (
        <p
            ref={ref}
            className={cn("text-[11px] font-medium text-destructive mt-1", className)}
            {...props}
        >
            {error}
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
