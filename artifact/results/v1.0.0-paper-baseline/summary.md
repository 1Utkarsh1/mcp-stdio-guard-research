# Evaluation Summary

Generated at: 2026-05-26T17:28:48.108Z

Guard package: `mcp-stdio-guard@1.0.0`

| Metric | Value |
| --- | ---: |
| Total scenarios | 12 |
| Total runs | 46 |
| Detected failures | 38 |
| False positives | 0 |
| False negatives | 0 |
| Median runtime | 391.051 ms |
| P95 runtime | 3304.44 ms |

## Injected Fault to Detected Issue Codes

| Injected fault | Detected issue codes |
| --- | --- |
| none | none |
| stdout banner before initialize | `static-stdout-write`, `stdout-non-json` |
| diagnostics written to stderr only | none |
| stdout pollution after initialize/tools-list | `adversarial-probe-invalid-stdout`, `stdout-non-json` |
| malformed stdout JSON during tools/list | `operation-timeout`, `stdout-non-json` |
| Content-Length framing on stdout | `stdout-content-length-framing` |
| missing initialize response | `initialize-timeout` |
| initialize response id mismatch | `response-id-mismatch` |
| process crash after initialized notification | `adversarial-probe-crash`, `server-crashed` |
| duplicate tools/list names | `tool-name-duplicate` |
| invalid tools/list inputSchema.required | `tool-input-schema-required-missing` |
| capability and tool-list drift across repeat runs | `repeat-capability-drift`, `repeat-tool-drift` |

## Per-Run Detection Matrix

| Scenario | Profile | Expected failure | Detected | Issue codes | Runtime |
| --- | --- | ---: | ---: | --- | ---: |
| clean-server | smoke | false | true | none | 638.493 ms |
| clean-server | registry | false | true | none | 411.858 ms |
| clean-server | ci | false | true | none | 334.351 ms |
| clean-server | strict | false | true | none | 730.43 ms |
| startup-stdout-pollution-server | smoke | true | true | `stdout-non-json` | 325.417 ms |
| startup-stdout-pollution-server | registry | true | true | `stdout-non-json` | 382.717 ms |
| startup-stdout-pollution-server | ci | true | true | `static-stdout-write`, `stdout-non-json` | 311.371 ms |
| startup-stdout-pollution-server | strict | true | true | `static-stdout-write`, `stdout-non-json` | 724.028 ms |
| stderr-diagnostics-server | smoke | false | true | none | 317.624 ms |
| stderr-diagnostics-server | registry | false | true | none | 394.478 ms |
| stderr-diagnostics-server | ci | false | true | none | 330.517 ms |
| stderr-diagnostics-server | strict | false | true | none | 740.971 ms |
| late-stdout-pollution-server | smoke | true | true | `stdout-non-json` | 342.935 ms |
| late-stdout-pollution-server | registry | true | true | `stdout-non-json` | 474.965 ms |
| late-stdout-pollution-server | ci | true | true | `stdout-non-json` | 354.84 ms |
| late-stdout-pollution-server | strict | true | true | `adversarial-probe-invalid-stdout`, `stdout-non-json` | 275.219 ms |
| malformed-json-server | smoke | true | true | `operation-timeout`, `stdout-non-json` | 1849.256 ms |
| malformed-json-server | registry | true | true | `operation-timeout`, `stdout-non-json` | 3367.27 ms |
| malformed-json-server | ci | true | true | `operation-timeout`, `stdout-non-json` | 1872.894 ms |
| malformed-json-server | strict | true | true | `operation-timeout`, `stdout-non-json` | 3334.178 ms |
| content-length-framing-server | smoke | true | true | `stdout-content-length-framing` | 371.998 ms |
| content-length-framing-server | registry | true | true | `stdout-content-length-framing` | 262.641 ms |
| content-length-framing-server | ci | true | true | `stdout-content-length-framing` | 302.566 ms |
| content-length-framing-server | strict | true | true | `stdout-content-length-framing` | 266.073 ms |
| missing-initialize-response-server | smoke | true | true | `initialize-timeout` | 1747.038 ms |
| missing-initialize-response-server | registry | true | true | `initialize-timeout` | 3276.875 ms |
| missing-initialize-response-server | ci | true | true | `initialize-timeout` | 1777.865 ms |
| missing-initialize-response-server | strict | true | true | `initialize-timeout` | 3304.44 ms |
| wrong-response-id-server | smoke | true | true | `response-id-mismatch` | 430.238 ms |
| wrong-response-id-server | registry | true | true | `response-id-mismatch` | 277.433 ms |
| wrong-response-id-server | ci | true | true | `response-id-mismatch` | 295.709 ms |
| wrong-response-id-server | strict | true | true | `response-id-mismatch` | 277.93 ms |
| crash-after-initialize-server | smoke | true | true | `server-crashed` | 391.051 ms |
| crash-after-initialize-server | registry | true | true | `server-crashed` | 421.939 ms |
| crash-after-initialize-server | ci | true | true | `server-crashed` | 301.687 ms |
| crash-after-initialize-server | strict | true | true | `adversarial-probe-crash` | 355.254 ms |
| duplicate-tool-name-server | smoke | true | true | `tool-name-duplicate` | 398.685 ms |
| duplicate-tool-name-server | registry | true | true | `tool-name-duplicate` | 387.305 ms |
| duplicate-tool-name-server | ci | true | true | `tool-name-duplicate` | 314.781 ms |
| duplicate-tool-name-server | strict | true | true | `tool-name-duplicate` | 746.978 ms |
| invalid-tool-schema-server | smoke | true | true | `tool-input-schema-required-missing` | 348.176 ms |
| invalid-tool-schema-server | registry | true | true | `tool-input-schema-required-missing` | 475.546 ms |
| invalid-tool-schema-server | ci | true | true | `tool-input-schema-required-missing` | 314.465 ms |
| invalid-tool-schema-server | strict | true | true | `tool-input-schema-required-missing` | 728.344 ms |
| capability-drift-server | registry | true | true | `repeat-capability-drift`, `repeat-tool-drift` | 424.212 ms |
| capability-drift-server | strict | true | true | `repeat-capability-drift`, `repeat-tool-drift` | 726.002 ms |
