import js from "@eslint/js"
import jsxA11y from "eslint-plugin-jsx-a11y"
import reactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"

/**
 * Physical left/right Tailwind utilities break RTL (R11.2). Use logical ones:
 * ms-/me-, ps-/pe-, start-/end-, text-start/end, rounded-s/e, border-s/e, slide-in-from-start.
 * A class on Radix's data-[side=left|right] variant is not a hit: that side is physical by design.
 * translate-x- has no logical form, so it is a hit only when the string has no rtl: partner for it.
 */
const PHYSICAL =
  /(^|\s|(?<!data-\[side=\w+\]):)(-?m[lr]-|p[lr]-|-?left-|-?right-|text-(left|right)\b|rounded-[tb]?[lr](-|\b)|border-[lr](-|\b)|float-(left|right)|scroll-[mp][lr]-|origin-((top|bottom)-)?(left|right)\b|slide-(in-from|out-to)-(left|right)\b)|^(?![\s\S]*rtl:\S*translate-x-)(?:[\s\S]*\s|[\s\S]*:)?-?translate-x-(?!0\b)/
const physicalMessage =
  "Use logical Tailwind utilities (ms-/me-, ps-/pe-, start-/end-, text-start/end, rounded-s/e, border-s/e) so RTL works (R11.2)."

export default tseslint.config(
  {
    ignores: [
      ".claude/**",
      "**/dist/**",
      "**/coverage/**",
      "**/node_modules/**",
      "**/*.config.*",
      "docs/**",
      "**/playwright-report/**",
      "**/.next/**",
      "**/next-env.d.ts",
      // Built Figma plugin bundle (generated from figma/plugin/src, committed for designers).
      "figma/plugin/code.js",
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
    // These two key physical classes on a data-side they map themselves.
    files: ["packages/onu/src/ui/sheet.tsx", "packages/onu/src/ui/sidebar.tsx"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    // shadcn/ui code that Onu owns: its upstream patterns stay, but it uses logical utilities like the rest.
    files: ["packages/onu/src/ui/**"],
    rules: {
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
    // The full Lucide map (~250 icons) reaches components through OnuProvider's icon context,
    // which loads it on demand. Importing it directly puts it in every bundle that uses that component.
    files: ["packages/onu/src/**/*.{ts,tsx}"],
    ignores: [
      "packages/onu/src/icons/index.ts",
      "packages/onu/src/icons/standalone-icon.tsx",
      "packages/onu/src/providers/onu-provider.tsx",
      "**/*.test.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/lucide-map"],
              message:
                "Use <Icon name> (the default set comes from OnuProvider); for a fixed glyph pass fallback={LucideIcon}. See CONTRIBUTING.md › Icons.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // Playwright fixtures call `use()`, which is not React's hook.
    files: ["e2e/**"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/test/**"],
    rules: { "@typescript-eslint/no-non-null-assertion": "off" },
  },
)
