import { like } from "drizzle-orm"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import { ingredients } from "~/server/db/schema"

export const ingredientRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(ingredients).values({
        name: input.name,
      })
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.ingredients.findMany()
  }),

  search: protectedProcedure
    .input(z.object({ name: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.ingredients.findMany({
        where: like(ingredients.name, `%${input.name}%`),
        orderBy: (ingredients, { desc }) => [desc(ingredients.updatedAt)],
      })
    }),

  getLatest: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.ingredients.findFirst({
      orderBy: (ingredients, { desc }) => [desc(ingredients.updatedAt)],
    })
  }),
})
