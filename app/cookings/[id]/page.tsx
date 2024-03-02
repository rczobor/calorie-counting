import { api } from "@/trpc/server"
import CreateCooking from "./create-cooking"
import EditCooking from "./edit-cooking"

export default async function CookingPage({
  params,
}: {
  params: { id: string }
}) {
  if (params.id === "new") {
    return (
      <section>
        <h1 className="text-center text-xl font-bold">Cooking</h1>
        <CreateCooking />
      </section>
    )
  }

  const cooking = await api.cooking.getById.query({ id: +params.id })

  if (!cooking) return <div>Recipe not found</div>

  return (
    <section>
      <h1 className="text-center text-xl font-bold">Cooking</h1>
      <EditCooking cooking={cooking} />
    </section>
  )
}
