ALTER TABLE "calorie-counting_ingredient" ALTER COLUMN "calories" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "calorie-counting_usedIngredient" ALTER COLUMN "calories" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "calorie-counting_usedIngredient" ALTER COLUMN "quantity" SET NOT NULL;