CREATE TABLE IF NOT EXISTS "calorie-counting_account" (
	"userId" integer NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "calorie-counting_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calorie-counting_cooking" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calorie-counting_food" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"recipeId" integer NOT NULL,
	"cookingId" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calorie-counting_ingredient" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"calories" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "calorie-counting_ingredient_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calorie-counting_recipeToIngredient" (
	"recipeId" integer NOT NULL,
	"ingredientId" integer NOT NULL,
	CONSTRAINT "calorie-counting_recipeToIngredient_recipeId_ingredientId_pk" PRIMARY KEY("recipeId","ingredientId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calorie-counting_recipe" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "calorie-counting_recipe_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calorie-counting_session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calorie-counting_usedIngredient" (
	"id" serial PRIMARY KEY NOT NULL,
	"foodId" integer NOT NULL,
	"name" text NOT NULL,
	"calories" integer DEFAULT 0,
	"quantity" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calorie-counting_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp DEFAULT CURRENT_TIMESTAMP,
	"image" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calorie-counting_verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "calorie-counting_verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "calorie-counting_account" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cooking_name_idx" ON "calorie-counting_cooking" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "food_name_idx" ON "calorie-counting_food" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ingredient_name_idx" ON "calorie-counting_ingredient" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_name_idx" ON "calorie-counting_recipe" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "calorie-counting_session" ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "usedIngredient_name_idx" ON "calorie-counting_usedIngredient" ("name");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calorie-counting_account" ADD CONSTRAINT "calorie-counting_account_userId_calorie-counting_user_id_fk" FOREIGN KEY ("userId") REFERENCES "calorie-counting_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calorie-counting_food" ADD CONSTRAINT "calorie-counting_food_recipeId_calorie-counting_recipe_id_fk" FOREIGN KEY ("recipeId") REFERENCES "calorie-counting_recipe"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calorie-counting_food" ADD CONSTRAINT "calorie-counting_food_cookingId_calorie-counting_cooking_id_fk" FOREIGN KEY ("cookingId") REFERENCES "calorie-counting_cooking"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calorie-counting_recipeToIngredient" ADD CONSTRAINT "calorie-counting_recipeToIngredient_recipeId_calorie-counting_recipe_id_fk" FOREIGN KEY ("recipeId") REFERENCES "calorie-counting_recipe"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calorie-counting_recipeToIngredient" ADD CONSTRAINT "calorie-counting_recipeToIngredient_ingredientId_calorie-counting_ingredient_id_fk" FOREIGN KEY ("ingredientId") REFERENCES "calorie-counting_ingredient"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calorie-counting_session" ADD CONSTRAINT "calorie-counting_session_userId_calorie-counting_user_id_fk" FOREIGN KEY ("userId") REFERENCES "calorie-counting_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calorie-counting_usedIngredient" ADD CONSTRAINT "calorie-counting_usedIngredient_foodId_calorie-counting_food_id_fk" FOREIGN KEY ("foodId") REFERENCES "calorie-counting_food"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
