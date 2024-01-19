import { api } from "@/trpc/server"
import Cooking from "./cooking"

export default async function CookingPage({
  params,
}: {
  params: { id: string }
}) {
  if (params.id === "new") {
    return (
      <section>
        <h1 className="text-center text-xl font-bold">Cooking</h1>
        <Cooking />
      </section>
    )
  }

  const recipe = await api.recipe.getById.query({ id: +params.id })

  if (!recipe) return <div>Recipe not found</div>

  return (
    <section>
      <h1 className="text-center text-xl font-bold">Cooking</h1>
      {/* <Recipe recipe={recipe} /> */}
    </section>
  )
}
