---
"@javaabu/onu": patch
---

`normalizeUrl` (used by `TextInput type="url"` and the editor's link and image dialogs) reads `host:port` as a host, so `localhost:3000` and `example.mv:8080/x` get the protocol instead of being rejected.
