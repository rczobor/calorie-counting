"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import { api } from "@/trpc/react"
import CreateIngredientDialog from "./create-ingredient-dialog"

function IngredientsTable() {
  const [name, setName] = useState("")
  const ingredients = api.ingredient.search.useQuery({
    name,
  })
  const deleteIngredient = api.ingredient.delete.useMutation({
    onSuccess: async () => {
      await ingredients.refetch()
    },
  })

  return (
    <div className="mx-auto w-8/12">
      <Input
        className="w-auto"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <CreateIngredientDialog onCreate={() => ingredients.refetch()} />
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
          {ingredients.data?.map((ingredient) => (
            <TableRow key={ingredient.id}>
              <TableCell>{ingredient.id}</TableCell>
              <TableCell>{ingredient.name}</TableCell>
              <TableCell>{ingredient.calories}</TableCell>
              <TableCell>
                <Button>Edit</Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteIngredient.mutate({ id: ingredient.id })
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default IngredientsTable
