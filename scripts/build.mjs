// Renders the static site from data/projects.json.
// Usage: npm run build            (stamps today's date)
//        SITE_DATE=2026-01-31 npm run build
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, loadData, renderAll, todayIso } from './render.mjs';
import { validateData } from './validate.mjs';

const data = loadData();
const errors = validateData(data);
if (errors.length) {
  console.error(`data/projects.json has ${errors.length} problem(s):\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}

const date = process.env.SITE_DATE || todayIso();
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error(`SITE_DATE must be YYYY-MM-DD (got "${date}")`);
  process.exit(1);
}

for (const [file, content] of Object.entries(renderAll(data, date))) {
  writeFileSync(join(ROOT, file), content);
  console.log(`wrote ${file}`);
}
console.log(`built ${data.projects.length} projects (last updated ${date})`);
