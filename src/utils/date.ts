import { format, isValid, parseISO } from 'date-fns'

type DateType = Date | string | number | null | undefined

/**
 * Standard format for displaying dates in the UI
 * e.g. "Oct 24, 2024"
 */
export const formatDate = (
  date: DateType,
  dateFormat = 'MMM d, yyyy',
): string => {
  if (!date) return '-'

  // 1. Convert to Date object if it's a string/number
  const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date)

  // 2. Validate
  if (!isValid(parsedDate)) {
    return '-'
  }

  // 3. Format
  return format(parsedDate, dateFormat)
}

/**
 * Format for date + time
 * e.g. "Oct 24, 2024 at 2:30 PM"
 */
export const formatDateTime = (date: DateType): string => {
  return formatDate(date, "MMM d, yyyy 'at' h:mm a")
}

/**
 * Relative time for "Ago" style
 * e.g. "2 hours ago", "in 3 days"
 * (Requires 'formatDistanceToNow' import if you use this)
 */
/*
import { formatDistanceToNow } from 'date-fns'
export const formatRelative = (date: DateType): string => {
    // ... similar logic ...
    return formatDistanceToNow(parsedDate, { addSuffix: true })
}
*/
