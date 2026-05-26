# Reproducibility

## Pin the Tool

Every evaluation run must record the exact `mcp-stdio-guard` version or commit.
By default, the scripts evaluate:

```bash
MCP_STDIO_GUARD_VERSION=mcp-stdio-guard@1.0.0
```

To evaluate another release:

```bash
MCP_STDIO_GUARD_VERSION=mcp-stdio-guard@1.0.0 npm run evaluate
```

To evaluate a local checkout, install or pack that checkout separately and
record the exact Git commit in the run notes. Avoid unrecorded moving targets.

## Results

Raw JSON outputs and stderr logs are generated under `evaluation/results/<run>/`.
Those files are ignored by Git so the repository does not accumulate generated
data. If a result is used in the paper, keep the raw run artifacts somewhere
durable and cite the pinned tool version.

Do not hand-write result numbers. Tables and plots should be derived from raw
evaluation output.
