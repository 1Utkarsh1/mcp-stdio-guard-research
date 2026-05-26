# Per-Profile Runtime

Source: `artifact/results/v1.0.0-paper-baseline/raw-results.json`

Runtime is measured as wall-clock time for the evaluation run and includes `npx`, process startup, and guard execution.

| Profile | Runs | Median ms | P95 ms | Max ms |
| --- | ---: | ---: | ---: | ---: |
| `ci` | 11 | 314.781 | 1872.894 | 1872.894 |
| `registry` | 12 | 411.858 | 3367.270 | 3367.270 |
| `smoke` | 11 | 391.051 | 1849.256 | 1849.256 |
| `strict` | 12 | 726.002 | 3334.178 | 3334.178 |
| **All** | 46 | 391.051 | 3304.440 | 3367.270 |
