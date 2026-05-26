import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const resultsRoot = path.join(root, 'evaluation', 'results');
const requestedRun = process.argv[2];
const runDir = requestedRun
  ? path.resolve(root, requestedRun)
  : await latestRunDir(resultsRoot);

if (!runDir) {
  console.error('No evaluation run found. Run `npm run evaluate` first.');
  process.exit(1);
}

const manifestPath = path.join(runDir, 'manifest.json');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const summary = {
  run: path.relative(root, runDir),
  generatedAt: manifest.generatedAt,
  guardPackage: manifest.guardPackage,
  fixtureCount: manifest.fixtures.length,
  passedExpectations: manifest.fixtures.filter((fixture) => fixture.observedOk === fixture.expectedOk).length,
  failedExpectations: manifest.fixtures.filter((fixture) => fixture.observedOk !== fixture.expectedOk).length,
  observed: manifest.fixtures.map((fixture) => ({
    name: fixture.name,
    expectedOk: fixture.expectedOk,
    observedOk: fixture.observedOk,
    issueCodes: fixture.issueCodes
  }))
};

console.log(JSON.stringify(summary, null, 2));

async function latestRunDir(resultsDir) {
  let entries;
  try {
    entries = await fs.readdir(resultsDir, { withFileTypes: true });
  } catch {
    return null;
  }

  const directories = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(resultsDir, entry.name))
    .sort();

  return directories.at(-1) ?? null;
}
