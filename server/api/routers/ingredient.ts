import { eq, like } from "drizzle-orm"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { ingredients, recipeToIngredients } from "@/server/db/schema"

export const ingredientRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(
      z.object({
        id: z.number().optional(),
        name: z.string().min(1),
        calories: z.number().nonnegative(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const insert = await ctx.db
        .insert(ingredients)
        .values({
          id: input.id,
          name: input.name,
          calories: input.calories,
        })
        .onDuplicateKeyUpdate({
          set: {
            name: input.name,
            calories: input.calories,
          },
        })

      const id = input.id ?? +insert.insertId

      const ingredient = await ctx.db.query.ingredients.findFirst({
        where: eq(ingredients.id, id),
      })

      if (!ingredient) {
        throw new Error("not found")
      }

      return { ingredient }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(ingredients).where(eq(ingredients.id, input.id))
      await ctx.db
        .delete(recipeToIngredients)
        .where(eq(recipeToIngredients.ingredientId, input.id))
    }),

  search: protectedProcedure
    .input(z.object({ name: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.ingredients.findMany({
        where: like(ingredients.name, `%${input.name}%`),
        orderBy: (ingredients, { desc }) => [desc(ingredients.updatedAt)],
        limit: 10,
      })
    }),
})
