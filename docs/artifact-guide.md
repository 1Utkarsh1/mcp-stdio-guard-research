# Artifact Guide

This repository is the research artifact for evaluating `mcp-stdio-guard`, a
validation tool for Model Context Protocol (MCP) stdio servers. The production
tool is maintained separately at <https://github.com/1Utkarsh1/mcp-stdio-guard>.

## Repository layout

### `paper/main.tex`

This file contains the paper draft skeleton. It introduces the evaluation
problem, summarizes the synthetic failure taxonomy, describes the guard at a
high level, and imports generated tables from `paper/tables/`.

To inspect it, open the LaTeX source directly. To verify that the paper scaffold
still has the expected references and generated table inputs, run:

```bash
npm run paper:check
```

### `paper/references.bib`

This BibTeX file contains references used by `paper/main.tex`, including the
production tool repository, JSON-RPC 2.0, and MCP lifecycle and stdio transport
documentation.

It matters because the paper draft should cite the protocol and tool artifacts
that define the evaluated behavior. `npm run paper:check` verifies that the
expected core entries are present.

### `paper/tables/`

This directory contains LaTeX tables generated from the official baseline
snapshot. The current generated tables are:

- `detection-matrix.tex`
- `runtime-overhead.tex`

These files should not be edited by hand. Regenerate them from the preserved
baseline with:

```bash
npm run paper:tables
```

### `artifact/results/v1.0.0-paper-baseline/`

This directory preserves the official reproducible result snapshot for
`mcp-stdio-guard@1.0.0`. It contains:

- `raw-results.json`, the machine-readable run output.
- `detection-matrix.csv`, the generated per-run detection matrix.
- `runtime-overhead.csv`, the generated per-run runtime measurements.
- `summary.md`, the generated baseline summary.
- `README.md`, the command, environment, and high-level result summary.

This directory matters because paper tables and claims should be traceable to a
fixed snapshot rather than to temporary generated files. Inspect
`raw-results.json` for the source data and run `npm run paper:tables` to
regenerate the paper tables from it.

### `evaluation/run-evaluation.js`

This script runs the synthetic MCP stdio fixture suite against a pinned
`mcp-stdio-guard` package. It writes raw JSON, CSV, and Markdown outputs under
`evaluation/results/`.

To reproduce a fresh evaluation run for the current pinned baseline, run:

```bash
MCP_STDIO_GUARD_VERSION=mcp-stdio-guard@1.0.0 npm run evaluate
```

The files under `evaluation/results/` are temporary generated outputs and are
ignored by Git. Promote only intentional baseline snapshots into
`artifact/results/`.

### `evaluation/metrics.js`

This module contains the shared summary and runtime metric calculations used by
the evaluation runner, baseline promotion script, and paper table generator.

It matters because the baseline README, raw-result summary, and paper runtime
table should calculate median and p95 runtime the same way. Reuse this module
when adding new generated summaries.

### `evaluation/fixtures/`

This directory contains synthetic MCP stdio server fixtures. Each fixture is a
small executable server or process-boundary behavior designed to exercise one
constructed scenario, such as stdout pollution, malformed JSON, a missing
initialize response, duplicate tool names, or repeat-run drift.

Inspect individual fixture files to understand the injected behavior. The
scenario mapping is defined in `evaluation/run-evaluation.js`.

### `evaluation/static-scan/`

This directory contains static-scan input used by scenarios that exercise
stdout-risk scanning. The startup stdout pollution scenario uses this tree for
CI and strict profiles.

It matters because the artifact evaluates both runtime behavior and a small
static stdout-risk check where the relevant profile enables it.

### `test/evaluation.test.js`

This Node test verifies that the evaluation runner can execute selected
fixtures and write machine-readable outputs. It provides a lightweight guardrail
for the artifact scripts.

Run the test suite with:

```bash
npm test
```
