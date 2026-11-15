{{--
    @javaabu/onu-mcp guidelines for AI code assistants

    Maintained by: Javaabu (https://javaabu.com)
--}}

## Onu MCP server (`@javaabu/onu-mcp`)

- This project has the Onu MCP server, which serves the docs of the installed `@javaabu/onu`. When writing UI with Onu, call `onu_get_rules` once, then `onu_get_doc` for each component before using it.
- Always activate the `javaabu-onu-mcp` skill when looking up Onu components or their props.
