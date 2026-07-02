import { defineConfig } from "eslint/config";

export default defineConfig({
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: ["eslint:recommended"],
  ignorePatterns: [".vite/**", "dist/**", "node_modules/**", "public/**"],
});
