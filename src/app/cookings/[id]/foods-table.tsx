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
import { useEffect } from "react"

export default function FoodsTable() {
  const form = useFormContext<CookingFormValues>()

  const { fields, remove } = useFieldArray({
    control: form.control,
    name: "foods",
  })

  return (
    <section className="flex flex-col gap-4">
      {fields.map((field, index) => (
        <FoodForm
          key={field.id}
          foodIndex={index}
          removeFood={() => remove(index)}
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
      <div className="flex items-end gap-4">
        <FormField
          control={form.control}
          name={`foods.${foodIndex}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Food name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`foods.${foodIndex}.quantity`}
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
