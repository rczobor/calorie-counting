import { createTRPCRouter } from "@/server/api/trpc"
import { cookingRouter } from "./routers/cookings"
import { ingredientRouter } from "./routers/ingredient"
import { recipeRouter } from "./routers/recipes"
import { foodRouter } from "./routers/foods"
import { usedIngredientRouter } from "./routers/used-ingredient"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  cooking: cookingRouter,
  food: foodRouter,
  ingredient: ingredientRouter,
  recipe: recipeRouter,
  usedIngredient: usedIngredientRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
