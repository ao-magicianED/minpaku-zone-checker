import { promises as fs } from 'node:fs';
import path from 'node:path';

const NO_WRITE = process.argv.includes('--no-write');
const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, 'src', 'lib', 'municipality-data.ts');
const REVIEW_MEMO_PREFIX = 'REVIEW_MEMO_';
const REVIEW_MEMO_SUFFIX = '.md';

function nowIso() {
  return new Date().toISOString();
}

function currentDate() {
  return nowIso().slice(0, 10);
}

function extractMunicipalityUrls(content) {
  const entries = [];
  const objectRegex =
    /{\s*prefecture:\s*'([^']+)'\s*,[\s\S]*?city:\s*'([^']+)'\s*,[\s\S]*?guidelineUrl:\s*'([^']+)'/g;

  let match;
  while ((match = objectRegex.exec(content)) !== null) {
    entries.push({
      prefecture: match[1],
      city: match[2],
      url: match[3],
    });
  }
  return entries;
}

async function checkUrl(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });
    if (response.body) {
      response.body.cancel().catch(() => {});
    }

    if (response.status >= 400) {
      return `HTTP ${response.status}`;
    }
    return null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return 'Timeout';
    }
    return error instanceof Error ? error.message : 'Unknown error';
  } finally {
    clearTimeout(timeoutId);
  }
}

async function findOrCreateReviewMemo() {
  const files = await fs.readdir(ROOT);
  const candidates = files
    .filter((name) => name.startsWith(REVIEW_MEMO_PREFIX) && name.endsWith(REVIEW_MEMO_SUFFIX))
    .sort()
    .reverse();

  if (candidates.length > 0) {
    return path.join(ROOT, candidates[0]);
  }

  const newMemoPath = path.join(ROOT, `${REVIEW_MEMO_PREFIX}${currentDate()}${REVIEW_MEMO_SUFFIX}`);
  await fs.writeFile(newMemoPath, '# レビューメモ\n', 'utf8');
  return newMemoPath;
}

async function appendFailuresToMemo(failures) {
  const memoPath = await findOrCreateReviewMemo();
  const lines = [
    '',
    `## URL健全性チェック (${nowIso()})`,
    ...failures.map(
      (f) => `- ❌ ${f.prefecture} ${f.city}: ${f.url} (${f.reason})`
    ),
  ];
  await fs.appendFile(memoPath, `${lines.join('\n')}\n`, 'utf8');
  return memoPath;
}

async function main() {
  const content = await fs.readFile(DATA_FILE, 'utf8');
  const targets = extractMunicipalityUrls(content);

  if (targets.length === 0) {
    console.log('No municipality guideline URLs found.');
    return;
  }

  const failures = [];
  for (const item of targets) {
    const reason = await checkUrl(item.url);
    if (reason) {
      failures.push({ ...item, reason });
    }
  }

  if (failures.length === 0) {
    console.log(`All municipality guideline URLs are reachable (${targets.length}/${targets.length}).`);
    return;
  }

  console.error(`URL check failed: ${failures.length}/${targets.length}`);
  failures.forEach((f) => {
    console.error(`- ${f.prefecture} ${f.city}: ${f.url} (${f.reason})`);
  });

  if (!NO_WRITE) {
    const memoPath = await appendFailuresToMemo(failures);
    console.error(`Failures were appended to ${path.basename(memoPath)}.`);
  }

  process.exitCode = 1;
}

main().catch((error) => {
  console.error('URL check script failed:', error);
  process.exitCode = 1;
});
