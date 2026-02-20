import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TablePageLayoutProps {
  /** The main title of the page (e.g. "Hospices") */
  title: string
  /** Helper text below the title */
  description?: string
  /** The primary action button (e.g. "Add Hospice") */
  action?: ReactNode
  /** The search input field */
  search?: ReactNode
  /** Optional filter dropdowns or secondary actions */
  filters?: ReactNode
  /** The actual Table component */
  children: ReactNode
  /** Pagination controls */
  pagination?: ReactNode
  className?: string
}

export function TablePageLayout({
  title,
  description,
  action,
  children,
  className,
}: TablePageLayoutProps) {
  return (
    <div className={cn("flex flex-1 flex-col gap-8 w-full max-w-full h-full min-w-0 p-4 lg:p-10", className)}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-black tracking-tight text-foreground font-sans">{title}</h1>
          {description && (
            <p className="text-sm font-medium text-muted-foreground font-sans">{description}</p>
          )}
        </div>

        {/* Primary Action Button */}
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>

      {/* The Table Content */}
      <div className="min-w-0">
        {children}
      </div>
    </div>
  )
}
