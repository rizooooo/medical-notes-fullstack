// src/types/common.ts

// 1. The Metadata Shape
export interface IPaginationMeta {
  total: number // Total number of records in DB
  page: number // Current page number (1-indexed)
  pageSize: number // Number of items per page
  pageCount: number // Total number of pages
}

// 2. The Generic Response Wrapper
// T = The type of data (e.g., IHospice)
export interface PaginatedResult<T> {
  data: Array<T>
  metadata: IPaginationMeta
}

// 3. Optional: A Helper for your API Inputs
export interface PaginationParams {
  page?: number
  pageSize?: number
  sorting?: Array<SortingParam> // Add this!
}

// Add this to your common types
export interface SortingParam {
  id: string
  desc: boolean
}
