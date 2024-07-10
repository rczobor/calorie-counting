import { and, eq, like, notInArray } from "drizzle-orm"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import {
  cookings,
  foods,
  recipeToIngredients,
  usedIngredients,
} from "~/server/db/schema"

export const cookingRouter = createTRPCRouter({
  insert: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        recipes: z.array(z.object({ id: z.number(), name: z.string() })),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [cooking] = await ctx.db
        .insert(cookings)
        .values({
          name: input.name,
          updatedAt: new Date(),
        })
        .returning()

      if (!cooking) {
        throw new Error("Created Cooking found")
      }

      for (const recipe of input.recipes) {
        const [food] = await ctx.db
          .insert(foods)
          .values({
            cookingId: cooking.id,
            recipeId: recipe.id,
            name: recipe.name,
            updatedAt: new Date(),
          })
          .returning()

        if (!food) {
          throw new Error("Created Food not found")
        }

        const recipeToIngredientsList =
          await ctx.db.query.recipeToIngredients.findMany({
            where: eq(recipeToIngredients.recipeId, recipe.id),
            with: { ingredient: true },
          })

        const ingredients = recipeToIngredientsList.map((r) => r.ingredient)

        for (const ingredient of ingredients) {
          await ctx.db.insert(usedIngredients).values({
            foodId: food.id,
            name: ingredient.name,
            calories: ingredient.calories,
            updatedAt: new Date(),
          })
        }
      }

      return cooking
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(2),
        foods: z.array(
          z.object({
            id: z.number().nullable(),
            name: z.string().min(2),
            quantity: z.number().int().nonnegative(),
            recipeId: z.number(),
            usedIngredients: z.array(
              z.object({
                id: z.number().nullable(),
                foodId: z.number().nullable(),
                name: z.string().min(2),
                calories: z.number().int().nonnegative(),
                quantity: z.number().int().nonnegative(),
              }),
            ),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(cookings)
        .set({ name: input.name, updatedAt: new Date() })
        .where(eq(cookings.id, input.id))

      await ctx.db.delete(foods).where(
        and(
          eq(foods.cookingId, input.id),
          notInArray(
            foods.id,
            input.foods.reduce((ids, food) => {
              if (food.id) {
                ids.push(food.id)
              }

              return ids
            }, [] as number[]),
          ),
        ),
      )

      for (const food of input.foods) {
        if (food.id) {
          await ctx.db.delete(usedIngredients).where(
            and(
              eq(usedIngredients.foodId, food.id),
              notInArray(
                usedIngredients.id,
                food.usedIngredients.reduce((ids, food) => {
                  if (food.id) {
                    ids.push(food.id)
                  }

                  return ids
                }, [] as number[]),
              ),
            ),
          )
          await ctx.db
            .update(foods)
            .set({
              name: food.name,
              quantity: food.quantity,
              updatedAt: new Date(),
            })
            .where(eq(foods.id, food.id))
          for (const ingredient of food.usedIngredients) {
            if (ingredient.id) {
              await ctx.db
                .update(usedIngredients)
                .set({
                  name: ingredient.name,
                  calories: ingredient.calories,
                  quantity: ingredient.quantity,
                  updatedAt: new Date(),
                })
                .where(eq(usedIngredients.id, ingredient.id))
            } else {
              await ctx.db.insert(usedIngredients).values({
                foodId: food.id,
                name: ingredient.name,
                calories: ingredient.calories,
                quantity: ingredient.quantity,
                updatedAt: new Date(),
              })
            }
          }
        } else {
          const [newFood] = await ctx.db
            .insert(foods)
            .values({
              cookingId: input.id,
              recipeId: food.recipeId,
              name: food.name,
              quantity: food.quantity,
              updatedAt: new Date(),
            })
            .returning()

          if (!newFood) {
            throw new Error("New Food not found")
          }

          for (const ingredient of food.usedIngredients) {
            await ctx.db.insert(usedIngredients).values({
              foodId: newFood.id,
              name: ingredient.name,
              calories: ingredient.calories,
              quantity: ingredient.quantity,
              updatedAt: new Date(),
            })
          }
        }
      }
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
    .mutation(async ({ ctx, input }) =>
      ctx.db.delete(cookings).where(eq(cookings.id, input.id)),
    ),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) =>
      ctx.db.query.cookings.findFirst({
        where: eq(cookings.id, input.id),
        with: {
          foods: {
            with: {
              usedIngredients: {
                orderBy: (usedIngredients, { asc }) => [
                  asc(usedIngredients.createdAt),
                ],
              },
            },
            orderBy: (foods, { asc }) => [asc(foods.createdAt)],
          },
        },
      }),
    ),
})
