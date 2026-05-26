import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const requiredFiles = [
  'paper/main.tex',
  'paper/references.bib',
  'artifact/README.md',
  'artifact/reproducibility.md',
  'artifact/environment.md'
];

for (const file of requiredFiles) {
  await fs.access(path.join(root, file));
}

const mainTex = await fs.readFile(path.join(root, 'paper', 'main.tex'), 'utf8');
const references = await fs.readFile(path.join(root, 'paper', 'references.bib'), 'utf8');
const paperDir = await fs.readdir(path.join(root, 'paper'));

if (!mainTex.includes('\\bibliography{references}')) {
  throw new Error('paper/main.tex must reference paper/references.bib');
}

if (!references.includes('mcpstdioguard')) {
  throw new Error('paper/references.bib must include the production tool reference');
}

const committedPdfCandidates = paperDir.filter((entry) => entry.endsWith('.pdf'));
if (committedPdfCandidates.length) {
  throw new Error(`Do not commit generated PDFs: ${committedPdfCandidates.join(', ')}`);
}

console.log('Paper artifact checks passed.');
