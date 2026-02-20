import { z } from 'zod'

export enum EmployeeRole {
    ADMIN = 'admin',
    STANDARD = 'standard',
}

export const EmployeeSchema = z.object({
    _id: z.string().optional(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: z.nativeEnum(EmployeeRole).default(EmployeeRole.STANDARD),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    lastLogin: z.date().optional(),
    loginLogs: z.array(z.object({
        timestamp: z.date(),
        ip: z.string().optional(),
        device: z.string().optional(),
    })).default([]),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
})

export type IEmployee = z.infer<typeof EmployeeSchema>

export const InviteSchema = z.object({
    _id: z.string().optional(),
    email: z.string().email(),
    role: z.nativeEnum(EmployeeRole),
    token: z.string(),
    expiresAt: z.date(),
    used: z.boolean().default(false),
    createdAt: z.date().optional(),
})

export type IInvite = z.infer<typeof InviteSchema>
