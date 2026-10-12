import { pgTable, varchar , serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const AgentConfig = pgTable('agentConfig' , {
  id : serial('id').primaryKey(),
  agentId : varchar('agentId').notNull().unique(),
  name : varchar('name').notNull(),
  description : text('description'),
  agentImage : text('agentImage'),
  createdAt : timestamp("created_at").defaultNow().notNull(),
  userEmail:text('userEmail').notNull().references(() => users.email)
})

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

