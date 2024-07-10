import { relations, sql } from "drizzle-orm"
import {
  index,
  integer,
  primaryKey,
  serial,
  text,
  timestamp,
  pgTableCreator,
  varchar,
} from "drizzle-orm/pg-core"
import { type AdapterAccount } from "next-auth/adapters"

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `calorie-counting_${name}`)

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
})

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}))

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
)

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
)

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
)

export const ingredients = createTable(
  "ingredient",
  {
    id: serial("id").primaryKey(),
    name: text("name").unique().notNull(),
    calories: integer("calories").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
  },
  (ingredient) => ({
    nameIndex: index("ingredient_name_idx").on(ingredient.name),
  }),
)

export type Ingredient = typeof ingredients.$inferSelect

export const ingredientRelations = relations(ingredients, ({ many }) => ({
  recipeToIngredients: many(recipeToIngredients),
}))

export const recipes = createTable(
  "recipe",
  {
    id: serial("id").primaryKey(),
    name: text("name").unique().notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
  },
  (recipe) => ({
    nameIndex: index("recipe_name_idx").on(recipe.name),
  }),
)

export type Recipe = typeof recipes.$inferSelect

export const recipeRelations = relations(recipes, ({ many }) => ({
  recipeToIngredients: many(recipeToIngredients),
}))

export const recipeToIngredients = createTable(
  "recipeToIngredient",
  {
    recipeId: integer("recipeId")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    ingredientId: integer("ingredientId")
      .notNull()
      .references(() => ingredients.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({
      columns: [t.recipeId, t.ingredientId],
    }),
  }),
)

export type RecipeWithIngredient = Recipe & {
  recipeToIngredients: (typeof recipeToIngredients.$inferSelect & {
    ingredient: Ingredient
  })[]
}

export const recipeToIngredientsRelations = relations(
  recipeToIngredients,
  ({ one }) => ({
    ingredient: one(ingredients, {
      fields: [recipeToIngredients.ingredientId],
      references: [ingredients.id],
    }),
    recipe: one(recipes, {
      fields: [recipeToIngredients.recipeId],
      references: [recipes.id],
    }),
  }),
)

export const usedIngredients = createTable(
  "usedIngredient",
  {
    id: serial("id").primaryKey(),
    foodId: integer("foodId")
      .notNull()
      .references(() => foods.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    calories: integer("calories").default(0).notNull(),
    quantity: integer("quantity").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
  },
  (usedIngredient) => ({
    nameIndex: index("usedIngredient_name_idx").on(usedIngredient.name),
  }),
)

export const usedIngredientRelations = relations(
  usedIngredients,
  ({ one }) => ({
    food: one(foods, {
      fields: [usedIngredients.foodId],
      references: [foods.id],
    }),
  }),
)

export type UsedIngredient = typeof usedIngredients.$inferSelect

export const foods = createTable(
  "food",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    quantity: integer("quantity").default(0).notNull(),
    recipeId: integer("recipeId")
      .notNull()
      .references(() => recipes.id),
    cookingId: integer("cookingId")
      .notNull()
      .references(() => cookings.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
  },
  (food) => ({
    nameIndex: index("food_name_idx").on(food.name),
  }),
)

export type Food = typeof foods.$inferSelect

export type FoodWithUsedIngredients = Food & {
  usedIngredients: UsedIngredient[]
}

export const foodRelations = relations(foods, ({ one, many }) => ({
  recipe: one(recipes, {
    fields: [foods.recipeId],
    references: [recipes.id],
  }),
  usedIngredients: many(usedIngredients),
  cooking: one(cookings, {
    fields: [foods.cookingId],
    references: [cookings.id],
  }),
}))

export const cookings = createTable(
  "cooking",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
  },
  (cooking) => ({
    nameIndex: index("cooking_name_idx").on(cooking.name),
  }),
)

export type Cooking = typeof cookings.$inferSelect

export type CookingWithFoodsWithUsedIngredients = Cooking & {
  foods: FoodWithUsedIngredients[]
}

export const cookingRelations = relations(cookings, ({ many }) => ({
  foods: many(foods),
}))
