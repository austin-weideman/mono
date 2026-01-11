import { pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { user } from "./auth-schema";

export const userProfile = pgTable("user_profile", (t) => ({
  userId: t
    .text()
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  timezone: t.text(),
  createdAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
}));

export const selectUserProfileSchema = createSelectSchema(userProfile);
export const insertUserProfileSchema = createInsertSchema(userProfile);
export type UserProfile = typeof userProfile.$inferSelect;
export type NewUserProfile = typeof userProfile.$inferInsert;
