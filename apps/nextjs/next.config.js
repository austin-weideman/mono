import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
await jiti.import("./src/env");

/** @type {import("next").NextConfig} */
const config = {
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@microlearn/api",
    "@microlearn/auth",
    "@microlearn/db",
    "@microlearn/ui",
    "@microlearn/validators",
  ],

  /** Allow dev resources to be served to the ngrok tunnel used for local OAuth/Expo testing */
  allowedDevOrigins: ["multifaced-dazedly-brain.ngrok-free.dev"],

  /** We already do linting and typechecking as separate tasks in CI */
  typescript: { ignoreBuildErrors: true },
};

export default config;
