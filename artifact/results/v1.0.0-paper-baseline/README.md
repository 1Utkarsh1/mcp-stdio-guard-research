# v1.0.0 Paper Baseline

This directory preserves the official reproducible result snapshot for the
paper baseline.

## Command

```bash
MCP_STDIO_GUARD_VERSION=mcp-stdio-guard@1.0.0 npm run evaluate
```

## Environment

| Field | Value |
| --- | --- |
| Date | 2026-05-26T17:28:48.108Z |
| Tool version | `mcp-stdio-guard@1.0.0` |
| Node.js | `v24.14.0` |
| npm | `11.9.0` |
| OS | `Darwin Utkarshs-MacBook.local 25.4.0 Darwin Kernel Version 25.4.0: Thu Mar 19 19:33:33 PDT 2026; root:xnu-12377.101.15~1/RELEASE_ARM64_T8140 arm64` |
| Platform | `darwin` |
| Architecture | `arm64` |

## Result Summary

| Metric | Value |
| --- | ---: |
| Total scenarios | 12 |
| Total runs | 46 |
| Detected failures | 38 |
| False positives | 0 |
| False negatives | 0 |
| Median runtime | 391.051 ms |
| P95 runtime | 3304.44 ms |

## Preserved Outputs

- `raw-results.json`
- `detection-matrix.csv`
- `runtime-overhead.csv`
- `summary.md`

The files in this directory were copied from `evaluation/results/` immediately
after the command above completed successfully. The paper tables under
`paper/tables/` are generated from this snapshot, not from hand-written values.
