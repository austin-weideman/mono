import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

import type { ModelId } from "@mono/ai";
import { isValidModelId } from "@mono/ai";

import { DEFAULT_MODEL_ID, MODEL_COOKIE_NAME } from "./constants";

export function getSelectedModelId(
  cookieStore: ReadonlyRequestCookies,
): ModelId {
  const modelCookie = cookieStore.get(MODEL_COOKIE_NAME)?.value ?? "";
  return isValidModelId(modelCookie) ? modelCookie : DEFAULT_MODEL_ID;
}
