# Result Interpretation

The synthetic baseline contains 12 scenarios and 46 profile/scenario runs. Of
those runs, 38 are expected-failure runs, and all 38 were detected under the
artifact's expected issue-code definitions. The detection matrix shows that the
constructed failures cover stdout pollution, malformed or unexpected framing,
initialize lifecycle failure, response id mismatch, process crash behavior,
tool metadata defects, static stdout-risk scanning, adversarial probes, and
repeat-run drift. The expected-pass controls, including the clean server and
stderr-only diagnostics server, were not classified as failures.

The baseline median wall-clock runtime is 391.051 ms and the p95 wall-clock
runtime is 3304.44 ms. These measurements are end-to-end evaluation times: they
include `npx`, process startup, fixture startup, and guard execution. They
should therefore be interpreted as artifact-level execution costs rather than
isolated parser or validation overhead.

The synthetic baseline shows that the guard correctly classified all
constructed pass/fail scenarios under the artifact's expected issue-code
definitions. In this context, 0 false positives means that the expected-pass
control runs were accepted. Likewise, 0 false negatives means that the
constructed expected-failure runs produced at least one expected issue code for
the relevant scenario.

These results do not mean that the guard works on all MCP servers, proves full
MCP compliance, proves tool semantic correctness, or provides a security
guarantee. They show reproducible behavior for a fixed synthetic fixture suite,
a pinned guard version, and the environment recorded in the official baseline.
