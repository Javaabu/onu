---
name: onu
description: Build or change React UI with Onu (@javaabu/onu), Javaabu's shadcn/ui-based component library. Use whenever the project depends on @javaabu/onu and the task adds or edits pages, forms, tables, layouts or components, or asks which Onu component to use, including Laravel + Inertia apps and Dhivehi/RTL screens.
---

# Building UI with Onu

Onu is an npm package (not copy-paste shadcn/ui): components come from `@javaabu/onu` and its entry points. Its docs ship with the package, so they always match the installed version.

## 1. Load the rules once

Read the **Rules** section at the top of `node_modules/@javaabu/onu/llms.txt` (or call the `onu_get_rules` tool). They cover setup, imports, forms with Laravel validation, Thaana and RTL, theming, icons and accessibility. Follow them over habits from other UI kits.

## 2. Pick components from the index

`llms.txt` lists every component, hook and guide with one line on what it is for. Search it (or call `onu_search_docs` / `onu_list_components`) before writing a component yourself: Onu probably has it (listing pages, save bars, confirm dialogs, Thaana inputs, Maldivian phone and ID inputs, eFaas and BML brand assets…).

## 3. Read each component's page before using it

`node_modules/@javaabu/onu/docs/<group>/<name>.md` (paths are in `llms.txt`), or `onu_get_doc` with the component name. Use the import from its first code block and only the props in its **Props** table. Follow its **Accessibility** notes (labels for icon-only buttons and so on).

## 4. Check your work

- No physical direction utilities in what you wrote: search your changes for `\b(ml|mr|pl|pr|left|right)-|text-(left|right)` and replace them with logical ones (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`).
- No raw colours (`bg-blue-600`, hex values) on Onu components: use theme tokens.
- Every control is inside a `FormField` with a `name`; forms submit through `Form` and `SubmitButton`.
- Run the project's typecheck; TypeScript catches props that don't exist.

If `node_modules/@javaabu/onu/llms.txt` is missing (an Onu version from before the docs shipped), use the MCP tools or https://onu.on-forge.com/llms.txt.
