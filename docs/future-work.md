# Future Work

Future work should extend this artifact beyond the current synthetic baseline.

- Build a curated real-world MCP server corpus with recorded package versions,
  install commands, and maintainership metadata.
- Replicate the baseline on Linux and Windows to compare process and shell
  behavior across platforms.
- Separate guard runtime from `npx` and process-startup overhead to report both
  end-to-end and tool-internal costs.
- Build a larger static-scan precision and recall benchmark for stdout-risk
  patterns.
- Add more adversarial protocol cases, including malformed requests,
  notification handling, lifecycle ordering edge cases, and capability honesty
  checks.
- Track regressions across MCP specification versions and guard releases.
- Study registry integration patterns for presenting install/runtime health,
  stdio transport hygiene, and MCP protocol conformance separately.
- Conduct a developer usability study to understand whether issue codes,
  evidence, and remediation guidance help maintainers fix server defects.
