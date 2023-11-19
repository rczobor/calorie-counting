import { api } from "@/trpc/server"
import Recipe from "./recipe"

export default async function RecipePage({
  params,
}: {
  params: { id: string }
}) {
  if (params.id === "new") {
    return (
      <section>
        <h1 className="text-center text-xl font-bold">Add new recipe</h1>
        <Recipe />
      </section>
    )
  }

  const recipe = await api.recipe.getById.query({ id: +params.id })

  if (!recipe) return <div>Recipe not found</div>

  return (
    <section>
      <h1 className="text-center text-xl font-bold">Add new recipe</h1>
      <Recipe recipe={recipe} />
    </section>
  )
}
