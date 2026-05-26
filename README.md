# mcp-stdio-guard Research Artifact

This repository contains the research artifact for the `mcp-stdio-guard` paper.
It is separate from the production implementation so experiments, paper drafts,
and generated evaluation outputs do not pollute the tool repository.

The production tool lives at:

<https://github.com/1Utkarsh1/mcp-stdio-guard>

Experiments in this repository should pin a specific `mcp-stdio-guard` release,
package version, or commit. Do not evaluate an implicit moving target such as an
unqualified local checkout unless the exact commit is recorded in the result
metadata.

Generated results must come from actual evaluation runs. Do not hand-write
numbers into result files, paper tables, or plots.

## Layout

```text
paper/
  main.tex
  references.bib
  figures/
  tables/

evaluation/
  fixtures/
  scripts/
  results/

artifact/
  README.md
  reproducibility.md
  environment.md
```

## Scripts

```bash
npm run evaluate
npm run evaluate:summary
npm run paper:check
```

`npm run evaluate` invokes a pinned `mcp-stdio-guard` package against synthetic
MCP stdio server fixtures using smoke, registry, CI, and strict profiles. It
writes generated outputs to `evaluation/results/raw-results.json`,
`evaluation/results/detection-matrix.csv`,
`evaluation/results/runtime-overhead.csv`, and `evaluation/results/summary.md`.
Those generated result files are intentionally ignored by Git.

Set the evaluated guard version with:

```bash
MCP_STDIO_GUARD_VERSION=mcp-stdio-guard@1.0.0 npm run evaluate
```

`npm run evaluate:summary` reads `evaluation/results/raw-results.json` and
prints an aggregate summary. It fails if no run output exists.

`npm run paper:check` performs lightweight repository checks for the paper
skeleton and confirms generated PDFs are not committed.
