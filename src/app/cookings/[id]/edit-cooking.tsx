"use client"

import { Button } from "~/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { type CookingWithFoodsWithUsedIngredients } from "~/server/db/schema"
import { api } from "~/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import FoodsTable from "./foods-table"

const formSchema = z.object({
  id: z.number().int(),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  foods: z.array(
    z.object({
      id: z.number().int(),
      recipeId: z.number(),
      name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
      }),
      usedIngredients: z.array(
        z.object({
          id: z.number().int(),
          name: z.string().min(2, {
            message: "Name must be at least 2 characters.",
          }),
          calories: z.coerce.number().int().min(0, {
            message: "Calories must be a positive number.",
          }),
          quantity: z.coerce.number().int().min(0, {
            message: "Quantity must be a positive number.",
          }),
        }),
      ),
    }),
  ),
})

export type CookingFormValues = z.infer<typeof formSchema>

export default function EditCooking({
  cooking,
}: {
  cooking: CookingWithFoodsWithUsedIngredients
}) {
  const router = useRouter()
  const form = useForm<CookingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: cooking.id,
      name: cooking.name,
      foods: cooking.foods.map((food) => ({
        id: food.id,
        name: food.name,
        recipeId: food.recipeId,
        usedIngredients: food.usedIngredients.map((ingredient) => ({
          id: ingredient.id,
          name: ingredient.name,
          calories: ingredient.calories,
          quantity: ingredient.quantity ?? 0,
        })),
      })),
    },
  })
  const utils = api.useUtils()
  const update = api.cooking.update.useMutation({
    onSuccess: async () => {
      await utils.cooking.search.invalidate()
      router.refresh()
    },
  })

  function onSubmit(values: CookingFormValues) {
    update.mutate(values)
  }

  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <div className="flex gap-4">
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <Button type="submit" disabled={update.isPending}>
                      {update.isPending ? (
                        <>
                          <ReloadIcon className="mr-2 animate-spin" />
                          Please wait
                        </>
                      ) : (
                        <>Save</>
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FoodsTable />
        </form>
      </Form>
    </div>
  )
}
