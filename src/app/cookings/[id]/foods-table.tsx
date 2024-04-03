"use client"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { useFieldArray, useFormContext } from "react-hook-form"
import { type CookingFormValues } from "./edit-cooking"

export default function FoodsTable() {
  const form = useFormContext<CookingFormValues>()

  const { fields } = useFieldArray({
    control: form.control,
    name: "foods",
  })

  return (
    <section>
      <h2>Foods</h2>

      {fields.map((field, index) => (
        <FoodForm key={field.id} foodIndex={index} />
      ))}
    </section>
  )
}

function FoodForm({ foodIndex }: { foodIndex: number }) {
  const form = useFormContext<CookingFormValues>()
  const { fields } = useFieldArray({
    control: form.control,
    name: `foods.${foodIndex}.usedIngredients`,
  })

  return (
    <div>
      <FormField
        control={form.control}
        name={`foods.${foodIndex}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {fields.map((field, index) => (
        <UsedIngredientForm
          key={field.id}
          foodIndex={foodIndex}
          ingredientIndex={index}
        />
      ))}
    </div>
  )
}

function UsedIngredientForm({
  foodIndex,
  ingredientIndex,
}: {
  foodIndex: number
  ingredientIndex: number
}) {
  const form = useFormContext<CookingFormValues>()

  return (
    <div className="flex">
      <FormField
        control={form.control}
        name={`foods.${foodIndex}.usedIngredients.${ingredientIndex}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>name</FormLabel>
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
    </div>
  )
}
