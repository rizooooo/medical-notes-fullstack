

// 1. Define the shape with a Generic ID
export interface IBaseEntity<TId = string> {
  _id: TId
  createdAt: Date
  updatedAt: Date
}
