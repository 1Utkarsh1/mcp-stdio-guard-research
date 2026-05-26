import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultResultsDir = path.join(root, 'evaluation', 'results');
const defaultGuardPackage = process.env.MCP_STDIO_GUARD_VERSION || 'mcp-stdio-guard@1.0.0';
const defaultProfiles = ['smoke', 'registry', 'ci', 'strict'];
const defaultTimeoutMs = Number.parseInt(process.env.MCP_STDIO_GUARD_TIMEOUT_MS || '1500', 10);

export const scenarios = [
  {
    name: 'clean-server',
    injectedFault: 'none',
    fixture: 'clean-server.mjs',
    expectedFailure: false,
    expectedIssueCodes: [],
    profiles: defaultProfiles
  },
  {
    name: 'startup-stdout-pollution-server',
    injectedFault: 'stdout banner before initialize',
    fixture: 'startup-stdout-pollution-server.mjs',
    expectedFailure: true,
    expectedIssueCodes: ['stdout-non-json'],
    profiles: defaultProfiles,
    scanProfiles: ['ci', 'strict'],
    scanPath: 'evaluation/static-scan/startup-stdout-pollution'
  },
  {
    name: 'stderr-diagnostics-server',
    injectedFault: 'diagnostics written to stderr only',
    fixture: 'stderr-diagnostics-server.mjs',
    expectedFailure: false,
    expectedIssueCodes: [],
    profiles: defaultProfiles
  },
  {
    name: 'late-stdout-pollution-server',
    injectedFault: 'stdout pollution after initialize/tools-list',
    fixture: 'late-stdout-pollution-server.mjs',
    expectedFailure: true,
    expectedIssueCodes: ['stdout-non-json'],
    profiles: defaultProfiles
  },
  {
    name: 'malformed-json-server',
    injectedFault: 'malformed stdout JSON during tools/list',
    fixture: 'malformed-json-server.mjs',
    expectedFailure: true,
    expectedIssueCodes: ['stdout-non-json'],
    profiles: defaultProfiles
  },
  {
    name: 'content-length-framing-server',
    injectedFault: 'Content-Length framing on stdout',
    fixture: 'content-length-framing-server.mjs',
    expectedFailure: true,
    expectedIssueCodes: ['stdout-content-length-framing'],
    profiles: defaultProfiles
  },
  {
    name: 'missing-initialize-response-server',
    injectedFault: 'missing initialize response',
    fixture: 'missing-initialize-response-server.mjs',
    expectedFailure: true,
    expectedIssueCodes: ['initialize-timeout'],
    profiles: defaultProfiles
  },
  {
    name: 'wrong-response-id-server',
    injectedFault: 'initialize response id mismatch',
    fixture: 'wrong-response-id-server.mjs',
    expectedFailure: true,
    expectedIssueCodes: ['response-id-mismatch'],
    profiles: defaultProfiles
  },
  {
    name: 'crash-after-initialize-server',
    injectedFault: 'process crash after initialized notification',
    fixture: 'crash-after-initialize-server.mjs',
    expectedFailure: true,
    expectedIssueCodes: ['server-crashed', 'adversarial-probe-crash'],
    profiles: defaultProfiles
  },
  {
    name: 'duplicate-tool-name-server',
    injectedFault: 'duplicate tools/list names',
    fixture: 'duplicate-tool-name-server.mjs',
    expectedFailure: true,
    expectedIssueCodes: ['tool-name-duplicate'],
    profiles: defaultProfiles
  },
  {
    name: 'invalid-tool-schema-server',
    injectedFault: 'invalid tools/list inputSchema.required',
    fixture: 'invalid-tool-schema-server.mjs',
    expectedFailure: true,
    expectedIssueCodes: ['tool-input-schema-required-missing'],
    profiles: defaultProfiles
  },
  {
    name: 'capability-drift-server',
    injectedFault: 'capability and tool-list drift across repeat runs',
    fixture: 'capability-drift-server.mjs',
    expectedFailure: true,
    expectedIssueCodes: ['repeat-capability-drift', 'repeat-tool-drift'],
    profiles: ['registry', 'strict']
  }
];

export async function runEvaluation(options = {}) {
  const selectedProfiles = options.profiles ?? defaultProfiles;
  const selectedScenarios = options.scenarios ?? scenarios.map((scenario) => scenario.name);
  const resultsDir = options.resultsDir ?? defaultResultsDir;
  const guardPackage = options.guardPackage ?? defaultGuardPackage;
  const timeoutMs = options.timeoutMs ?? defaultTimeoutMs;
  const stateDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mcp-stdio-guard-research-'));
  const rawResultsPath = path.join(resultsDir, 'raw-results.json');
  const detectionMatrixPath = path.join(resultsDir, 'detection-matrix.csv');
  const runtimeOverheadPath = path.join(resultsDir, 'runtime-overhead.csv');
  const summaryPath = path.join(resultsDir, 'summary.md');
  const runs = [];

  await fs.mkdir(resultsDir, { recursive: true });

  for (const scenario of scenarios) {
    if (!selectedScenarios.includes(scenario.name)) continue;

    for (const profile of scenario.profiles) {
      if (!selectedProfiles.includes(profile)) continue;
      runs.push(await runScenarioProfile({ scenario, profile, guardPackage, timeoutMs, stateDir }));
    }
  }

  const summary = buildSummary(runs);
  const rawResults = {
    generatedAt: new Date().toISOString(),
    guardPackage,
    timeoutMs,
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    profiles: selectedProfiles,
    scenarios: selectedScenarios,
    summary,
    runs
  };

  await fs.writeFile(rawResultsPath, `${JSON.stringify(rawResults, null, 2)}\n`);
  await fs.writeFile(detectionMatrixPath, toDetectionMatrixCsv(runs));
  await fs.writeFile(runtimeOverheadPath, toRuntimeOverheadCsv(runs));
  await fs.writeFile(summaryPath, toSummaryMarkdown(rawResults));

  return {
    ...rawResults,
    files: {
      rawResults: rawResultsPath,
      detectionMatrix: detectionMatrixPath,
      runtimeOverhead: runtimeOverheadPath,
      summary: summaryPath
    }
  };
}

export function buildSummary(runs) {
  const expectedFailureRuns = runs.filter((run) => run.expectedFailure);
  const expectedPassRuns = runs.filter((run) => !run.expectedFailure);
  const falseNegatives = expectedFailureRuns.filter((run) => !run.detected);
  const falsePositives = expectedPassRuns.filter((run) => !run.detected);
  const durations = runs.map((run) => run.durationMs).sort((a, b) => a - b);

  return {
    totalScenarios: new Set(runs.map((run) => run.scenario)).size,
    totalRuns: runs.length,
    detectedFailures: expectedFailureRuns.filter((run) => run.detected).length,
    falsePositives: falsePositives.length,
    falseNegatives: falseNegatives.length,
    medianRuntimeMs: percentile(durations, 0.5),
    p95RuntimeMs: percentile(durations, 0.95),
    injectedFaultToIssueCodes: Object.fromEntries(
      scenarios.map((scenario) => [
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

async function runScenarioProfile({ scenario, profile, guardPackage, timeoutMs, stateDir }) {
  const fixturePath = path.join(root, 'evaluation', 'fixtures', scenario.fixture);
  const fixtureStatePath = path.join(stateDir, `${scenario.name}-${profile}.state`);
  const args = [
    '--yes',
    guardPackage,
    '--json',
    '--profile',
    profile,
    '--timeout',
    String(timeoutMs),
    '--request',
    'tools/list'
  ];

  if (scenario.scanProfiles?.includes(profile)) {
    args.push('--scan', path.join(root, scenario.scanPath));
  }

  args.push('--', process.execPath, fixturePath);

  const started = process.hrtime.bigint();
  const command = ['npx', ...args];
  const result = await runCommand('npx', args, {
    MCP_STDIO_GUARD_FIXTURE_STATE: fixtureStatePath
  });
  const durationMs = Number(process.hrtime.bigint() - started) / 1_000_000;
  const parsed = parseJsonOutput(result.stdout);
  const issueCodes = Array.isArray(parsed.issues)
    ? [...new Set(parsed.issues.map((issue) => issue.code).filter(Boolean))].sort()
    : [];
  const expectedIssueCodeFound = scenario.expectedIssueCodes.length === 0
    ? issueCodes.length === 0
    : scenario.expectedIssueCodes.some((code) => issueCodes.includes(code));
  const observedOk = typeof parsed.ok === 'boolean' ? parsed.ok : result.exitCode === 0;
  const detected = scenario.expectedFailure
    ? expectedIssueCodeFound
    : observedOk;

  return {
    scenario: scenario.name,
    profile,
    injectedFault: scenario.injectedFault,
    fixture: path.relative(root, fixturePath),
    command,
    expectedFailure: scenario.expectedFailure,
    expectedIssueCodes: scenario.expectedIssueCodes,
    exitCode: result.exitCode,
    signal: result.signal,
    observedOk,
    detected,
    falsePositive: !scenario.expectedFailure && !detected,
    falseNegative: scenario.expectedFailure && !detected,
    issueCodes,
    summaryStatus: parsed.summary?.status ?? '',
    durationMs: Math.round(durationMs * 1000) / 1000,
    guardDurationMs: typeof parsed.durationMs === 'number' ? parsed.durationMs : null,
    stdoutParseError: parsed.parseError ?? '',
    stderr: result.stderr,
    result: parsed
  };
}

function parseJsonOutput(stdout) {
  try {
    return JSON.parse(stdout);
  } catch (error) {
    return {
      parseError: error.message,
      rawStdout: stdout
    };
  }
}

function runCommand(command, args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, ...extraEnv }
    });

    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (exitCode, signal) => {
      resolve({ exitCode, signal, stdout, stderr });
    });
  });
}

function toDetectionMatrixCsv(runs) {
  const rows = [[
    'scenario',
    'profile',
    'injected_fault',
    'expected_failure',
    'detected',
    'false_positive',
    'false_negative',
    'expected_issue_codes',
    'detected_issue_codes',
    'ok',
    'summary_status',
    'duration_ms'
  ]];

  for (const run of runs) {
    rows.push([
      run.scenario,
      run.profile,
      run.injectedFault,
      String(run.expectedFailure),
      String(run.detected),
      String(run.falsePositive),
      String(run.falseNegative),
      run.expectedIssueCodes.join('|'),
      run.issueCodes.join('|'),
      String(run.observedOk),
      run.summaryStatus,
      String(run.durationMs)
    ]);
  }

  return rows.map((row) => row.map(csvCell).join(',')).join('\n') + '\n';
}

function toRuntimeOverheadCsv(runs) {
  const rows = [[
    'scenario',
    'profile',
    'duration_ms',
    'guard_duration_ms',
    'exit_code'
  ]];

  for (const run of runs) {
    rows.push([
      run.scenario,
      run.profile,
      String(run.durationMs),
      run.guardDurationMs === null ? '' : String(run.guardDurationMs),
      String(run.exitCode)
    ]);
  }

  return rows.map((row) => row.map(csvCell).join(',')).join('\n') + '\n';
}

function toSummaryMarkdown(rawResults) {
  const { summary, runs } = rawResults;
  const lines = [
    '# Evaluation Summary',
    '',
    `Generated at: ${rawResults.generatedAt}`,
    '',
    `Guard package: \`${rawResults.guardPackage}\``,
    '',
    '| Metric | Value |',
    '| --- | ---: |',
    `| Total scenarios | ${summary.totalScenarios} |`,
    `| Total runs | ${summary.totalRuns} |`,
    `| Detected failures | ${summary.detectedFailures} |`,
    `| False positives | ${summary.falsePositives} |`,
    `| False negatives | ${summary.falseNegatives} |`,
    `| Median runtime | ${summary.medianRuntimeMs} ms |`,
    `| P95 runtime | ${summary.p95RuntimeMs} ms |`,
    '',
    '## Injected Fault to Detected Issue Codes',
    '',
    '| Injected fault | Detected issue codes |',
    '| --- | --- |'
  ];

  for (const [fault, codes] of Object.entries(summary.injectedFaultToIssueCodes)) {
    lines.push(`| ${fault} | ${codes.length ? codes.map((code) => `\`${code}\``).join(', ') : 'none'} |`);
  }

  lines.push('', '## Per-Run Detection Matrix', '', '| Scenario | Profile | Expected failure | Detected | Issue codes | Runtime |', '| --- | --- | ---: | ---: | --- | ---: |');

  for (const run of runs) {
    lines.push(`| ${run.scenario} | ${run.profile} | ${run.expectedFailure} | ${run.detected} | ${run.issueCodes.map((code) => `\`${code}\``).join(', ') || 'none'} | ${run.durationMs} ms |`);
  }

  return `${lines.join('\n')}\n`;
}

function percentile(sortedValues, p) {
  if (!sortedValues.length) return 0;
  const index = Math.ceil(p * sortedValues.length) - 1;
  return Math.round(sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))] * 1000) / 1000;
}

function csvCell(value) {
  if (!/[",\n]/.test(value)) return value;
  return `"${value.replaceAll('"', '""')}"`;
}

function parseArgs(argv) {
  const options = {
    profiles: null,
    scenarios: null,
    resultsDir: defaultResultsDir,
    guardPackage: defaultGuardPackage,
    timeoutMs: defaultTimeoutMs
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--profiles') {
      options.profiles = argv[++index].split(',').filter(Boolean);
    } else if (arg === '--scenarios') {
      options.scenarios = argv[++index].split(',').filter(Boolean);
    } else if (arg === '--output-dir') {
      options.resultsDir = path.resolve(root, argv[++index]);
    } else if (arg === '--guard-package') {
      options.guardPackage = argv[++index];
    } else if (arg === '--timeout') {
      options.timeoutMs = Number.parseInt(argv[++index], 10);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await runEvaluation(parseArgs(process.argv.slice(2)));
  console.log(`Wrote ${path.relative(root, result.files.rawResults)}`);
  console.log(`Wrote ${path.relative(root, result.files.detectionMatrix)}`);
  console.log(`Wrote ${path.relative(root, result.files.runtimeOverhead)}`);
  console.log(`Wrote ${path.relative(root, result.files.summary)}`);
  console.log(`Scenarios: ${result.summary.totalScenarios}; runs: ${result.summary.totalRuns}; false positives: ${result.summary.falsePositives}; false negatives: ${result.summary.falseNegatives}`);

  if (result.summary.falsePositives || result.summary.falseNegatives) {
    process.exitCode = 1;
  }
}
