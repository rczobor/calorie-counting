import { eq, like } from "drizzle-orm"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { cookings } from "@/server/db/schema"

export const cookingRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        recipeId: z.number().optional(),
        ingredientIds: z.array(z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const query = await ctx.db.insert(cookings).values({
        id: input.recipeId,
        name: input.name,
      })

      return query.insertId
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
      await ctx.db.delete(cookings).where(eq(cookings.id, input.id))
    }),
})
