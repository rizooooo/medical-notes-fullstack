import { VisitType, NoteStatus, ActionDone, RemarkCategory } from '@/types/invoice'

export const VISIT_TYPE_LABELS: Record<VisitType, string> = {
    [VisitType.FollowUp]: 'Follow up',
    [VisitType.Admission]: 'Admission',
    [VisitType.CompreOnly]: 'Comprehensive only',
    [VisitType.Recert]: 'Recertification',
    [VisitType.RecertSupv]: 'Recertification (Supervisory)',
    [VisitType.Update]: 'Update',
    [VisitType.UpdateSupv]: 'Update (Supervisory)',
    [VisitType.PRN]: 'PRN (As needed)',
    [VisitType.RegularNotes]: 'Regular notes',
    [VisitType.TelehealthVisit]: 'Telehealth visit',
    [VisitType.DeathVisit]: 'Death visit',
    [VisitType.SupervisoryNote]: 'Supervisory note',
    [VisitType.DeclinedVisit]: 'Declined visit',
    [VisitType.CCHours]: 'CC Hours',
    [VisitType.RecertAndUpdate]: 'Recert & Update',
    [VisitType.VisitNote]: 'Visit note',
    [VisitType.CCNote]: 'CC Note',
}

export const NOTE_STATUS_LABELS: Record<NoteStatus, string> = {
    [NoteStatus.Approved]: 'Approved',
    [NoteStatus.Incomplete]: 'Incomplete',
    [NoteStatus.SubmittedForQA]: 'Submitted for QA',
    [NoteStatus.NeedsCorrection]: 'Needs correction',
    [NoteStatus.NotInTheSystem]: 'Not in the system',
    [NoteStatus.EOC]: 'End of care (EOC)',
    [NoteStatus.ForPlotting]: 'For plotting',
}

export const ACTION_DONE_LABELS: Record<ActionDone, string> = {
    [ActionDone.CompletedAndSubmitted]: 'Completed and submitted',
    [ActionDone.CompletedAndSavedAsDraft]: 'Saved as draft',
}

export const REMARK_CATEGORY_LABELS: Record<RemarkCategory, string> = {
    [RemarkCategory.Tallied]: 'Tallied',
    [RemarkCategory.DateNotInTheSystem]: 'Date not in system',
    [RemarkCategory.EndOfCare]: 'End of care',
    [RemarkCategory.LackingPSFE]: 'Lacking PSFE',
    [RemarkCategory.NoAssessment]: 'No assessment',
    [RemarkCategory.FreeText]: 'Free text remark',
}

export function formatVisitType(type: VisitType | string): string {
    return VISIT_TYPE_LABELS[type as VisitType] || type
}

export function formatNoteStatus(status: NoteStatus | string): string {
    return NOTE_STATUS_LABELS[status as NoteStatus] || status
}
