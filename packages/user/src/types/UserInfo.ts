import { z } from "zod";

export const userInfoSchema = z.object({
  name: z.string(),
  email: z.email(),
  timezone: z.string().nullable(),
});

export type UserInfo = z.infer<typeof userInfoSchema>;
