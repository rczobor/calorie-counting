import { api } from "~/trpc/server"
import CreateCooking from "./create-cooking"
import EditCooking from "./edit-cooking"

export default async function CookingPage(
  props: {
    params: Promise<{ id: string }>
  }
) {
  const params = await props.params;
  if (params.id === "new") {
    return (
      <section>
        <h1 className="text-center text-xl font-bold">Cooking</h1>
        <CreateCooking />
      </section>
    )
  }

  const cooking = await api.cooking.getById({ id: +params.id })

  if (!cooking) return <div>Recipe not found</div>

  return (
    <section>
      <h1 className="text-center text-xl font-bold">Cooking</h1>
      <EditCooking cooking={cooking} />
    </section>
  )
}
