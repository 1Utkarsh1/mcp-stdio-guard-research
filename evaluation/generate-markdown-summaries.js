import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { aggregateProfileMetrics, buildEvaluationSummary, formatRuntimeMs } from './metrics.js';
import { scenarios } from './run-evaluation.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const snapshotDir = path.resolve(
  root,
  process.argv[2] ?? 'artifact/results/v1.0.0-paper-baseline'
);
const rawResultsPath = path.join(snapshotDir, 'raw-results.json');
const outputDir = path.join(snapshotDir, 'tables');
const rawResults = JSON.parse(await fs.readFile(rawResultsPath, 'utf8'));
rawResults.summary = buildEvaluationSummary(rawResults.runs, scenarios);

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(
  path.join(outputDir, 'per-scenario-summary.md'),
  perScenarioSummary(rawResults)
);
await fs.writeFile(
  path.join(outputDir, 'per-profile-runtime.md'),
  perProfileRuntime(rawResults)
);
await fs.writeFile(
  path.join(outputDir, 'failure-taxonomy.md'),
  failureTaxonomy(rawResults)
);

console.log(`Generated artifact Markdown summaries from ${path.relative(root, rawResultsPath)}`);

function perScenarioSummary(result) {
  const rows = aggregateScenarios(result.runs);
  const lines = [
    '# Per-Scenario Summary',
    '',
    `Source: \`${path.relative(root, rawResultsPath)}\``,
    '',
    `Evaluated package: \`${result.guardPackage}\``,
    '',
    '| Scenario | Injected fault | Runs | Expected failure | Correct classifications | Issue codes |',
    '| --- | --- | ---: | --- | ---: | --- |'
  ];

  for (const row of rows) {
    lines.push(markdownRow([
      markdownCell(code(row.scenario)),
      markdownCell(row.injectedFault),
      String(row.runs),
      row.expectedFailure ? 'yes' : 'no',
      `${row.detectedRuns}/${row.runs}`,
      markdownCell(row.issueCodes.length ? row.issueCodes.map(code).join(', ') : 'none')
    ]));
  }

  return `${lines.join('\n')}\n`;
}

function perProfileRuntime(result) {
  const rows = aggregateProfileMetrics(result.runs);
  const lines = [
    '# Per-Profile Runtime',
    '',
    `Source: \`${path.relative(root, rawResultsPath)}\``,
    '',
    'Runtime is measured as wall-clock time for the evaluation run and includes `npx`, process startup, and guard execution.',
    '',
    '| Profile | Runs | Median ms | P95 ms | Max ms |',
    '| --- | ---: | ---: | ---: | ---: |'
  ];

  for (const row of rows) {
    lines.push(markdownRow([
      code(row.profile),
      String(row.runs),
      formatRuntimeMs(row.medianRuntimeMs),
      formatRuntimeMs(row.p95RuntimeMs),
      formatRuntimeMs(row.maxRuntimeMs)
    ]));
  }

  lines.push(
    markdownRow([
      '**All**',
      String(result.runs.length),
      formatRuntimeMs(result.summary.medianRuntimeMs),
      formatRuntimeMs(result.summary.p95RuntimeMs),
      formatRuntimeMs(Math.max(...result.runs.map((run) => run.durationMs)))
    ])
  );

  return `${lines.join('\n')}\n`;
}

function failureTaxonomy(result) {
  const rows = aggregateIssueCodes(result.runs);
  const lines = [
    '# Failure Taxonomy',
    '',
    `Source: \`${path.relative(root, rawResultsPath)}\``,
    '',
    'This table groups observed issue codes in the synthetic baseline. It is an artifact summary of observed guard output, not a complete taxonomy of all possible MCP failures.',
    '',
    '| Issue code | Runs | Scenarios | Profiles |',
    '| --- | ---: | --- | --- |'
  ];

  for (const row of rows) {
    lines.push(markdownRow([
      code(row.issueCode),
      String(row.runs),
      markdownCell(row.scenarios.map(code).join(', ')),
      markdownCell(row.profiles.map(code).join(', '))
    ]));
  }

  return `${lines.join('\n')}\n`;
}

function aggregateScenarios(runs) {
  const byScenario = new Map();
  for (const run of runs) {
    if (!byScenario.has(run.scenario)) {
      byScenario.set(run.scenario, {
        scenario: run.scenario,
        injectedFault: run.injectedFault,
        runs: 0,
        detectedRuns: 0,
        expectedFailure: run.expectedFailure,
        issueCodes: new Set()
      });
    }

    const row = byScenario.get(run.scenario);
    row.runs += 1;
    if (run.detected) row.detectedRuns += 1;
    for (const issueCode of run.issueCodes) row.issueCodes.add(issueCode);
  }

  return [...byScenario.values()].map((row) => ({
    ...row,
    issueCodes: [...row.issueCodes].sort()
  }));
}

function aggregateIssueCodes(runs) {
  const byIssueCode = new Map();
  for (const run of runs) {
    for (const issueCode of run.issueCodes) {
      if (!byIssueCode.has(issueCode)) {
        byIssueCode.set(issueCode, {
          issueCode,
          runs: 0,
          scenarios: new Set(),
          profiles: new Set()
        });
      }

      const row = byIssueCode.get(issueCode);
      row.runs += 1;
      row.scenarios.add(run.scenario);
      row.profiles.add(run.profile);
    }
  }

  return [...byIssueCode.values()].map((row) => ({
    ...row,
    scenarios: [...row.scenarios].sort(),
    profiles: [...row.profiles].sort()
  })).sort((a, b) => a.issueCode.localeCompare(b.issueCode));
}

function code(value) {
  return `\`${String(value).replaceAll('`', '\\`')}\``;
}

function markdownCell(value) {
  return String(value).replaceAll('|', '\\|');
}

function markdownRow(cells) {
  return `| ${cells.join(' | ')} |`;
}
