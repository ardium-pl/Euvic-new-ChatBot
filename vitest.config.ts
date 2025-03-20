import { json } from "stream/consumers";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 60000,
    hookTimeout: 60000,

    include: ["__tests__/testStrings/*.test.ts"],
    watch: false,
    reporters: ["verbose", "json"],
    outputFile: "test-results.json",
    silent: true,
    chaiConfig: {
      truncateThreshold: 0,
    },
  },
});
