{{--
    @javaabu/onu guidelines for AI code assistants

    Maintained by: Javaabu (https://javaabu.com)
--}}

## Onu (`@javaabu/onu`)

- This project builds its React UI with Onu (`@javaabu/onu`), Javaabu's component library on shadcn/ui and Tailwind CSS v4, installed from npm. Don't copy shadcn/ui components into the project or add another UI kit next to it.
- Always activate the `javaabu-onu` skill when adding or changing React pages, forms, tables, layouts or components.
- The rules for writing Onu code, and the docs of the installed version, are in `node_modules/@javaabu/onu/llms.txt`. Read a component's page there before using it, and use only the props it lists.
- Pages run in Dhivehi (right to left): use logical utilities (`ms-`, `pe-`, `start-`, `text-start`), never `left`/`right`.
