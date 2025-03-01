import { json } from "stream/consumers";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 20000,
    include: ["__tests__/run/*.test.ts"],
    exclude: ["__tests__/ignore/**"],
    watch: false,
    reporters: ["verbose"],
    // outputFile: "test-results.json",
    // silent: true,
    chaiConfig: {
      truncateThreshold: 0,
    },
  },
});
