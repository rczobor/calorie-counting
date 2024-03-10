"use client"

import RecipesTable from "@/app/recipes/recipes-table"
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
import { type Recipe } from "@/server/db/schema"
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

export default function CreateCooking() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [addedRecipes, setAddedRecipes] = useState<Recipe[]>([])
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })
  const recipes = api.recipe.search.useQuery({
    name,
  })
  const utils = api.useUtils()
  const upsert = api.cooking.insert.useMutation({
    onSuccess: async (cooking) => {
      await utils.cooking.search.invalidate()
      router.push(`/cookings/${cooking.id}`)
      router.refresh()
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    upsert.mutate({
      name: values.name,
      recipes: addedRecipes,
    })
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
                    <Button type="submit" disabled={upsert.isLoading}>
                      {upsert.isLoading ? (
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
      <RecipesTable
        variant="remove"
        recipes={addedRecipes}
        accordions
        onRemove={(recipe) => {
          setAddedRecipes(addedRecipes.filter((i) => i.id !== recipe.id))
        }}
      />
      <section>
        <h2 className="text-lg font-bold">Recipes</h2>
        <div className="flex gap-4">
          <Input
            className="w-auto"
            placeholder="Search by name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Button onClick={() => router.push("/recipes/new")}>Create</Button>
        </div>
        <RecipesTable
          variant="add"
          recipes={
            recipes.data?.filter(
              (recipe) =>
                !addedRecipes.some(
                  (addedRecipe) => addedRecipe.id === recipe.id,
                ),
            ) ?? []
          }
          accordions
          onAdd={(ingredient) => setAddedRecipes([...addedRecipes, ingredient])}
        />
      </section>
    </div>
  )
}
