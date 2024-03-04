"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { type FoodWithUsedIngredients } from "@/server/db/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm, useFormContext } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  foods: z.array(
    z.object({
      name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
      }),
      id: z.number().int(),
      usedIngredients: z.array(
        z.object({
          id: z.number().int(),
          name: z.string().min(2, {
            message: "Name must be at least 2 characters.",
          }),
          calories: z.number().int().min(0, {
            message: "Calories must be a positive number.",
          }),
          quantity: z.number().int().min(0, {
            message: "Quantity must be a positive number.",
          }),
        }),
      ),
    }),
  ),
})

export default function FoodsTable({
  foods,
}: {
  foods: FoodWithUsedIngredients[]
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      foods: foods.map((food) => ({
        id: food.id,
        name: food.name,
        usedIngredients: food.usedIngredients.map((ingredient) => ({
          id: ingredient.id,
          name: ingredient.name,
          calories: ingredient.calories,
          quantity: ingredient.quantity ?? 0,
        })),
      })),
    },
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: "foods",
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <section>
      <h2>Foods</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FoodForm foodIndex={index} />
            </div>
          ))}
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </section>
  )
}

function FoodForm({ foodIndex }: { foodIndex: number }) {
  const form = useFormContext<z.infer<typeof formSchema>>()
  const { fields } = useFieldArray({
    control: form.control,
    name: `foods.${foodIndex}.usedIngredients`,
  })

  return (
    <>
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
    </>
  )
}

function UsedIngredientForm({
  foodIndex,
  ingredientIndex,
}: {
  foodIndex: number
  ingredientIndex: number
}) {
  const form = useFormContext()

  return (
    <>
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
    </>
  )
}
