import { vi } from "vitest";

// Global guard: prevent any test in this package from hitting the real
// Inngest client. NODE_ENV=test under vitest makes the real client's
// `isDev` false, so a leaked `inngest.send(...)` would deliver to
// production. Tests that need to assert on emitted events should re-mock
// `@microlearn/jobs` locally with their own `sendMock` and call
// `vi.mocked(inngest.send)` to inspect calls.
vi.mock("@microlearn/jobs", () => ({
  inngest: {
    send: vi.fn(() => {
      throw new Error(
        "inngest.send was called in a test without a local mock. " +
          "Mock @microlearn/jobs in this test file to capture the call.",
      );
    }),
  },
}));
