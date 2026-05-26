# Evaluation Methodology

The artifact evaluates `mcp-stdio-guard@1.0.0` using synthetic MCP stdio
fixtures. Each fixture represents one constructed process-boundary behavior,
such as stdout pollution, a malformed JSON-RPC frame, an incomplete initialize
lifecycle, or repeat-run drift.

The evaluation runner executes each applicable fixture under the guard profiles
`smoke`, `registry`, `ci`, and `strict`. Not every scenario runs under every
profile; for example, the capability drift fixture is evaluated under the
profiles that perform repeat-run comparisons. Profile selection is defined in
`evaluation/run-evaluation.js`.

Results are generated from actual command output. The evaluation script invokes
the pinned package, records the guard result, classifies whether the expected
issue code was detected, and writes raw JSON plus generated CSV and Markdown
summaries. The official baseline is preserved under
`artifact/results/v1.0.0-paper-baseline/`, and paper tables are generated from
`artifact/results/v1.0.0-paper-baseline/raw-results.json`.

To reproduce a fresh temporary evaluation run:

```bash
MCP_STDIO_GUARD_VERSION=mcp-stdio-guard@1.0.0 npm run evaluate
```

To regenerate paper tables from the preserved baseline:

```bash
npm run paper:tables
```

## Scenario set

The baseline contains the following synthetic scenarios:

| Scenario | Constructed behavior |
| --- | --- |
| `clean-server` | A conforming fixture used as an expected-pass control. |
| `startup-stdout-pollution-server` | Writes non-protocol output to stdout before initialize. |
| `stderr-diagnostics-server` | Writes diagnostics to stderr only and remains an expected-pass control. |
| `late-stdout-pollution-server` | Writes non-protocol output to stdout after initialization or operation handling. |
| `malformed-json-server` | Emits malformed stdout JSON during an operation. |
| `content-length-framing-server` | Emits LSP-style `Content-Length` framing on stdout. |
| `missing-initialize-response-server` | Fails to produce an initialize response. |
| `wrong-response-id-server` | Responds with an id that does not match the request id. |
| `crash-after-initialize-server` | Crashes after the initialized notification. |
| `duplicate-tool-name-server` | Returns duplicate tool names from `tools/list`. |
| `invalid-tool-schema-server` | Returns an invalid tool input schema. |
| `capability-drift-server` | Produces capability and tool-list drift across repeat runs. |

The scenario set is intentionally synthetic. It is designed to make specific
process-boundary behaviors reproducible, not to represent a broad census of
real-world MCP servers.
