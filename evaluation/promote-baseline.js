import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildEvaluationSummary } from './metrics.js';
import { scenarios } from './run-evaluation.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'evaluation', 'results');
const baselineDir = path.join(root, process.argv[2] ?? 'artifact/results/v1.0.0-paper-baseline');
const command = 'MCP_STDIO_GUARD_VERSION=mcp-stdio-guard@1.0.0 npm run evaluate';
const files = [
  'raw-results.json',
  'detection-matrix.csv',
  'runtime-overhead.csv',
  'summary.md'
];

await fs.mkdir(baselineDir, { recursive: true });

for (const file of files) {
  await fs.copyFile(path.join(sourceDir, file), path.join(baselineDir, file));
}

const rawResultsPath = path.join(baselineDir, 'raw-results.json');
const rawResults = JSON.parse(await fs.readFile(rawResultsPath, 'utf8'));
rawResults.summary = buildEvaluationSummary(rawResults.runs, scenarios);
await fs.writeFile(rawResultsPath, `${JSON.stringify(rawResults, null, 2)}\n`);
const npmVersion = commandOutput('npm', ['-v']);
const osDescription = commandOutput('uname', ['-a']);
const readme = `# v1.0.0 Paper Baseline

This directory preserves the official reproducible result snapshot for the
paper baseline.

## Command

\`\`\`bash
${command}
\`\`\`

## Environment

| Field | Value |
| --- | --- |
| Date | ${rawResults.generatedAt} |
| Tool version | \`${rawResults.guardPackage}\` |
| Node.js | \`${rawResults.node}\` |
| npm | \`${npmVersion}\` |
| OS | \`${osDescription}\` |
| Platform | \`${rawResults.platform}\` |
| Architecture | \`${rawResults.arch}\` |

## Result Summary

| Metric | Value |
| --- | ---: |
| Total scenarios | ${rawResults.summary.totalScenarios} |
| Total runs | ${rawResults.summary.totalRuns} |
| Detected failures | ${rawResults.summary.detectedFailures} |
| False positives | ${rawResults.summary.falsePositives} |
| False negatives | ${rawResults.summary.falseNegatives} |
| Median runtime | ${rawResults.summary.medianRuntimeMs} ms |
| P95 runtime | ${rawResults.summary.p95RuntimeMs} ms |

## Preserved Outputs

- \`raw-results.json\`
- \`detection-matrix.csv\`
- \`runtime-overhead.csv\`
- \`summary.md\`

The files in this directory were copied from \`evaluation/results/\` immediately
after the command above completed successfully. The paper tables under
\`paper/tables/\` are generated from this snapshot, not from hand-written values.
`;

await fs.writeFile(path.join(baselineDir, 'README.md'), readme);
console.log(`Promoted baseline snapshot to ${path.relative(root, baselineDir)}`);

function commandOutput(commandName, args) {
  const result = spawnSync(commandName, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${commandName} ${args.join(' ')} failed: ${result.stderr}`);
  }
  return result.stdout.trim();
}
