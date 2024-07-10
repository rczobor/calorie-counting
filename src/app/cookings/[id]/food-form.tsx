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
import IngredientDialog from "~/app/ingredients/ingredient-dialog"
import { type Ingredient } from "~/server/db/schema"

export default function FoodForm({
  foodIndex,
  removeFood,
}: {
  foodIndex: number
  removeFood: () => void
}) {
  const form = useFormContext<CookingFormValues>()
  const { fields, remove, append } = useFieldArray({
    control: form.control,
    name: `foods.${foodIndex}.usedIngredients`,
  })
  const foodId = useWatch({
    control: form.control,
    name: `foods.${foodIndex}.id`,
  })
  const ingredients = useWatch({
    control: form.control,
    name: `foods.${foodIndex}.usedIngredients`,
  })
  const name = useWatch({
    control: form.control,
    name: `foods.${foodIndex}.name`,
  })
  const quantity = useWatch({
    control: form.control,
    name: `foods.${foodIndex}.quantity`,
  })
  const totalCalories = ingredients.reduce(
    (acc, ingredient) =>
      acc + Math.round(ingredient.calories * (ingredient.quantity / 100)),
    0,
  )
  const calories = Math.round(totalCalories / (quantity / 100))

  const handleEmptyQuantity = () => {
    form.setValue(
      `foods.${foodIndex}.quantity`,
      ingredients.reduce(
        (acc, ingredient) => acc + Number(ingredient.quantity),
        0 as number,
      ),
    )
  }

  const handleAddIngredient = (ingredient: Ingredient) => {
    append({
      id: null,
      name: ingredient.name,
      calories: ingredient.calories,
      foodId: foodId,
      quantity: 0,
    })
  }

  return (
    <>
      <Separator />

      <div className="flex items-end gap-4">
        <FormField
          control={form.control}
          name={`foods.${foodIndex}.quantity`}
          render={({ field }) => (
            <FormItem className="max-w-24">
              <FormLabel>Final Quantity</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onBlur={(event) => {
                    if (event.target.value === "") {
                      handleEmptyQuantity()
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <IngredientDialog onAdd={handleAddIngredient} />

        <Button variant="destructive" onClick={removeFood}>
          Delete
        </Button>

        <h3>{name}</h3>

        <div>|</div>

        {!!quantity && (
          <div>
            Total Calories/100 ={" "}
            <span className="font-extrabold underline">{calories}</span>
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
