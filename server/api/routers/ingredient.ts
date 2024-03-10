import { eq, like } from "drizzle-orm"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { ingredients } from "@/server/db/schema"

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
      const [ingredient] = await ctx.db
        .insert(ingredients)
        .values({
          id: input.id,
          name: input.name,
          calories: input.calories,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: ingredients.id,
          set: { name: input.name, calories: input.calories },
        })
        .returning()

      if (!ingredient) {
        throw new Error("Created Ingredient not found")
      }

      return ingredient
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) =>
      ctx.db.delete(ingredients).where(eq(ingredients.id, input.id)),
    ),

  search: protectedProcedure
    .input(z.object({ name: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db.query.ingredients.findMany({
        where: like(ingredients.name, `%${input.name}%`),
        orderBy: (ingredients, { desc }) => [desc(ingredients.updatedAt)],
        limit: 10,
      }),
    ),
})
