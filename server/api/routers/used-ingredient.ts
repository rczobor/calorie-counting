import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { usedIngredients } from "@/server/db/schema"
import { eq } from "drizzle-orm"

export const usedIngredientRouter = createTRPCRouter({
  insert: protectedProcedure
    .input(
      z.object({
        foodId: z.number(),
        name: z.string(),
        calories: z.number(),
        quantity: z.number(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.insert(usedIngredients).values({
        foodId: input.foodId,
        name: input.name,
        calories: input.calories,
        quantity: input.quantity,
      }),
    ),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        calories: z.number(),
        quantity: z.number(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db
        .update(usedIngredients)
        .set({
          name: input.name,
          calories: input.calories,
          quantity: input.quantity,
        })
        .where(eq(usedIngredients.id, input.id)),
    ),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) =>
      ctx.db.delete(usedIngredients).where(eq(usedIngredients.id, input.id)),
    ),
})
