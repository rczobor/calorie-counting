"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { type Ingredient } from "@/server/db/schema"
import { api } from "@/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  calories: z.coerce
    .number()
    .nonnegative({ message: "Calories must be a positive number" }),
})

export default function IngredientDialog({
  ingredient,
  onAdd,
}: {
  ingredient?: Ingredient
  onAdd?: (ingredient: Ingredient) => void
}) {
  const [open, setOpen] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ingredient?.name ?? "",
      calories: ingredient?.calories ?? 0,
    },
  })
  const utils = api.useUtils()
  const upsert = api.ingredient.upsert.useMutation({
    onSuccess: async ({ ingredient }) => {
      setOpen(false)
      form.reset()
      onAdd?.(ingredient)
      await utils.ingredient.search.invalidate()
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    upsert.mutate({ ...values, id: ingredient?.id })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{ingredient ? "Edit" : "Create"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create Ingredient</DialogTitle>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormDescription>Name of the ingredient.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories</FormLabel>
                    <FormControl>
                      <Input placeholder="Calories" {...field} />
                    </FormControl>
                    <FormDescription>Calories per 100 gram.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end pt-4">
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
