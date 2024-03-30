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
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
})

export default function EditCooking({
  cooking,
}: {
  cooking: CookingWithFoodsWithUsedIngredients
}) {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: cooking.name },
  })
  const utils = api.useUtils()
  const update = api.cooking.update.useMutation({
    onSuccess: async () => {
      await utils.cooking.search.invalidate()
      router.refresh()
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    update.mutate({
      id: cooking?.id,
      name: values.name,
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
        </form>
      </Form>

      <FoodsTable foods={cooking.foods} />
    </div>
  )
}
