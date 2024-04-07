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
import { useFieldArray, useFormContext } from "react-hook-form"
import { type CookingFormValues } from "./edit-cooking"
import { Button } from "~/components/ui/button"

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

  return (
    <>
      <div className="flex">
        <FormField
          control={form.control}
          name={`foods.${foodIndex}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Food name</FormLabel>
              <FormControl>
                <div className="flex gap-4">
                  <Input placeholder="Food name" {...field} />
                  <Button variant="destructive" onClick={removeFood}>
                    Delete
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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

  return (
    <div className="flex items-end gap-4">
      <FormField
        control={form.control}
        name={`foods.${foodIndex}.usedIngredients.${ingredientIndex}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ingredient name</FormLabel>
            <FormControl>
              <Input placeholder="Ingredient name" {...field} />
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
            <FormLabel>Calories</FormLabel>
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
    </div>
  )
}
