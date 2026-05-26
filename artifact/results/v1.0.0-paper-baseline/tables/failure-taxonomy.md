# Failure Taxonomy

Source: `artifact/results/v1.0.0-paper-baseline/raw-results.json`

This table groups observed issue codes in the synthetic baseline. It is an artifact summary of observed guard output, not a complete taxonomy of all possible MCP failures.

| Issue code | Runs | Scenarios | Profiles |
| --- | ---: | --- | --- |
| `adversarial-probe-crash` | 1 | `crash-after-initialize-server` | `strict` |
| `adversarial-probe-invalid-stdout` | 1 | `late-stdout-pollution-server` | `strict` |
| `initialize-timeout` | 4 | `missing-initialize-response-server` | `ci`, `registry`, `smoke`, `strict` |
| `operation-timeout` | 4 | `malformed-json-server` | `ci`, `registry`, `smoke`, `strict` |
| `repeat-capability-drift` | 2 | `capability-drift-server` | `registry`, `strict` |
| `repeat-tool-drift` | 2 | `capability-drift-server` | `registry`, `strict` |
| `response-id-mismatch` | 4 | `wrong-response-id-server` | `ci`, `registry`, `smoke`, `strict` |
| `server-crashed` | 3 | `crash-after-initialize-server` | `ci`, `registry`, `smoke` |
| `static-stdout-write` | 2 | `startup-stdout-pollution-server` | `ci`, `strict` |
| `stdout-content-length-framing` | 4 | `content-length-framing-server` | `ci`, `registry`, `smoke`, `strict` |
| `stdout-non-json` | 12 | `late-stdout-pollution-server`, `malformed-json-server`, `startup-stdout-pollution-server` | `ci`, `registry`, `smoke`, `strict` |
| `tool-input-schema-required-missing` | 4 | `invalid-tool-schema-server` | `ci`, `registry`, `smoke`, `strict` |
| `tool-name-duplicate` | 4 | `duplicate-tool-name-server` | `ci`, `registry`, `smoke`, `strict` |
