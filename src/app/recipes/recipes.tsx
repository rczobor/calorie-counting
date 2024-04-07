"use client"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { api } from "~/trpc/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import RecipesTable from "./recipes-table"

export default function Recipes() {
  const router = useRouter()
  const [name, setName] = useState("")
  const recipes = api.recipe.search.useQuery({
    name,
  })

  return (
    <>
      <div className="flex gap-4">
        <Input
          className="w-auto"
          placeholder="Search by name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button onClick={() => router.push("/recipes/new")}>Create</Button>
      </div>
      {recipes.data && <RecipesTable recipes={recipes.data} />}
    </>
  )
}
