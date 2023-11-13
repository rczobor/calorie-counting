import { eq, or } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { ingredients, recipes, recipeToIngredients } from "~/server/db/schema";

export const recipeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await ctx.db.insert(recipes).values({
        name: input.name,
      });
    }),

  createWithIngredient: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await ctx.db.insert(recipes).values({
        name: input.name,
      });

      await ctx.db.insert(ingredients).values([
        {
          name: input.name,
        },
        {
          name: input.name + "2",
        },
      ]);

      const insertedRecipe = await ctx.db.query.recipes.findFirst({
        where: eq(recipes.name, input.name),
      });

      const insertedIngredients = await ctx.db.query.ingredients.findMany({
        where: or(
          eq(ingredients.name, input.name),
          eq(ingredients.name, input.name + "2"),
        ),
      });

      if (!insertedRecipe || !insertedIngredients) {
        throw new Error("not found");
      }

      console.log(insertedRecipe, insertedIngredients);

      await ctx.db.insert(recipeToIngredients).values(
        insertedIngredients.map((ingredient) => ({
          recipeId: insertedRecipe.id,
          ingredientId: ingredient.id,
        })),
      );
    }),

  getRecipeWithIngredients: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const recipeId = input.id;

      return await ctx.db.query.recipes.findFirst({
        where: eq(recipes.id, recipeId),
        with: {
          recipeToIngredients: {
            with: {
              ingredient: true,
            },
          },
        },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    // simulate a slow db call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await ctx.db.query.recipes.findMany();
  }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.posts.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
