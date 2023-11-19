"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type Ingredient } from "@/server/db/schema"
import { api } from "@/trpc/react"
import { useRouter } from "next/navigation"
import IngredientDialog from "./ingredient-dialog"
import ConfirmDelete from "@/components/confirm-delete"

type variant = "default" | "add" | "remove"

export default function IngredientsTable({
  ingredients,
  variant = "default",
  onAdd,
  onRemove,
}: {
  ingredients: Ingredient[]
  variant?: variant
  onAdd?: (ingredient: Ingredient) => void
  onRemove?: (ingredient: Ingredient) => void
}) {
  const router = useRouter()
  const utils = api.useUtils()
  const deleteIngredient = api.ingredient.delete.useMutation({
    onSuccess: async () => {
      await utils.ingredient.search.invalidate()
      router.refresh()
    },
  })

  return (
    <Table className="text-left">
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Calories</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ingredients.map((ingredient) => (
          <TableRow key={ingredient.id}>
            <TableCell>{ingredient.id}</TableCell>
            <TableCell>{ingredient.name}</TableCell>
            <TableCell>{ingredient.calories?.toString()}</TableCell>
            <TableCell className="flex gap-4">
              <IngredientDialog ingredient={ingredient} />
              {variant === "default" && (
                <ConfirmDelete
                  onConfirm={() =>
                    deleteIngredient.mutate({ id: ingredient.id })
                  }
                />
              )}
              {variant === "add" && (
                <Button
                  onClick={() => {
                    onAdd?.(ingredient)
                  }}
                >
                  Add
                </Button>
              )}
              {variant === "remove" && (
                <Button
                  onClick={() => {
                    onRemove?.(ingredient)
                  }}
                >
                  Remove
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
