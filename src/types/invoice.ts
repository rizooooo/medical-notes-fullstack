export enum VisitType {
    FollowUp = 'FollowUp',
    Admission = 'Admission',
    CompreOnly = 'CompreOnly',
    Recert = 'Recert',
    RecertSupv = 'RecertSupv',
    Update = 'Update',
    UpdateSupv = 'UpdateSupv',
    PRN = 'PRN',
    RegularNotes = 'RegularNotes',
    TelehealthVisit = 'TelehealthVisit',
    DeathVisit = 'DeathVisit',
    SupervisoryNote = 'SupervisoryNote',
    DeclinedVisit = 'DeclinedVisit',
    CCHours = 'CCHours',
    RecertAndUpdate = 'RecertAndUpdate',
    VisitNote = 'VisitNote',
    CCNote = 'CCNote',
}

export enum ActionDone {
    CompletedAndSubmitted = 'CompletedAndSubmitted',
    CompletedAndSavedAsDraft = 'CompletedAndSavedAsDraft',
}

export enum RemarkCategory {
    Tallied = 'Tallied',
    DateNotInTheSystem = 'DateNotInTheSystem',
    EndOfCare = 'EndOfCare',
    LackingPSFE = 'LackingPSFE',
    NoAssessment = 'NoAssessment',
    FreeText = 'FreeText',
}

export enum NoteStatus {
    Approved = 'Approved',
    Incomplete = 'Incomplete',
    SubmittedForQA = 'SubmittedForQA',
    NeedsCorrection = 'NeedsCorrection',
    NotInTheSystem = 'NotInTheSystem',
    EOC = 'EOC',
    ForPlotting = 'ForPlotting',
}

export enum InvoiceStatus {
    Draft = 'Draft',
    Sent = 'Sent',
    Paid = 'Paid',
    Void = 'Void',
    Overdue = 'Overdue',
}
