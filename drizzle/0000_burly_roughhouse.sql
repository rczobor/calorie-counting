CREATE TABLE IF NOT EXISTS "calorie-counting_account" (
	"user_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "calorie-counting_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
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
	"quantity" integer DEFAULT 0 NOT NULL,
	"recipeId" integer NOT NULL,
	"cookingId" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calorie-counting_ingredient" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"calories" integer DEFAULT 0 NOT NULL,
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
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calorie-counting_usedIngredient" (
	"id" serial PRIMARY KEY NOT NULL,
	"foodId" integer NOT NULL,
	"name" text NOT NULL,
	"calories" integer DEFAULT 0 NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calorie-counting_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calorie-counting_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "calorie-counting_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calorie-counting_account" ADD CONSTRAINT "calorie-counting_account_user_id_calorie-counting_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."calorie-counting_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calorie-counting_food" ADD CONSTRAINT "calorie-counting_food_recipeId_calorie-counting_recipe_id_fk" FOREIGN KEY ("recipeId") REFERENCES "public"."calorie-counting_recipe"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calorie-counting_food" ADD CONSTRAINT "calorie-counting_food_cookingId_calorie-counting_cooking_id_fk" FOREIGN KEY ("cookingId") REFERENCES "public"."calorie-counting_cooking"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calorie-counting_recipeToIngredient" ADD CONSTRAINT "calorie-counting_recipeToIngredient_recipeId_calorie-counting_recipe_id_fk" FOREIGN KEY ("recipeId") REFERENCES "public"."calorie-counting_recipe"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calorie-counting_recipeToIngredient" ADD CONSTRAINT "calorie-counting_recipeToIngredient_ingredientId_calorie-counting_ingredient_id_fk" FOREIGN KEY ("ingredientId") REFERENCES "public"."calorie-counting_ingredient"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calorie-counting_session" ADD CONSTRAINT "calorie-counting_session_user_id_calorie-counting_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."calorie-counting_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calorie-counting_usedIngredient" ADD CONSTRAINT "calorie-counting_usedIngredient_foodId_calorie-counting_food_id_fk" FOREIGN KEY ("foodId") REFERENCES "public"."calorie-counting_food"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "calorie-counting_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cooking_name_idx" ON "calorie-counting_cooking" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "food_name_idx" ON "calorie-counting_food" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ingredient_name_idx" ON "calorie-counting_ingredient" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_name_idx" ON "calorie-counting_recipe" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "recipe_name_search_idx" ON "calorie-counting_recipe" USING gin (to_tsvector('english', "name"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "calorie-counting_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "usedIngredient_name_idx" ON "calorie-counting_usedIngredient" USING btree ("name");