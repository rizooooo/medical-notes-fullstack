import { createServerFn, createMiddleware } from '@tanstack/react-start'
import * as repo from './employee.repo'
import { EmployeeRole } from './employee.schema'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { createToken, verifyToken } from '../lib/auth'
import { getRequestIP, getRequestHeader, getCookie, setCookie, deleteCookie } from '@tanstack/react-start/server'

// Define the middleware correctly using createMiddleware().server()
export const authMiddleware = createMiddleware().server(async ({ next }) => {
    const token = getRequestHeader('authorization')?.replace('Bearer ', '') || getCookie('mn-token')
    if (!token) throw new Error('Unauthorized')

    const payload = await verifyToken(token)
    if (!payload || typeof payload === 'string') throw new Error('Unauthorized')

    // Pass the user payload to the context
    return next({ context: { user: payload } })
})

// Server function to get all employees
export const getEmployeesFn = createServerFn({ method: 'GET' })
    .middleware([authMiddleware])
    .handler(async () => {
        return await repo.getEmployees()
    })

// Server function to invite a new employee
export const inviteEmployeeFn = createServerFn({ method: 'POST' })
    .inputValidator(z.object({ email: z.string().email(), role: z.nativeEnum(EmployeeRole) }))
    .handler(async ({ data: input }) => {
        const existing = await repo.getEmployeeByEmail(input.email)
        if (existing) throw new Error('Employee already exists')

        const token = crypto.randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

        await repo.createInvite({
            email: input.email,
            role: input.role,
            token,
            expiresAt,
            used: false
        })

        console.log(`[INVITE SENT] To: ${input.email}, Link: /register?token=${token}`)
        return { success: true, token }
    })

// Server function to register an employee via invite
export const registerEmployeeFn = createServerFn({ method: 'POST' })
    .inputValidator(z.object({
        token: z.string(),
        password: z.string().min(6),
        name: z.string().min(2)
    }))
    .handler(async ({ data: input }) => {
        const invite = await repo.getInviteByToken(input.token)
        if (!invite) throw new Error('Invalid or expired invitation')
        if (invite.expiresAt < new Date()) throw new Error('Invitation expired')

        const hashedPassword = await bcrypt.hash(input.password, 10)

        const employeeId = await repo.createEmployee({
            name: input.name,
            email: invite.email,
            role: invite.role,
            password: hashedPassword,
            loginLogs: []
        })

        await repo.markInviteUsed(invite._id!)
        return { success: true, employeeId }
    })

// Server function for login
export const loginFn = createServerFn({ method: 'POST' })
    .inputValidator(z.object({ email: z.string().email(), password: z.string() }))
    .handler(async ({ data: input }) => {
        const employee = await repo.getEmployeeByEmail(input.email)
        if (!employee || !employee.password) {
            throw new Error('Invalid credentials')
        }

        const isMatch = await bcrypt.compare(input.password, employee.password)
        if (!isMatch) {
            throw new Error('Invalid credentials')
        }

        const ip = getRequestIP({ xForwardedFor: true }) || '127.0.0.1'
        const userAgent = getRequestHeader('user-agent') || 'Web Browser'

        const updatedLogs = [...(employee.loginLogs || []), {
            timestamp: new Date(),
            ip: ip.split(',')[0].trim(),
            device: userAgent
        }]

        await repo.updateEmployee(employee._id!, {
            lastLogin: new Date(),
            loginLogs: updatedLogs
        })

        const token = await createToken({
            id: employee._id,
            email: employee.email,
            name: employee.name,
            role: employee.role
        })

        setCookie('mn-token', token, {
            path: '/',
            maxAge: 60 * 60 * 24, // 1 day
            sameSite: 'lax'
        })

        return {
            success: true,
            token,
            employee: {
                id: employee._id,
                email: employee.email,
                name: employee.name,
                role: employee.role
            }
        }
    })

export const getEmployeeFn = createServerFn({ method: 'GET' })
    .inputValidator(z.string())
    .middleware([authMiddleware])
    .handler(async ({ data: id }) => {
        return await repo.getEmployeeById(id)
    })

export const resetPasswordFn = createServerFn({ method: 'POST' })
    .inputValidator(z.object({
        id: z.string(),
        newPassword: z.string().min(6)
    }))
    .middleware([authMiddleware])
    .handler(async ({ data: input }) => {
        const hashedPassword = await bcrypt.hash(input.newPassword, 10)
        await repo.updateEmployee(input.id, { password: hashedPassword })
        return { success: true }
    })

export const logoutFn = createServerFn({ method: 'POST' })
    .handler(async () => {
        deleteCookie('mn-token')
        return { success: true }
    })
