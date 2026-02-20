'use client'

import * as React from 'react'
import { useRouter } from '@tanstack/react-router'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DialogWrapper } from '@/components/layout/DialogWrapper'
import { deleteInvoiceFn } from '@/server/invoice/invoice.functions'
import type { IInvoice } from '@/server/invoice/invoice.schema'

interface DeleteInvoiceModalProps {
    invoice: IInvoice
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function DeleteInvoiceModal({
    invoice,
    open,
    onOpenChange,
    onSuccess,
}: DeleteInvoiceModalProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteInvoiceFn({ data: invoice._id })
            onOpenChange(false)
            onSuccess?.()
            router.invalidate()
        } catch (error) {
            console.error('Failed to delete invoice:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    const footer = (
        <div className="flex gap-3 w-full">
            <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isDeleting}
                className="flex-1 rounded-xl h-12 font-bold text-slate-500 hover:bg-slate-50"
            >
                Cancel
            </Button>
            <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-[1.5] rounded-xl h-12 font-bold bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-100 text-white transition-all active:scale-95"
            >
                {isDeleting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                    </>
                ) : (
                    'Confirm Deletion'
                )}
            </Button>
        </div>
    )

    return (
        <DialogWrapper
            open={open}
            onOpenChange={onOpenChange}
            title="Delete Invoice"
            description="This action is irreversible. All associated billing data for this period will be permanently removed."
            footer={footer}
        >
            <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100 flex gap-4 items-start">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">
                        Permanently delete <span className="text-indigo-600">#{invoice.invoiceNumber}</span>?
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight">
                        Facility: {invoice.hospiceName}<br />
                        Period: {new Date(invoice.periodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>
        </DialogWrapper>
    )
}
