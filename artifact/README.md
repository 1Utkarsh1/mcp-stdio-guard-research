# Artifact Overview

This artifact supports the `mcp-stdio-guard` paper. It contains a paper
skeleton, synthetic MCP stdio server fixtures, evaluation scripts, and
reproducibility notes.

The production tool is maintained separately:

<https://github.com/1Utkarsh1/mcp-stdio-guard>

Do not place generated result numbers in this repository unless they were
created by running the evaluation scripts against a pinned tool version or
commit.

## Quick Check

```bash
npm ci
MCP_STDIO_GUARD_VERSION=mcp-stdio-guard@1.0.0 npm run evaluate
npm run summarize
npm run paper:check
```

Generated outputs are written under `evaluation/results/` and ignored by Git.
