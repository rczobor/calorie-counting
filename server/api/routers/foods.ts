import { and, eq, inArray, like, not, sql } from "drizzle-orm"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import {
  foods,
  ingredients,
  recipes,
  recipeToIngredients,
} from "@/server/db/schema"

export const foodRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        id: z.number().optional(),
        recipeId: z.number(),
        cookingId: z.number(),
        ingredientIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const query = await ctx.db
        .insert(foods)
        .values({
          id: input.id,
          recipeId: input.recipeId,
          cookingId: input.cookingId,
          name: input.name,
        })
        .onDuplicateKeyUpdate({
          set: {
            recipeId: input.recipeId,
            cookingId: input.cookingId,
            name: input.name,
          },
        })

      const id = input.id ?? +query.insertId

      const food = await ctx.db.query.foods.findFirst({
        where: eq(foods.id, id),
      })

      if (!food) {
        throw new Error("not found")
      }

      if (input.ingredientIds.length > 0) {
        await ctx.db
          .delete(recipeToIngredients)
          .where(
            and(
              eq(recipeToIngredients.recipeId, food.id),
              not(
                inArray(recipeToIngredients.ingredientId, input.ingredientIds),
              ),
            ),
          )
      } else {
        await ctx.db
          .delete(recipeToIngredients)
          .where(eq(recipeToIngredients.recipeId, food.id))
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

      return food
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

  getIngredients: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const relations = await ctx.db.query.recipeToIngredients.findMany({
        where: eq(recipeToIngredients.recipeId, input.id),
      })

      if (!relations.length) return []

      const ingredientIds = relations.map((relation) => relation.ingredientId)

      return ctx.db.query.ingredients.findMany({
        where: inArray(ingredients.id, ingredientIds),
      })
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
