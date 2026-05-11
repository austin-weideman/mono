/**
 * Runs once per server runtime cold-start, before any request is handled.
 *
 * We import `@microlearn/env` here to force its top-level Zod parse to run
 * eagerly at boot. If any required env var is missing in the live environment
 * (e.g. Vercel/Doppler drift), the import throws synchronously, `register()`
 * rejects, the runtime fails to boot, and Vercel marks the deployment as
 * failed — keeping the previous deployment serving instead of promoting a
 * broken 500-on-every-request bundle.
 */
export async function register() {
  await import("@microlearn/env");
}
