"use client"

import IngredientDialog from "~/app/ingredients/ingredient-dialog"
import IngredientsTable from "~/app/ingredients/ingredients-table"
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
import { Separator } from "~/components/ui/separator"
import { type Ingredient, type RecipeWithIngredient } from "~/server/db/schema"
import { api } from "~/trpc/react"
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

export default function Recipe({ recipe }: { recipe?: RecipeWithIngredient }) {
  const router = useRouter()
  const [addedIngredients, setAddedIngredients] = useState(
    recipe?.recipeToIngredients
      .map((v) => v.ingredient)
      .sort((a, b) => {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      }) ?? ([] as Ingredient[]),
  )
  const [name, setName] = useState("")
  const ingredients = api.ingredient.search.useQuery({ name })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: recipe?.name ?? "",
    },
  })
  const utils = api.useUtils()
  const upsert = api.recipe.upsert.useMutation({
    onSuccess: async (response) => {
      await utils.recipe.search.invalidate()
      if (!recipe) {
        router.push(`/recipes/${response.id}`)
      }
      router.refresh()
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    upsert.mutate({
      name: values.name,
      ingredientIds: addedIngredients.map((ingredient) => ingredient.id),
      id: recipe?.id,
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
                    <Button type="submit" disabled={upsert.isPending}>
                      {upsert.isPending ? (
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
        <IngredientDialog
          onAdd={(ingredient) =>
            setAddedIngredients([...addedIngredients, ingredient])
          }
        />
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
