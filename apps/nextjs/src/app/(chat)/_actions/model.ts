"use server";

import { cookies } from "next/headers";

import { MODEL_COOKIE_NAME } from "../_lib/constants";

export async function saveModelPreference(modelId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(MODEL_COOKIE_NAME, modelId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

