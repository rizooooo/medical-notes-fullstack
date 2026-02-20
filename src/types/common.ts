

// 1. Define the shape with a Generic ID
export interface IBaseEntity<TId = string> {
  _id: TId
  createdAt: Date
  updatedAt: Date
}

export interface IAuditTrail {
  timestamp: Date
  userId: string
  userName: string
  action: 'CREATE' | 'UPDATE'
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]
}
