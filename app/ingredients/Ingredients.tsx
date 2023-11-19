"use client"

import { Input } from "@/components/ui/input"
import { useState } from "react"
import { api } from "@/trpc/react"
import IngredientDialog from "./ingredient-dialog"
import IngredientsTable from "./ingredients-table"

export default function Ingredients() {
  const [name, setName] = useState("")
  const ingredients = api.ingredient.search.useQuery({
    name,
  })

  return (
    <div className="mx-auto w-8/12">
      <div className="flex gap-4">
        <Input
          className="w-auto"
          placeholder="Search by name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <IngredientDialog />
      </div>
      {ingredients.data && <IngredientsTable ingredients={ingredients.data} />}
    </div>
  )
}
