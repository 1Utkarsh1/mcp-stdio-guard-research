export function buildEvaluationSummary(runs, scenarioDefinitions) {
  const expectedFailureRuns = runs.filter((run) => run.expectedFailure);
  const expectedPassRuns = runs.filter((run) => !run.expectedFailure);
  const falseNegatives = expectedFailureRuns.filter((run) => !run.detected);
  const falsePositives = expectedPassRuns.filter((run) => !run.detected);
  const durations = sortedDurations(runs);

  return {
    totalScenarios: new Set(runs.map((run) => run.scenario)).size,
    totalRuns: runs.length,
    detectedFailures: expectedFailureRuns.filter((run) => run.detected).length,
    falsePositives: falsePositives.length,
    falseNegatives: falseNegatives.length,
    medianRuntimeMs: percentile(durations, 0.5),
    p95RuntimeMs: percentile(durations, 0.95),
    injectedFaultToIssueCodes: Object.fromEntries(
      scenarioDefinitions.map((scenario) => [
        scenario.injectedFault,
        [...new Set(
          runs
            .filter((run) => run.scenario === scenario.name)
            .flatMap((run) => run.issueCodes)
        )].sort()
      ])
    )
  };
}

export function aggregateProfileMetrics(runs) {
  const byProfile = new Map();
  for (const run of runs) {
    const values = byProfile.get(run.profile) ?? [];
    values.push(run.durationMs);
    byProfile.set(run.profile, values);
  }

  return [...byProfile.entries()].map(([profile, values]) => {
    const sorted = values.toSorted((a, b) => a - b);
    return {
      profile,
      runs: sorted.length,
      medianRuntimeMs: percentile(sorted, 0.5),
      p95RuntimeMs: percentile(sorted, 0.95),
      maxRuntimeMs: sorted.at(-1) ?? 0
    };
  }).sort((a, b) => a.profile.localeCompare(b.profile));
}

export function maxRuntimeMs(runs) {
  if (!runs.length) return 0;
  return Math.max(...runs.map((run) => run.durationMs));
}

export function formatRuntimeMs(value) {
  return Number(value).toFixed(3);
}

function sortedDurations(runs) {
  return runs.map((run) => run.durationMs).sort((a, b) => a - b);
}

function percentile(sortedValues, p) {
  if (!sortedValues.length) return 0;
  const index = Math.ceil(p * sortedValues.length) - 1;
  return Math.round(sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))] * 1000) / 1000;
}
