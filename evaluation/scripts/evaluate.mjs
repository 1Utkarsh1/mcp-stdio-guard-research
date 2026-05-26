import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const guardPackage = process.env.MCP_STDIO_GUARD_VERSION || 'mcp-stdio-guard@1.0.0';
const timeoutMs = Number.parseInt(process.env.MCP_STDIO_GUARD_TIMEOUT_MS || '1500', 10);
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const resultDir = path.join(root, 'evaluation', 'results', runId);

const fixtures = [
  {
    name: 'clean-server',
    command: [process.execPath, path.join(root, 'evaluation', 'fixtures', 'clean-server.mjs')],
    expectOk: true
  },
  {
    name: 'stdout-pollution-server',
    command: [process.execPath, path.join(root, 'evaluation', 'fixtures', 'stdout-pollution-server.mjs')],
    expectOk: false
  },
  {
    name: 'invalid-json-rpc-server',
    command: [process.execPath, path.join(root, 'evaluation', 'fixtures', 'invalid-json-rpc-server.mjs')],
    expectOk: false
  },
  {
    name: 'tools-list-hang-server',
    command: [process.execPath, path.join(root, 'evaluation', 'fixtures', 'tools-list-hang-server.mjs')],
    expectOk: false
  }
];

await fs.mkdir(resultDir, { recursive: true });

const manifest = {
  generatedAt: new Date().toISOString(),
  guardPackage,
  timeoutMs,
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  fixtures: []
};

for (const fixture of fixtures) {
  const guardArgs = [
    '--yes',
    guardPackage,
    '--json',
    '--timeout',
    String(timeoutMs),
    '--request',
    'tools/list',
    '--',
    ...fixture.command
  ];

  const run = await runCommand('npx', guardArgs);
  const outputPath = path.join(resultDir, `${fixture.name}.json`);
  const stderrPath = path.join(resultDir, `${fixture.name}.stderr.log`);

  let parsed = null;
  try {
    parsed = JSON.parse(run.stdout);
  } catch (error) {
    parsed = {
      parseError: error.message,
      rawStdout: run.stdout
    };
  }

  await fs.writeFile(outputPath, `${JSON.stringify(parsed, null, 2)}\n`);
  await fs.writeFile(stderrPath, run.stderr);

  manifest.fixtures.push({
    name: fixture.name,
    command: fixture.command,
    expectedOk: fixture.expectOk,
    exitCode: run.exitCode,
    signal: run.signal,
    resultFile: path.relative(root, outputPath),
    stderrFile: path.relative(root, stderrPath),
    observedOk: typeof parsed.ok === 'boolean' ? parsed.ok : null,
    issueCodes: Array.isArray(parsed.issues) ? parsed.issues.map((issue) => issue.code) : []
  });
}

await fs.writeFile(path.join(resultDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const mismatches = manifest.fixtures.filter((fixture) => fixture.observedOk !== fixture.expectedOk);
console.log(`Wrote evaluation results to ${path.relative(root, resultDir)}`);
console.log(`Fixtures: ${manifest.fixtures.length}; expectation mismatches: ${mismatches.length}`);

if (mismatches.length) {
  for (const fixture of mismatches) {
    console.error(`${fixture.name}: expected ok=${fixture.expectedOk}, observed ok=${fixture.observedOk}`);
  }
  process.exitCode = 1;
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env
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
