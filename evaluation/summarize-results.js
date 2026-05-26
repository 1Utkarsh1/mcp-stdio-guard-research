import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultRawResultsPath = path.join(root, 'evaluation', 'results', 'raw-results.json');
const rawResultsPath = path.resolve(root, process.argv[2] ?? defaultRawResultsPath);
const rawResults = JSON.parse(await fs.readFile(rawResultsPath, 'utf8'));

console.log(JSON.stringify({
  generatedAt: rawResults.generatedAt,
  guardPackage: rawResults.guardPackage,
  ...rawResults.summary
}, null, 2));
