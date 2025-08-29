#!/usr/bin/env node
// Build Marp slides to a static site directory and generate an index.
// - Finds all Markdown files with `marp: true` frontmatter
// - Renders them to HTML via `marp` CLI with `--html --allow-local-files`
// - Outputs to `site/<relative-dir>/index.html`
// - Copies adjacent `images/` directories into the corresponding output dir

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '..');
const outRoot = path.join(repoRoot, 'site');

const IGNORE_DIRS = new Set([
  '.git',
  '.github',
  'node_modules',
  'site',
  '.next',
  'dist',
  'build',
]);

/**
 * Recursively find Markdown files under dir.
 */
function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.DS_')) continue;
    const full = path.join(dir, e.name);
    const rel = path.relative(repoRoot, full);
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      yield* walk(full);
    } else if (e.isFile()) {
      if (e.name.toLowerCase().endsWith('.md')) yield { full, rel };
    }
  }
}

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function hasMarpFrontmatter(text) {
  // Look for YAML frontmatter containing `marp: true`.
  // Safe heuristic: only search within the first ~2000 chars.
  const head = text.slice(0, 2000);
  const m = head.match(/^---[\s\S]*?^---/m);
  if (!m) return false;
  return /\bmarp\s*:\s*true\b/i.test(m[0]);
}

function extractTitle(text) {
  // Strip frontmatter
  const stripped = text.replace(/^---[\s\S]*?^---\s*/m, '');
  const m = stripped.match(/^#\s+(.+)$/m);
  if (m) return m[1].trim();
  return null;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyIfExists(src, dest) {
  if (fs.existsSync(src) && fs.statSync(src).isDirectory()) {
    ensureDir(dest);
    fs.cpSync(src, dest, { recursive: true });
  }
}

function renderWithMarp(inputFile, outputFile) {
  const args = [
    inputFile,
    '--html',
    '--allow-local-files',
    '--output',
    outputFile,
  ];
  const res = spawnSync('marp', args, { stdio: 'inherit' });
  if (res.error || res.status !== 0) {
    throw new Error(
      `Marp failed for ${inputFile}: ${res.error ? res.error.message : res.status}`,
    );
  }
}

function writeIndex(slides) {
  // Sort by path for stable order
  slides.sort((a, b) => a.rel.localeCompare(b.rel));

  const items = slides
    .map(
      (s) =>
        `<li><a href="${s.relDir}/">${escapeHtml(s.title || s.rel)}</a><span class="path"> ${s.relDir}/</span></li>`,
    )
    .join('\n');

  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Slides</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 2rem; }
    h1 { font-size: 1.6rem; margin-bottom: 1rem; }
    ul { padding-left: 1.2rem; }
    li { margin: 0.4rem 0; }
    a { text-decoration: none; color: #2563eb; }
    a:hover { text-decoration: underline; }
    .path { color: #6b7280; margin-left: 0.4rem; font-size: .9em; }
    footer { margin-top: 2rem; color: #6b7280; font-size: .9em; }
    .note { margin-top: .5rem; color: #6b7280; }
  </style>
  <meta name="robots" content="index,follow" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <link rel="icon" href="data:," />
  <meta name="color-scheme" content="light dark" />
  <meta name="description" content="Published Marp slides" />
  <meta name="generator" content="build-marp.mjs" />
  <meta name="referrer" content="no-referrer" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="x-robots-tag" content="all" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'none'; object-src 'none'; base-uri 'self'; connect-src 'self'; font-src 'self' data:; form-action 'self'; frame-ancestors 'self';" />
  <meta http-equiv="Permissions-Policy" content="interest-cohort=()" />
  <meta http-equiv="Referrer-Policy" content="no-referrer" />
  <meta http-equiv="X-Content-Type-Options" content="nosniff" />
  <meta http-equiv="X-Frame-Options" content="SAMEORIGIN" />
  <meta http-equiv="X-XSS-Protection" content="0" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#ffffff" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Slides" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="application-name" content="Slides" />
</head>
<body>
  <h1>Slides</h1>
  <ul>
  ${items}
  </ul>
  <p class="note">Add a new Marp slide by placing a Markdown file with <code>marp: true</code> in its frontmatter anywhere in the repo. It will be published at the same relative path.</p>
  <footer>Generated by build-marp.mjs</footer>
</body>
</html>`;

  ensureDir(outRoot);
  fs.writeFileSync(path.join(outRoot, 'index.html'), html, 'utf8');
}

function escapeHtml(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function main() {
  const slides = [];

  for (const { full, rel } of walk(repoRoot)) {
    const md = readText(full);
    if (!hasMarpFrontmatter(md)) continue;

    const relDir = path.dirname(rel); // relative source dir
    const srcDir = path.dirname(full);
    const outDir = path.join(outRoot, relDir);
    const outHtml = path.join(outDir, 'index.html');

    ensureDir(outDir);

    // Render HTML slide
    console.log(`Rendering ${rel} -> ${path.relative(repoRoot, outHtml)}`);
    renderWithMarp(full, outHtml);

    // Copy common asset directories if present
    copyIfExists(path.join(srcDir, 'images'), path.join(outDir, 'images'));
    copyIfExists(path.join(srcDir, 'assets'), path.join(outDir, 'assets'));

    const title = extractTitle(md) || path.basename(relDir) || rel;
    slides.push({ rel, relDir, title });
  }

  if (slides.length === 0) {
    console.warn('No Marp slides found (files with `marp: true` frontmatter).');
  }

  writeIndex(slides);

  // Also write a simple 404 to help Pages routing
  const notFound = '<!doctype html><meta charset="utf-8"/><title>404</title><p>Not found';
  fs.writeFileSync(path.join(outRoot, '404.html'), notFound, 'utf8');
}

main();
