import { api } from "@/trpc/server"
import Recipe from "./Recipe"

export default function RecipePage({ params }: { params: { id: string } }) {
  if (params.id === "new") {
    return (
      <section>
        <h1 className="text-center text-xl font-bold">Add new recipe</h1>
        <Recipe />
      </section>
    )
  }

  const recipe = api.recipe.getById.query({ id: +params.id })

  console.log(recipe)

  return <div>{params.id}</div>
}
