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

function sanitizeAndResolveAsset(srcDir, relPath) {
  // strip query/hash
  const cleaned = relPath.split('#')[0].split('?')[0];
  const resolved = path.resolve(srcDir, cleaned);
  // prevent path traversal out of repo
  if (!resolved.startsWith(repoRoot)) return null;
  return { resolved, cleaned };
}

function extractLocalImageRefs(md) {
  const refs = new Set();
  // Markdown image: ![alt](path "title")
  const mdImg = /!\[[^\]]*\]\(([^)]+)\)/g;
  let m;
  while ((m = mdImg.exec(md))) {
    const inside = m[1].trim();
    const p = inside.replace(/\s+"[^"]*"$/, ''); // drop optional title
    refs.add(p);
  }
  // HTML <img src="...">
  const htmlImg = /<img[^>]+src=["']([^"']+)["']/gi;
  while ((m = htmlImg.exec(md))) refs.add(m[1]);

  // Filter to local relative resources
  return [...refs].filter((p) => {
    if (!p) return false;
    const lower = p.toLowerCase();
    if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('data:')) return false;
    if (p.startsWith('mailto:') || p.startsWith('#')) return false;
    if (p.startsWith('/')) return false; // absolute from domain root - not supported here
    return true;
  });
}

function copyAssetFile(srcDir, outDir, relAssetPath) {
  const info = sanitizeAndResolveAsset(srcDir, relAssetPath);
  if (!info) return false;
  const { resolved, cleaned } = info;
  if (!fs.existsSync(resolved)) return false;
  const relFromSrc = path.relative(srcDir, resolved);
  const destPath = path.join(outDir, relFromSrc);
  ensureDir(path.dirname(destPath));
  const stat = fs.statSync(resolved);
  if (stat.isDirectory()) {
    fs.cpSync(resolved, destPath, { recursive: true });
  } else {
    fs.copyFileSync(resolved, destPath);
  }
  return true;
}

function resolveMarpBin() {
  const binName = process.platform === 'win32' ? 'marp.cmd' : 'marp'
  const local = path.join(repoRoot, 'node_modules', '.bin', binName)
  return fs.existsSync(local) ? local : 'marp'
}

function getGitCreatedDate(filePath) {
  // Get the date of the first commit that added this file
  const res = spawnSync('git', [
    'log',
    '--format=%aI',
    '--diff-filter=A',
    '--follow',
    '--',
    filePath,
  ], { cwd: repoRoot, encoding: 'utf8' });

  if (res.error || res.status !== 0 || !res.stdout.trim()) {
    return null;
  }

  // Take the last line (oldest commit date for this file)
  const lines = res.stdout.trim().split('\n');
  const isoDate = lines[lines.length - 1];

  // Parse and format as YYYY-MM-DD
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return null;

  return date.toISOString().split('T')[0];
}

function renderWithMarp(inputFile, outputFile) {
  const args = [
    inputFile,
    '--html',
    '--allow-local-files',
    '--output',
    outputFile,
  ];
  const marpCmd = resolveMarpBin();
  const res = spawnSync(marpCmd, args, { stdio: 'inherit' });
  if (res.error || res.status !== 0) {
    throw new Error(
      `Marp failed for ${inputFile}: ${res.error ? res.error.message : res.status}`,
    );
  }
}

function renderOgpImage(inputFile, outputFile) {
  const args = [
    inputFile,
    '--image', 'png',
    '--allow-local-files',
    '--output',
    outputFile,
  ];
  const marpCmd = resolveMarpBin();
  const res = spawnSync(marpCmd, args, { stdio: 'inherit' });
  if (res.error || res.status !== 0) {
    throw new Error(
      `Marp OGP image failed for ${inputFile}: ${res.error ? res.error.message : res.status}`,
    );
  }
}

const SITE_BASE_URL = 'https://daikw.github.io/slides';

function injectOgpMeta(htmlFile, title, ogpImageUrl, pageUrl) {
  let html = fs.readFileSync(htmlFile, 'utf8');

  const ogpTags = `
  <!-- OGP meta tags -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:image" content="${ogpImageUrl}" />
  <meta property="og:url" content="${pageUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:image" content="${ogpImageUrl}" />`;

  // Insert OGP tags before </head>
  html = html.replace('</head>', `${ogpTags}\n</head>`);

  fs.writeFileSync(htmlFile, html, 'utf8');
}

function injectCreatedDate(htmlFile, createdDate) {
  if (!createdDate) return;

  let html = fs.readFileSync(htmlFile, 'utf8');

  // CSS to display created date only on the title slide (first slide)
  const dateStyle = `
  <style>
    /* Created date footer - displayed only on title slide */
    section[id="1"]::before {
      content: "Created: ${createdDate}";
      position: absolute;
      left: 30px;
      bottom: 21px;
      font-size: 12px;
      color: rgba(128, 128, 128, 0.8);
    }
  </style>`;

  // Insert style before </head>
  html = html.replace('</head>', `${dateStyle}\n</head>`);

  fs.writeFileSync(htmlFile, html, 'utf8');
}

function writeIndex(slides) {
  // Sort by path for stable order
  slides.sort((a, b) => a.rel.localeCompare(b.rel));

  const items = slides
    .map((s) => {
      const link = s.outRelDir ? `${s.outRelDir}/` : './';
      const label = s.outRelDir || s.rel;
      const dateStr = s.createdDate ? `<span class="date">${s.createdDate}</span>` : '';
      return `<li>${dateStr}<a href="${link}">${escapeHtml(s.title || label)}</a><span class="path"> ${link}</span></li>`;
    })
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
    .date { color: #9ca3af; margin-right: 0.6rem; font-size: .85em; font-family: monospace; }
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
    const outRelDir = relDir === 'src' ? '' : relDir.startsWith(`src${path.sep}`) ? relDir.slice(4) : relDir;
    const srcDir = path.dirname(full);
    const outDir = path.join(outRoot, outRelDir);
    const outHtml = path.join(outDir, 'index.html');

    ensureDir(outDir);

    // Render OGP image (title slide as PNG)
    const outOgp = path.join(outDir, 'ogp.png');
    console.log(`Rendering OGP image ${rel} -> ${path.relative(repoRoot, outOgp)}`);
    renderOgpImage(full, outOgp);

    // Render HTML slide
    console.log(`Rendering ${rel} -> ${path.relative(repoRoot, outHtml)}`);
    renderWithMarp(full, outHtml);

    // Inject OGP meta tags into generated HTML
    const title = extractTitle(md) || path.basename(outRelDir || relDir) || rel;
    const pageUrl = outRelDir ? `${SITE_BASE_URL}/${outRelDir}/` : `${SITE_BASE_URL}/`;
    const ogpImageUrl = outRelDir ? `${SITE_BASE_URL}/${outRelDir}/ogp.png` : `${SITE_BASE_URL}/ogp.png`;
    injectOgpMeta(outHtml, title, ogpImageUrl, pageUrl);

    // Inject created date from git history
    const createdDate = getGitCreatedDate(full);
    if (createdDate) {
      console.log(`  Created date: ${createdDate}`);
      injectCreatedDate(outHtml, createdDate);
    }

    // Copy common asset directories if present
    copyIfExists(path.join(srcDir, 'images'), path.join(outDir, 'images'));
    copyIfExists(path.join(srcDir, 'assets'), path.join(outDir, 'assets'));
    copyIfExists(path.join(srcDir, 'files'), path.join(outDir, 'files'));

    // Copy image assets referenced in Markdown (best-effort)
    const refs = extractLocalImageRefs(md);
    for (const ref of refs) {
      try {
        copyAssetFile(srcDir, outDir, ref);
      } catch (e) {
        console.warn(`Warn: Failed to copy asset '${ref}' for ${rel}: ${e.message}`);
      }
    }

    slides.push({ rel, relDir, outRelDir, title, createdDate });
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
