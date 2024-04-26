/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import GithubActionsReporter from "vitest-github-actions-reporter";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.js",
    outputFile: {
      junit: "frontend-test-results.xml",
    },
    reporters: process.env.GITHUB_ACTIONS
      ? [
          "junit",
          new GithubActionsReporter({
            hideStackTrace: true,
            trimRepositoryPrefix: true,
          }),
        ]
      : "default",
  },
});
