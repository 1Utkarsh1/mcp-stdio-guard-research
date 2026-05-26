# Evaluation Suite

This folder contains the reproducible evaluation suite for the
`mcp-stdio-guard` research artifact.

## Production Capability Audit

The production tool repository already contains implementation and tests for the
evaluation areas below:

| Area | Existing production support |
| --- | --- |
| Runtime MCP stdio validation | CLI starts a target server, performs `initialize`, sends `notifications/initialized`, and can run post-initialize requests such as `tools/list`. |
| Stdout pollution detection | Runtime stdout is parsed as newline-delimited JSON-RPC; non-JSON diagnostics, empty lines, oversized lines, and late stdout pollution produce issue codes. |
| JSON-RPC validation | Frames are checked for `jsonrpc`, id shape, request/response invariants, structured errors, and response id round-trip behavior. |
| MCP initialize lifecycle checks | Initialize result shape, protocol version, capabilities, serverInfo, notification behavior, and missing response/timeouts are classified. |
| Capability probing | Advertised `tools`, `resources`, and `prompts` list methods are probed unless the profile disables capability probes. |
| Static scan detection | JavaScript and Python stdout-write patterns are scanned when `--scan` is used; `ci`/`strict` can fail static findings. |
| Repeat-run drift detection | `--repeat` and registry/strict profiles compare negotiated protocol, capability keys, tools, and resource/prompt list counts. |
| Adversarial probes | Strict/opt-in probes send invalid method, invalid params, notification, malformed JSON, and configured invalid tool-call cases. |

## Generated Outputs

`npm run evaluate` writes:

- `evaluation/results/raw-results.json`
- `evaluation/results/detection-matrix.csv`
- `evaluation/results/runtime-overhead.csv`
- `evaluation/results/summary.md`

These files are generated from actual `mcp-stdio-guard` command output and are
ignored by Git.
