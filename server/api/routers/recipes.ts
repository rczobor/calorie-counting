import { and, eq, inArray, like, not, sql } from "drizzle-orm"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { recipes, recipeToIngredients } from "@/server/db/schema"

export const recipeRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        recipeId: z.number().optional(),
        ingredientIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(recipes)
        .values({
          id: input.recipeId,
          name: input.name,
        })
        .onDuplicateKeyUpdate({
          set: {
            name: input.name,
          },
        })

      const recipe = await ctx.db.query.recipes.findFirst({
        where: eq(recipes.name, input.name),
      })

      if (!recipe) {
        throw new Error("not found")
      }

      if (input.ingredientIds.length > 0) {
        await ctx.db
          .delete(recipeToIngredients)
          .where(
            and(
              eq(recipeToIngredients.recipeId, recipe.id),
              not(
                inArray(recipeToIngredients.ingredientId, input.ingredientIds),
              ),
            ),
          )
      } else {
        await ctx.db
          .delete(recipeToIngredients)
          .where(eq(recipeToIngredients.recipeId, recipe.id))
      }

      if (input.ingredientIds.length > 0) {
        await ctx.db
          .insert(recipeToIngredients)
          .values(
            input.ingredientIds.map((ingredientId) => ({
              recipeId: recipe.id,
              ingredientId,
            })),
          )
          .onDuplicateKeyUpdate({
            set: {
              recipeId: sql`recipeId`,
              ingredientId: sql`ingredientId`,
            },
          })
      }

      return recipe
    }),

  search: protectedProcedure
    .input(z.object({ name: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.recipes.findMany({
        where: like(recipes.name, `%${input.name}%`),
        orderBy: (recipes, { desc }) => [desc(recipes.updatedAt)],
        limit: 10,
      })
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number().optional() }))
    .query(({ ctx, input }) => {
      if (input.id === undefined) {
        return
      }
      return ctx.db.query.recipes.findFirst({
        where: eq(recipes.id, input.id),
        with: {
          recipeToIngredients: {
            with: {
              ingredient: true,
            },
          },
        },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(recipes).where(eq(recipes.id, input.id))
      await ctx.db
        .delete(recipeToIngredients)
        .where(eq(recipeToIngredients.recipeId, input.id))
    }),

  // createWithIngredient: protectedProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     await ctx.db.insert(recipes).values({
  //       name: input.name,
  //     })

  //     await ctx.db.insert(ingredients).values([
  //       {
  //         name: input.name,
  //       },
  //       {
  //         name: input.name + "2",
  //       },
  //     ])

  //     const insertedRecipe = await ctx.db.query.recipes.findFirst({
  //       where: eq(recipes.name, input.name),
  //     })

  //     const insertedIngredients = await ctx.db.query.ingredients.findMany({
  //       where: or(
  //         eq(ingredients.name, input.name),
  //         eq(ingredients.name, input.name + "2"),
  //       ),
  //     })

  //     if (!insertedRecipe || !insertedIngredients) {
  //       throw new Error("not found")
  //     }

  //     console.log(insertedRecipe, insertedIngredients)

  //     await ctx.db.insert(recipeToIngredients).values(
  //       insertedIngredients.map((ingredient) => ({
  //         recipeId: insertedRecipe.id,
  //         ingredientId: ingredient.id,
  //       })),
  //     )
  //   }),
})
