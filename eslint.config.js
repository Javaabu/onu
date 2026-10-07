import js from "@eslint/js"
import jsxA11y from "eslint-plugin-jsx-a11y"
import reactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"

/**
 * Physical left/right Tailwind utilities break RTL (R11.2). Use logical ones:
 * ms-/me-, ps-/pe-, start-/end-, text-start/end, rounded-s/e, border-s/e.
 */
const PHYSICAL =
  /(^|\s|:)(-?m[lr]-|p[lr]-|-?left-|-?right-|text-(left|right)\b|rounded-[tb]?[lr](-|\b)|border-[lr](-|\b)|float-(left|right)|scroll-[mp][lr]-)/
const physicalMessage =
  "Use logical Tailwind utilities (ms-/me-, ps-/pe-, start-/end-, text-start/end, rounded-s/e, border-s/e) so RTL works (R11.2)."

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/coverage/**",
      "**/node_modules/**",
      "**/*.config.*",
      "docs/**",
      "**/playwright-report/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
      "no-restricted-syntax": [
        "error",
        { selector: `Literal[value=${PHYSICAL}]`, message: physicalMessage },
        { selector: `TemplateElement[value.raw=${PHYSICAL}]`, message: physicalMessage },
      ],
    },
  },
  {
    // Vendored shadcn/ui code: keep upstream as-is; RTL handled by the sync transform.
    files: ["packages/onu/src/ui/**"],
    rules: {
      "no-restricted-syntax": "off",
      "jsx-a11y/anchor-has-content": "off",
      "jsx-a11y/heading-has-content": "off",
      "jsx-a11y/no-noninteractive-tabindex": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/test/**"],
    rules: { "@typescript-eslint/no-non-null-assertion": "off" },
  },
)
