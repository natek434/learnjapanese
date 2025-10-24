import path from "node:path";
import { fileURLToPath } from "node:url";

import globals from "globals";
import eslintConfigNext from "eslint-config-next";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const typeScriptConfigs = tseslint.config(
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}", "*.ts", "*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        projectService: true,
        tsconfigRootDir: __dirname
      }
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
    }
  }
);

const vitestGlobals = {
  afterAll: "readonly",
  afterEach: "readonly",
  beforeAll: "readonly",
  beforeEach: "readonly",
  describe: "readonly",
  expect: "readonly",
  it: "readonly",
  test: "readonly",
  vi: "readonly",
  vitest: "readonly"
};

const vitestConfig = {
  files: ["tests/**/*.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.es2021,
      ...vitestGlobals
    }
  }
};

const ignores = {
  ignores: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "coverage/**",
    "*.config.js"
  ]
};

const reactHooksOverride = {
  rules: {
    "react-hooks/set-state-in-effect": "off"
  }
};

export default [
  ...eslintConfigNext,
  ...typeScriptConfigs,
  eslintConfigPrettier,
  reactHooksOverride,
  vitestConfig,
  ignores
];
