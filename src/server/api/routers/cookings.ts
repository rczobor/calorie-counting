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
            id: z.number(),
            name: z.string().min(2),
            recipeId: z.number(),
            usedIngredients: z.array(
              z.object({
                id: z.number(),
                name: z.string().min(2),
                calories: z.number().int().nonnegative(),
                quantity: z.number().int().nonnegative(),
              }),
            ),
          }),
        ),
      }),
    )
    .mutation(({ ctx, input }) => {
      const promises = []

      promises.push(
        ctx.db
          .update(cookings)
          .set({ name: input.name })
          .where(eq(cookings.id, input.id)),
      )

      promises.push(
        ctx.db.delete(foods).where(
          and(
            eq(foods.cookingId, input.id),
            notInArray(
              foods.id,
              input.foods.map((i) => i.id),
            ),
          ),
        ),
      )

      input.foods.forEach((food) => {
        promises.push(
          ctx.db.delete(usedIngredients).where(
            and(
              eq(usedIngredients.foodId, food.id),
              notInArray(
                usedIngredients.id,
                food.usedIngredients.map((i) => i.id),
              ),
            ),
          ),
        )

        if (food.id) {
          promises.push(
            ctx.db
              .update(foods)
              .set({
                name: food.name,
                updatedAt: new Date(),
              })
              .where(eq(foods.id, food.id)),
          )
        } else {
          promises.push(
            ctx.db.insert(foods).values({
              cookingId: input.id,
              recipeId: food.recipeId,
              name: food.name,
              updatedAt: new Date(),
            }),
          )
        }

        food.usedIngredients.forEach((ingredient) => {
          if (ingredient.id) {
            promises.push(
              ctx.db
                .update(usedIngredients)
                .set({
                  name: ingredient.name,
                  calories: ingredient.calories,
                  quantity: ingredient.quantity,
                  updatedAt: new Date(),
                })
                .where(eq(usedIngredients.id, ingredient.id)),
            )
          } else {
            promises.push(
              ctx.db.insert(usedIngredients).values({
                foodId: food.id,
                name: ingredient.name,
                calories: ingredient.calories,
                quantity: ingredient.quantity,
                updatedAt: new Date(),
              }),
            )
          }
        })
      })

      return Promise.all(promises)
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
    .query(({ ctx, input }) => {
      return ctx.db.query.cookings.findFirst({
        where: eq(cookings.id, input.id),
        with: {
          foods: {
            with: {
              usedIngredients: {
                orderBy: (usedIngredients, { desc }) => [
                  desc(usedIngredients.createdAt),
                ],
              },
            },
            orderBy: (foods, { desc }) => [desc(foods.createdAt)],
          },
        },
      })
    }),
})
