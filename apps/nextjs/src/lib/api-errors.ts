import { AppError } from "@mono/errors";

// Maps an application error to its HTTP status; anything else is rethrown.
export function appErrorResponse(error: unknown): Response {
  if (error instanceof AppError && error.statusCode < 500) {
    return Response.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }
  throw error;
}
