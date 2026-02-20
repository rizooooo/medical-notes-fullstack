import { z } from 'zod'
import type { IBaseEntity, IAuditTrail } from '@/types/common'

export enum QAStatus {
    InProgress = 'InProgress',
    Completed = 'Completed',
    Incomplete = 'Incomplete',
    SkinIssue = 'SkinIssue',
    Concern = 'Concern',
    Declined = 'Declined',
    Empty = 'Empty'
}

export const ALL_QA_COLUMNS = [
    { id: 'lcd', label: 'LCD', group: 'Clinical' },
    { id: 'rn_comp', label: 'RN COMPREHENSIVE / RECERT', group: 'Clinical' },
    { id: 'rn_assess', label: 'RN ASSESSMENT', group: 'Clinical' },
    { id: 'visit_notes', label: 'VISIT NOTES', group: 'Clinical' },
    { id: 'medrecon', label: 'MEDRECON', group: 'Clinical' },
    { id: 'idg', label: 'IDG', group: 'Admin' },
    { id: 'poc', label: 'POC', group: 'Admin' },
    { id: 'cti', label: 'CTI', group: 'Admin' },
    { id: 'hp_ftf', label: 'H&P AND FTF', group: 'Admin' },
    { id: 'idg_sigs', label: 'IDG SIGNATURES', group: 'Admin' },
    { id: 'ha_assign', label: 'HA ASSIGNMENT', group: 'Home Aide' },
    { id: 'ha_visit', label: 'HA VISIT', group: 'Home Aide' },
    { id: 'fov', label: 'FOV', group: 'Home Aide' },
    { id: 'orders', label: 'ORDERS', group: 'Other' },
    { id: 'commlog', label: 'COMMLOG', group: 'Other' },
    { id: 'assess_sc_msw', label: 'ASSESSMENT (SC & MSW)', group: 'Other' },
    { id: 'bereavement', label: 'BEREAVEMENT', group: 'Other' },
    { id: 'volunteer', label: 'VOLUNTEER', group: 'Other' },
    { id: 'compilation', label: 'COMPILATION / CONCERNS', group: 'Other' },
    { id: 'discharge', label: 'DISCHARGE', group: 'Other' },
] as const

export interface IQADocument {
    id: string
    name: string
    status: QAStatus
    comment?: string
    updatedAt?: Date
    auditLog?: IAuditTrail[]
}

export interface IQAPatientReview {
    patientId: string
    patientName: string
    mrn?: string
    overallStatus: QAStatus
    remarks?: string
    documents: Record<string, IQADocument>
    auditLog?: IAuditTrail[]
}

export interface IQAAssignment extends IBaseEntity<string> {
    hospiceId: string
    hospiceName: string
    month: number
    year: number
    assignedQA: string[]
    assignedIDG?: string
    assignedNonClinical?: string
    assignedMD?: string
    specialInstructions?: string
    reviews: IQAPatientReview[]
    auditLog?: IAuditTrail[]
    // Stats
    totalActivePatients: number
    totalDischargedPatients: number
    totalSNs: number
}

export const QARAuditTrailSchema = z.object({
    timestamp: z.coerce.date(),
    userId: z.string(),
    userName: z.string(),
    action: z.enum(['CREATE', 'UPDATE']),
    changes: z.array(z.object({
        field: z.string(),
        oldValue: z.any(),
        newValue: z.any(),
    })).optional(),
})

export const QAReviewSchema = z.object({
    patientId: z.string(),
    patientName: z.string(),
    mrn: z.string().optional(),
    overallStatus: z.string(),
    remarks: z.string().optional(),
    documents: z.record(z.string(), z.object({
        id: z.string(),
        name: z.string(),
        status: z.string(),
        comment: z.string().optional(),
        auditLog: z.array(QARAuditTrailSchema).optional(),
    })),
    auditLog: z.array(QARAuditTrailSchema).optional(),
})

export const QAAssignmentSchema = z.object({
    hospiceId: z.string(),
    hospiceName: z.string(),
    month: z.number().min(1).max(12),
    year: z.number(),
    assignedQA: z.array(z.string()),
    assignedIDG: z.string().optional(),
    assignedNonClinical: z.string().optional(),
    assignedMD: z.string().optional(),
    specialInstructions: z.string().optional(),
    totalActivePatients: z.number().default(0),
    totalDischargedPatients: z.number().default(0),
    totalSNs: z.number().default(0),
    reviews: z.array(QAReviewSchema).default([]),
})
