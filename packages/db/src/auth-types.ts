import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { user } from "./auth-schema";

export const selectUserSchema = createSelectSchema(user);
export const insertUserSchema = createInsertSchema(user);
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
