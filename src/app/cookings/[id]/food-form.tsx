import { useFormContext, useFieldArray, useWatch } from "react-hook-form"
import { Button } from "~/components/ui/button"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormArrayMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { type CookingFormValues } from "./edit-cooking"
import { Separator } from "~/components/ui/separator"
import UsedIngredientForm from "./used-ingredient-form"

export default function FoodForm({
  foodIndex,
  removeFood,
}: {
  foodIndex: number
  removeFood: () => void
}) {
  const form = useFormContext<CookingFormValues>()
  const { fields, remove } = useFieldArray({
    control: form.control,
    name: `foods.${foodIndex}.usedIngredients`,
  })
  const ingredients = useWatch({
    control: form.control,
    name: `foods.${foodIndex}.usedIngredients`,
  })
  const quantity = useWatch({
    control: form.control,
    name: `foods.${foodIndex}.quantity`,
  })
  const totalCalories = ingredients.reduce(
    (acc, ingredient) =>
      acc + Math.round(ingredient.calories * (ingredient.quantity / 100)),
    0 as number,
  )
  const calories = Math.round(totalCalories / (quantity / 100))

  return (
    <>
      <Separator />

      <div className="flex items-end gap-4">
        <FormField
          control={form.control}
          name={`foods.${foodIndex}.quantity`}
          render={({ field }) => (
            <FormItem className="max-w-24">
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`foods.${foodIndex}.name`}
          render={({ field }) => (
            <FormItem>
              <div>{field.value}</div>
            </FormItem>
          )}
        />

        <Button variant="destructive" onClick={removeFood}>
          Delete
        </Button>

        {!!quantity && (
          <div>
            {totalCalories} / {quantity} = {calories}
          </div>
        )}
      </div>

      {fields.map((field, index) => (
        <UsedIngredientForm
          key={field.id}
          foodIndex={foodIndex}
          ingredientIndex={index}
          removeIngredient={() => remove(index)}
        />
      ))}

      <FormField
        control={form.control}
        name={`foods.${foodIndex}.usedIngredients`}
        render={() => (
          <FormItem>
            <FormArrayMessage />
          </FormItem>
        )}
      />
    </>
  )
}
