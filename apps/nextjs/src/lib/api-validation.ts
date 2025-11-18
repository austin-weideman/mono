import { z } from "zod";

export async function validateJson<T>(
  req: Request,
  schema: z.ZodType<T>,
): Promise<{ success: true; data: T } | { success: false; error: Response }> {
  const json: unknown = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    const error = new Response(
      JSON.stringify({
        error: "Invalid request body",
        issues: z.treeifyError(parsed.error),
      }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
    return { success: false, error };
  }

  return { success: true, data: parsed.data };
}

