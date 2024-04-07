import { useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Button } from "~/components/ui/button"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { type CookingFormValues } from "./edit-cooking"

export default function UsedIngredientForm({
  foodIndex,
  ingredientIndex,
  removeIngredient,
}: {
  foodIndex: number
  ingredientIndex: number
  removeIngredient: () => void
}) {
  const form = useFormContext<CookingFormValues>()
  const ingredient = useWatch({
    control: form.control,
    name: `foods.${foodIndex}.usedIngredients.${ingredientIndex}`,
  })
  const totalCalories = Math.round(
    ingredient.calories * (ingredient.quantity / 100),
  )

  useEffect(() => {
    const ingredients = form.watch(`foods.${foodIndex}.usedIngredients`)

    form.setValue(
      `foods.${foodIndex}.quantity`,
      ingredients.reduce(
        (acc, ingredient) => acc + Number(ingredient.quantity),
        0 as number,
      ),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingredient.quantity])

  return (
    <div className="flex items-end gap-4">
      <FormField
        control={form.control}
        name={`foods.${foodIndex}.usedIngredients.${ingredientIndex}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ingredient name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`foods.${foodIndex}.usedIngredients.${ingredientIndex}.calories`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Calories/100</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`foods.${foodIndex}.usedIngredients.${ingredientIndex}.quantity`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quantity</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button variant="destructive" onClick={removeIngredient}>
        Delete
      </Button>

      <div>{totalCalories} Calories</div>
    </div>
  )
}
