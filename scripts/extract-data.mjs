/**
 * Extracts static data from ops.html into frontend/src/data/
 * Run: node scripts/extract-data.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(root, '_extracted_script.js'), 'utf8');
const lines = script.split('\n');

const outDir = path.join(root, 'frontend', 'src', 'data');
fs.mkdirSync(outDir, { recursive: true });

const phasesStart = lines.findIndex((l) => l.startsWith('const PHASES='));
const docsLine = lines.findIndex((l) => l.startsWith('const DOCS='));
const templatesLine = lines.findIndex((l) => l.startsWith('const TEMPLATES='));

const phasesBlock = lines.slice(phasesStart, docsLine).join('\n');
const docsBlock = lines
  .slice(docsLine, templatesLine)
  .filter((l) => l.startsWith('const '))
  .join('\n');

// eslint-disable-next-line no-new-func
const { PHASES, DOCS, MS_TEMPLATES, DOC_TEMPLATES, MS_DOC, DOC_NAME, MS_ROLE } = Function(`
  ${phasesBlock}
  ${docsBlock}
  return { PHASES, DOCS, MS_TEMPLATES, DOC_TEMPLATES, MS_DOC, DOC_NAME, MS_ROLE };
`)();

const templatesExpr = lines[templatesLine]
  .replace(/^const TEMPLATES=/, '')
  .replace(/;\s*$/, '');
// eslint-disable-next-line no-new-func
const TEMPLATES = Function(`return ${templatesExpr}`)();

fs.writeFileSync(
  path.join(outDir, 'phases.ts'),
  `import type { Phase } from '../types';\n\nexport const PHASES: Phase[] = ${JSON.stringify(PHASES, null, 2)};\n`
);

fs.writeFileSync(
  path.join(outDir, 'docs.ts'),
  `import type { DocDefinition } from '../types';\n\nexport const DOCS: DocDefinition[] = ${JSON.stringify(DOCS, null, 2)};\nexport const MS_TEMPLATES = ${JSON.stringify(MS_TEMPLATES, null, 2)} as Record<string, string[]>;\nexport const DOC_TEMPLATES = ${JSON.stringify(DOC_TEMPLATES, null, 2)} as Record<string, string[]>;\nexport const MS_DOC = ${JSON.stringify(MS_DOC, null, 2)} as Record<string, [string, string]>;\nexport const DOC_NAME = ${JSON.stringify(DOC_NAME, null, 2)} as Record<string, string>;\nexport const MS_ROLE = ${JSON.stringify(MS_ROLE, null, 2)} as Record<string, string>;\n`
);

fs.writeFileSync(path.join(outDir, 'templates.json'), JSON.stringify(TEMPLATES));

fs.writeFileSync(
  path.join(outDir, 'templates.ts'),
  `import type { TemplateAsset } from '../types';\nimport raw from './templates.json';\n\nexport const TEMPLATES = raw as Record<string, TemplateAsset>;\n`
);

console.log('Extracted:', {
  phases: PHASES.length,
  milestones: PHASES.reduce((a, p) => a + p.milestones.length, 0),
  docs: DOCS.length,
  templates: Object.keys(TEMPLATES).length,
});
