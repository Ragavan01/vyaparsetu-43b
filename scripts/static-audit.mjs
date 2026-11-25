import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_DIRS = ['app', 'components', 'lib'];
const MAX_LINES = 280;

const FORBIDDEN_PATTERNS = [
  {name: 'dangerouslySetInnerHTML', regex: /dangerouslySetInnerHTML/},
  {name: 'eval()', regex: /\beval\s*\(/},
  {name: 'new Function', regex: /\bnew\s+Function\s*\(/},
  {name: 'hardcoded Google API key', regex: /AIza[0-9A-Za-z_-]{30,}/},
  {name: 'deprecated Gemini model', regex: /gemini-(1\.5|2\.0|pro\b)/i},
];

function walk(dir) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  const entries = fs.readdirSync(full, {withFileTypes: true});
  const files = [];
  for (const entry of entries) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(rel));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(rel);
    }
  }
  return files;
}

const failures = [];
const allFiles = SOURCE_DIRS.flatMap(walk);

for (const rel of allFiles) {
  const content = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const lines = content.split('\n');
  if (lines.length > MAX_LINES) {
    failures.push(`${rel}: ${lines.length} lines exceeds max ${MAX_LINES}`);
  }
  for (const rule of FORBIDDEN_PATTERNS) {
    if (rule.regex.test(content)) {
      failures.push(`${rel}: forbidden pattern detected (${rule.name})`);
    }
  }
  const isClient = content.includes("'use client'") || content.includes('"use client"');
  if (isClient && content.includes('@google/genai')) {
    failures.push(`${rel}: @google/genai must not be imported in client components`);
  }
}

const nextConfig = fs.readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8');
for (const header of [
  'Content-Security-Policy',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Permissions-Policy',
]) {
  if (!nextConfig.includes(header)) {
    failures.push(`next.config.ts: missing hardened security header ${header}`);
  }
}

const tokensCss = fs.readFileSync(path.join(ROOT, 'styles/tokens.css'), 'utf8');
if (!tokensCss.includes('prefers-reduced-motion')) {
  failures.push('styles/tokens.css: missing prefers-reduced-motion media query');
}

const shellCode = fs.readFileSync(
  path.join(ROOT, 'components/VyaparSetuShell.tsx'),
  'utf8',
);
if (!shellCode.includes('aria-live="polite"') || !shellCode.includes('<main')) {
  failures.push('components/VyaparSetuShell.tsx: missing aria-live or <main> landmark');
}

if (failures.length > 0) {
  console.error('Static audit failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}

console.log(
  `Static audit passed (${allFiles.length} TypeScript modules checked: <=${MAX_LINES} lines, zero forbidden sinks, security headers & WCAG hooks verified).`,
);
