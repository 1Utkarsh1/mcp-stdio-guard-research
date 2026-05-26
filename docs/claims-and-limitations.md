# Claims and Limitations

## Supported claims

The artifact evaluates `mcp-stdio-guard@1.0.0`.

The official baseline contains 12 synthetic scenarios and 46 profile/scenario
runs.

Under the artifact's scenario definitions, the baseline detects 38
expected-failure runs.

Under the artifact's scenario definitions, the synthetic baseline has 0 false
positives and 0 false negatives.

The baseline median wall-clock runtime is 391.051 ms.

The baseline p95 wall-clock runtime is 3304.44 ms.

Detection and runtime tables are generated from
`artifact/results/v1.0.0-paper-baseline/raw-results.json`.

Results come from actual evaluation output.

## Limitations

The evaluation is synthetic, not a broad real-world MCP server corpus.

The artifact does not prove full MCP compliance for arbitrary servers.

The artifact does not prove semantic correctness of server tools.

The artifact does not provide a security guarantee.

Runtime includes `npx`, process startup, and guard execution.

Static stdout-risk scanning may miss dynamic stdout writes.

Results are tied to the pinned `mcp-stdio-guard@1.0.0` version and should be
regenerated after major tool or specification changes.
