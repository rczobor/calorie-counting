"use client"

import {
  FormArrayMessage,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { type CookingFormValues } from "./edit-cooking"
import { Button } from "~/components/ui/button"
import { useEffect, useState } from "react"
import { Separator } from "~/components/ui/separator"
import { api } from "~/trpc/react"
import RecipesTable from "~/app/recipes/recipes-table"

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
              id: Infinity,
              name: recipe.name,
              recipeId: recipe.id,
              quantity: 0,
              usedIngredients: ingredients.map((ingredient) => ({
                id: ingredient.id,
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

function FoodForm({
  foodIndex,
  removeFood,
}: {
  foodIndex: number
  removeFood: () => void
}) {
  const form = useFormContext<CookingFormValues>()
  const { fields, remove } = useFieldArray({
    control: form.control,
    name: `foods.${foodIndex}.usedIngredients`,
  })
  const ingredients = useWatch({
    control: form.control,
    name: `foods.${foodIndex}.usedIngredients`,
  })
  const quantity = useWatch({
    control: form.control,
    name: `foods.${foodIndex}.quantity`,
  })
  const totalCalories = ingredients.reduce(
    (acc, ingredient) =>
      acc + Math.round(ingredient.calories * (ingredient.quantity / 100)),
    0 as number,
  )
  const calories = Math.round(totalCalories / (quantity / 100))

  return (
    <>
      <Separator />

      <div className="flex items-end gap-4">
        <FormField
          control={form.control}
          name={`foods.${foodIndex}.quantity`}
          render={({ field }) => (
            <FormItem className="max-w-24">
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`foods.${foodIndex}.name`}
          render={({ field }) => (
            <FormItem>
              <div>{field.value}</div>
            </FormItem>
          )}
        />

        <Button variant="destructive" onClick={removeFood}>
          Delete
        </Button>

        {!!quantity && (
          <div>
            {totalCalories} / {quantity} = {calories}
          </div>
        )}
      </div>

      {fields.map((field, index) => (
        <UsedIngredientForm
          key={field.id}
          foodIndex={foodIndex}
          ingredientIndex={index}
          removeIngredient={() => remove(index)}
        />
      ))}

      <FormField
        control={form.control}
        name={`foods.${foodIndex}.usedIngredients`}
        render={() => (
          <FormItem>
            <FormArrayMessage />
          </FormItem>
        )}
      />
    </>
  )
}

function UsedIngredientForm({
  foodIndex,
  ingredientIndex,
  removeIngredient,
}: {
  foodIndex: number
  ingredientIndex: number
  removeIngredient: () => void
}) {
  const form = useFormContext<CookingFormValues>()
  const ingredient = useWatch({
    control: form.control,
    name: `foods.${foodIndex}.usedIngredients.${ingredientIndex}`,
  })
  const totalCalories = Math.round(
    ingredient.calories * (ingredient.quantity / 100),
  )

  useEffect(() => {
    const ingredients = form.watch(`foods.${foodIndex}.usedIngredients`)

    form.setValue(
      `foods.${foodIndex}.quantity`,
      ingredients.reduce(
        (acc, ingredient) => acc + Number(ingredient.quantity),
        0 as number,
      ),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingredient.quantity])

  return (
    <div className="flex items-end gap-4">
      <FormField
        control={form.control}
        name={`foods.${foodIndex}.usedIngredients.${ingredientIndex}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ingredient name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`foods.${foodIndex}.usedIngredients.${ingredientIndex}.calories`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Calories/100</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`foods.${foodIndex}.usedIngredients.${ingredientIndex}.quantity`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quantity</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button variant="destructive" onClick={removeIngredient}>
        Delete
      </Button>

      <div>{totalCalories} Calories</div>
    </div>
  )
}
