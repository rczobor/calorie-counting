import { api } from "~/trpc/server"
import Recipe from "./recipe"

export default async function RecipePage(
  props: {
    params: Promise<{ id: string }>
  }
) {
  const params = await props.params;
  if (params.id === "new") {
    return (
      <section>
        <h1 className="text-center text-xl font-bold">Recipe</h1>
        <Recipe />
      </section>
    )
  }

  const recipe = await api.recipe.getById({ id: +params.id })

  if (!recipe) return <div>Recipe not found</div>

  return (
    <section>
      <h1 className="text-center text-xl font-bold">Recipe</h1>
      <Recipe recipe={recipe} />
    </section>
  )
}
