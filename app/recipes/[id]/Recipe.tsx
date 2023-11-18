"use client"

import IngredientDialog from "@/app/ingredients/IngredientDialog"
import IngredientsTable from "@/app/ingredients/IngredientsTable"
import { Button } from "@/components/ui/button"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SelectRecipe, type SelectIngredient } from "@/server/db/schema"
import { api } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
})

export default function Recipe() {
  const router = useRouter()
  const [addedIngredients, setAddedIngredients] = useState(
    [] as SelectIngredient[],
  )
  const [name, setName] = useState("")
  const ingredients = api.ingredient.search.useQuery({ name })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })
  const utils = api.useUtils()
  const insert = api.recipe.insert.useMutation({
    onSuccess: async (recipe: SelectRecipe) => {
      await utils.recipe.search.invalidate()

      router.push(`/recipes/${recipe.id}`)
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    insert.mutate({
      name: values.name,
      ingredientIds: addedIngredients.map((ingredient) => ingredient.id),
    })
  }

  return (
    <div>
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
                    <Button type="submit" disabled={insert.isLoading}>
                      {insert.isLoading ? (
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
        </form>
      </Form>
      <IngredientsTable
        ingredients={addedIngredients}
        variant="remove"
        onRemove={(ingredient) => {
          setAddedIngredients(
            addedIngredients.filter((i) => i.id !== ingredient.id),
          )
        }}
      />
      <div className="py-10">
        <Separator />
      </div>
      <div className="flex gap-4">
        <Input
          className="w-auto"
          placeholder="Search by name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <IngredientDialog />
      </div>
      <IngredientsTable
        ingredients={
          ingredients.data?.filter(
            (ingredient) =>
              !addedIngredients.some(
                (addedIngredient) => addedIngredient.id === ingredient.id,
              ),
          ) ?? []
        }
        variant="add"
        onAdd={(ingredient) => {
          setAddedIngredients([...addedIngredients, ingredient])
        }}
      />
    </div>
  )
}
