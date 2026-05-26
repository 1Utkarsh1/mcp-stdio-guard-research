# Per-Scenario Summary

Source: `artifact/results/v1.0.0-paper-baseline/raw-results.json`

Evaluated package: `mcp-stdio-guard@1.0.0`

| Scenario | Injected fault | Runs | Expected failure | Correct classifications | Issue codes |
| --- | --- | ---: | --- | ---: | --- |
| `clean-server` | none | 4 | no | 4/4 | none |
| `startup-stdout-pollution-server` | stdout banner before initialize | 4 | yes | 4/4 | `static-stdout-write`, `stdout-non-json` |
| `stderr-diagnostics-server` | diagnostics written to stderr only | 4 | no | 4/4 | none |
| `late-stdout-pollution-server` | stdout pollution after initialize/tools-list | 4 | yes | 4/4 | `adversarial-probe-invalid-stdout`, `stdout-non-json` |
| `malformed-json-server` | malformed stdout JSON during tools/list | 4 | yes | 4/4 | `operation-timeout`, `stdout-non-json` |
| `content-length-framing-server` | Content-Length framing on stdout | 4 | yes | 4/4 | `stdout-content-length-framing` |
| `missing-initialize-response-server` | missing initialize response | 4 | yes | 4/4 | `initialize-timeout` |
| `wrong-response-id-server` | initialize response id mismatch | 4 | yes | 4/4 | `response-id-mismatch` |
| `crash-after-initialize-server` | process crash after initialized notification | 4 | yes | 4/4 | `adversarial-probe-crash`, `server-crashed` |
| `duplicate-tool-name-server` | duplicate tools/list names | 4 | yes | 4/4 | `tool-name-duplicate` |
| `invalid-tool-schema-server` | invalid tools/list inputSchema.required | 4 | yes | 4/4 | `tool-input-schema-required-missing` |
| `capability-drift-server` | capability and tool-list drift across repeat runs | 2 | yes | 2/2 | `repeat-capability-drift`, `repeat-tool-drift` |
