"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { api } from "@/trpc/react"
import { useState } from "react"

export default function CreateIngredientDialog({
  onCreate,
}: {
  onCreate?: () => void
}) {
  const [name, setName] = useState("")
  const createIngredient = api.ingredient.create.useMutation({
    onSuccess: () => {
      setName("")
      onCreate?.()
    },
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create Ingredient</DialogTitle>
        <div>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <DialogClose asChild>
            <Button onClick={() => createIngredient.mutate({ name })}>
              Create
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
