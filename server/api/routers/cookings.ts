import { eq, inArray, like } from "drizzle-orm"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import {
  cookings,
  foods,
  recipeToIngredients,
  usedIngredients,
} from "@/server/db/schema"

export const cookingRouter = createTRPCRouter({
  insert: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        recipes: z.array(z.object({ id: z.number(), name: z.string() })),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const query = await ctx.db.insert(cookings).values({
        name: input.name,
      })

      for (const recipe of input.recipes) {
        const food = await ctx.db.insert(foods).values({
          cookingId: +query.insertId,
          recipeId: recipe.id,
          name: recipe.name,
        })

        const recipeToIngredientsList =
          await ctx.db.query.recipeToIngredients.findMany({
            where: eq(recipeToIngredients.recipeId, recipe.id),
          })

        const ingredientIds = recipeToIngredientsList.map((r) => r.ingredientId)

        const ingredients = await ctx.db.query.ingredients.findMany({
          where: (ingredients) => inArray(ingredients.id, ingredientIds),
        })

        for (const ingredient of ingredients) {
          await ctx.db.insert(usedIngredients).values({
            foodId: +food.insertId,
            name: ingredient.name,
            calories: ingredient.calories,
          })
        }
      }

      return query.insertId
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(cookings)
        .set({ name: input.name })
        .where(eq(cookings.id, input.id))
    }),

  search: protectedProcedure
    .input(z.object({ name: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.cookings.findMany({
        where: like(cookings.name, `%${input.name}%`),
        orderBy: (cookings, { desc }) => [desc(cookings.updatedAt)],
        limit: 10,
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const relatedFoods = await ctx.db.query.foods.findMany({
        where: eq(foods.cookingId, input.id),
        with: { usedIngredients: true },
      })
      const relatedUsedIngredients = relatedFoods.flatMap(
        (f) => f.usedIngredients,
      )

      await ctx.db.delete(usedIngredients).where(
        inArray(
          usedIngredients.id,
          relatedUsedIngredients.map((i) => i.id),
        ),
      )
      await ctx.db.delete(foods).where(eq(foods.cookingId, input.id))
      await ctx.db.delete(cookings).where(eq(cookings.id, input.id))
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.cookings.findFirst({
        where: eq(cookings.id, input.id),
        with: {
          foods: { with: { usedIngredients: true } },
        },
      })
    }),
})
