import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: "tests/global-setup.ts",
    // Integration tests share one database — run files sequentially.
    fileParallelism: false,
  },
});
