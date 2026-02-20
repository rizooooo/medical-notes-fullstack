import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { deleteNurseFn } from '@/server/nurse/nurse.functions'
import type { INurse } from '@/server/nurse/nurse.schema'

interface DeleteNurseDialogProps {
    nurse: INurse
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function DeleteNurseDialog({
    nurse,
    open,
    onOpenChange,
    onSuccess,
}: DeleteNurseDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            await deleteNurseFn({ data: nurse._id })
            onOpenChange(false)
            if (onSuccess) {
                onSuccess()
            }
        } catch (error) {
            console.error('Failed to delete nurse:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Nurse</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{nurse.name}</strong>? This
                        action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete Record
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
