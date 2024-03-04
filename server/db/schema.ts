import { relations, sql } from "drizzle-orm"
import {
  bigint,
  index,
  int,
  mysqlTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core"
import { type AdapterAccount } from "next-auth/adapters"

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator(
  (name) => `calorie-counting_${name}`,
)

export const posts = mysqlTable(
  "post",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("createdById", { length: 255 }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (example) => ({
    createdByIdIdx: index("createdById_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  }),
)

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
})

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}))

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.userId, account.provider, account.providerAccountId],
    }),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
)

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessions = mysqlTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
)

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({
      columns: [vt.identifier, vt.token],
    }),
  }),
)

export const ingredients = mysqlTable(
  "ingredient",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).unique().notNull(),
    calories: int("calories").notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (t) => ({
    nameIndex: index("name_idx").on(t.name),
  }),
)

export type Ingredient = typeof ingredients.$inferSelect

export const recipes = mysqlTable(
  "recipe",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).unique().notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (t) => ({
    nameIndex: index("name_idx").on(t.name),
  }),
)

export type RecipeWithIngredient = typeof recipes.$inferSelect & {
  recipeToIngredients: (typeof recipeToIngredients.$inferSelect & {
    ingredient: typeof ingredients.$inferSelect
  })[]
}

export type Recipe = typeof recipes.$inferSelect

export const recipeToIngredients = mysqlTable(
  "recipeToIngredient",
  {
    recipeId: int("recipeId").notNull(),
    ingredientId: int("ingredientId").notNull(),
  },
  (t) => ({
    pk: primaryKey({
      columns: [t.recipeId, t.ingredientId],
    }),
  }),
)

export const ingredientRelations = relations(ingredients, ({ many }) => ({
  recipeToIngredients: many(recipeToIngredients),
}))

export const recipeRelations = relations(recipes, ({ many }) => ({
  recipeToIngredients: many(recipeToIngredients),
}))

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

export const usedIngredients = mysqlTable(
  "usedIngredient",
  {
    id: serial("id").primaryKey(),
    foodId: int("foodId").notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    calories: int("calories").notNull(),
    quantity: int("quantity"),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (t) => ({
    nameIndex: index("name_idx").on(t.name),
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

export const foods = mysqlTable(
  "food",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    recipeId: int("recipeId").notNull(),
    cookingId: int("cookingId").notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (t) => ({
    nameIndex: index("name_idx").on(t.name),
  }),
)

export type Food = typeof foods.$inferSelect

export type FoodWithUsedIngredients = typeof foods.$inferSelect & {
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

export const cookings = mysqlTable(
  "cooking",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (t) => ({
    nameIndex: index("name_idx").on(t.name),
  }),
)

export type Cooking = typeof cookings.$inferSelect

export type CookingWithFoodsWithUsedIngredients =
  typeof cookings.$inferSelect & {
    foods: FoodWithUsedIngredients[]
  }

export const cookingRelations = relations(cookings, ({ many }) => ({
  foods: many(foods),
}))
