import { z } from "zod";

export const getMyUserInfoInputSchema = z.object({});

export type GetMyUserInfoInput = z.infer<typeof getMyUserInfoInputSchema>;
