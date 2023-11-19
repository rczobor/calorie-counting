import { Button } from "./ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"

export default function ConfirmDelete({
  disabled,
  onConfirm,
}: {
  disabled?: boolean
  onConfirm?: () => void
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" disabled={disabled}>
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Are you sure?</DialogTitle>
        <div className="flex justify-end gap-4">
          <DialogClose asChild>
            <Button variant="destructive" onClick={() => onConfirm?.()}>
              Confirm
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Cancel</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
