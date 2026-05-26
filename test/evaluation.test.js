import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('evaluation runner writes machine-readable outputs from actual guard runs', async () => {
  const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mcp-stdio-guard-eval-test-'));
  const result = await runNode([
    'evaluation/run-evaluation.js',
    '--profiles',
    'smoke',
    '--scenarios',
    'clean-server,startup-stdout-pollution-server',
    '--output-dir',
    outputDir,
    '--timeout',
    '1200'
  ]);

  assert.equal(result.exitCode, 0, result.stderr || result.stdout);

  const rawResults = JSON.parse(await fs.readFile(path.join(outputDir, 'raw-results.json'), 'utf8'));
  const detectionMatrix = await fs.readFile(path.join(outputDir, 'detection-matrix.csv'), 'utf8');
  const runtimeOverhead = await fs.readFile(path.join(outputDir, 'runtime-overhead.csv'), 'utf8');
  const summary = await fs.readFile(path.join(outputDir, 'summary.md'), 'utf8');

  assert.equal(rawResults.summary.totalScenarios, 2);
  assert.equal(rawResults.summary.totalRuns, 2);
  assert.equal(rawResults.summary.falsePositives, 0);
  assert.equal(rawResults.summary.falseNegatives, 0);
  assert.match(detectionMatrix, /startup-stdout-pollution-server/);
  assert.match(runtimeOverhead, /duration_ms/);
  assert.match(summary, /Evaluation Summary/);
});

function runNode(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        MCP_STDIO_GUARD_VERSION: process.env.MCP_STDIO_GUARD_VERSION || 'mcp-stdio-guard@1.0.0'
      }
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
    child.on('close', (exitCode) => {
      resolve({ exitCode, stdout, stderr });
    });
  });
}
