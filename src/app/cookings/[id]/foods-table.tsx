"use client"

import { FormArrayMessage, FormField, FormItem } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { useFieldArray, useFormContext } from "react-hook-form"
import { type CookingFormValues } from "./edit-cooking"
import { useState } from "react"
import { api } from "~/trpc/react"
import RecipesTable from "~/app/recipes/recipes-table"
import FoodForm from "./food-form"

export default function FoodsTable() {
  const form = useFormContext<CookingFormValues>()
  const [recipeSearch, setRecipeSearch] = useState("")
  const recipes = api.recipe.search.useQuery({
    name: recipeSearch,
  })
  const { mutateAsync: getIngredients } =
    api.recipe.getIngredientsMutation.useMutation()
  const { fields, remove, append } = useFieldArray({
    control: form.control,
    name: "foods",
  })

  return (
    <section className="flex flex-col gap-4">
      {fields.map((field, index) => (
        <FoodForm
          key={field.id}
          foodIndex={index}
          removeFood={async () => remove(index)}
        />
      ))}

      <FormField
        control={form.control}
        name={"foods"}
        render={() => (
          <FormItem>
            <FormArrayMessage />
          </FormItem>
        )}
      />

      <section>
        <h2 className="text-lg font-bold">Recipes</h2>
        <div className="flex gap-4">
          <Input
            className="w-auto"
            placeholder="Search by name"
            value={recipeSearch}
            onChange={(event) => setRecipeSearch(event.target.value)}
          />
        </div>
        <RecipesTable
          variant="add"
          recipes={
            recipes.data?.filter(
              (recipe) =>
                !fields.some(
                  (addedRecipe) => addedRecipe.recipeId === recipe.id,
                ),
            ) ?? []
          }
          accordions
          onAdd={async (recipe) => {
            const ingredients = await getIngredients({ id: recipe.id })

            append({
              id: null,
              name: recipe.name,
              recipeId: recipe.id,
              quantity: 0,
              usedIngredients: ingredients.map((ingredient) => ({
                id: null,
                foodId: null,
                name: ingredient.name,
                calories: ingredient.calories,
                quantity: 0,
              })),
            })

            await form.trigger()
          }}
        />
      </section>
    </section>
  )
}
