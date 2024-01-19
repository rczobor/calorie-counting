"use client"

import ConfirmDelete from "@/components/confirm-delete"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type Recipe } from "@/server/db/schema"
import { api } from "@/trpc/react"
import { useRouter } from "next/navigation"
import IngredientsTable from "../ingredients/ingredients-table"

type variant = "default" | "add" | "remove"

export default function RecipesTable({
  recipes,
  variant = "default",
  accordions = false,
  onAdd,
  onRemove,
}: {
  recipes: Recipe[]
  variant?: variant
  accordions?: boolean
  onAdd?: (recipe: Recipe) => void
  onRemove?: (recipe: Recipe) => void
}) {
  const router = useRouter()
  const utils = api.useUtils()
  const deleteMutation = api.recipe.delete.useMutation({
    onSuccess: async () => {
      await utils.recipe.search.invalidate()
      router.refresh()
    },
  })

  return (
    <Table className="text-left">
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recipes.map((recipe) => (
          <Collapsible key={recipe.id} asChild>
            <>
              <TableRow key={recipe.id}>
                <TableCell>{recipe.id}</TableCell>
                <TableCell>{recipe.name}</TableCell>
                <TableCell className="flex gap-4">
                  <Button onClick={() => router.push(`/recipes/${recipe.id}`)}>
                    Edit
                  </Button>
                  {variant === "default" && (
                    <ConfirmDelete
                      onConfirm={() => deleteMutation.mutate({ id: recipe.id })}
                    />
                  )}
                  {variant === "add" && (
                    <Button
                      onClick={() => {
                        onAdd?.(recipe)
                      }}
                    >
                      Add
                    </Button>
                  )}
                  {variant === "remove" && (
                    <Button
                      onClick={() => {
                        onRemove?.(recipe)
                      }}
                    >
                      Remove
                    </Button>
                  )}
                  {accordions && (
                    <CollapsibleTrigger asChild>
                      <Button>Open</Button>
                    </CollapsibleTrigger>
                  )}
                </TableCell>
              </TableRow>
              <CollapsibleContent asChild>
                <TableRow>
                  <TableCell colSpan={3}>
                    <Ingredients recipe={recipe} />
                  </TableCell>
                </TableRow>
              </CollapsibleContent>
            </>
          </Collapsible>
        ))}
      </TableBody>
    </Table>
  )
}

function Ingredients({ recipe }: { recipe: Recipe }) {
  const ingredients = api.recipe.getIngredients.useQuery({ id: recipe.id })

  console.log(ingredients.data)

  if (!ingredients.data) return null

  return <IngredientsTable ingredients={ingredients.data} />
}
