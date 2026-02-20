import type { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'

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
}

export function TablePageLayout({
  title,
  description,
  action,
  children,
  pagination,
}: TablePageLayoutProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 w-full max-w-full h-full">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Primary Action Button (Right Side) */}
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      <Separator />

      {/* 3. The Table Content */}
      {children}

      {/* 4. Footer / Pagination */}
      {pagination && (
        <div className="flex items-center justify-end py-2">{pagination}</div>
      )}
    </div>
  )
}
