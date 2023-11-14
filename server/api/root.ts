import { createTRPCRouter } from "@/server/api/trpc"
import { ingredientRouter } from "./routers/ingredient"
import { recipeRouter } from "./routers/recipes"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  recipe: recipeRouter,
  ingredient: ingredientRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
