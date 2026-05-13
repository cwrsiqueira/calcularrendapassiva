const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// Private/build files — never copied to dist
const EXCLUDED = new Set([
  'CLAUDE.md',
  'docs',
  '.claude',
  '.vercel',
  '.git',
  'node_modules',
  'premium.html',
  'logo.png',
  'logo2.png',
  'favicon2.ico',
  'scripts',
  'package.json',
  'package-lock.json',
  '.gitignore',
  '.vercelignore',
  '.env.local',
  '.env',
  '.env.production',
  '.env.development',
  'dist',
  'api',         // Vercel Functions — deployed from project root, not from dist
  'vercel.json', // Vercel config — read from project root, not dist
]);

const HTML_OPTS = {
  collapseWhitespace: true,
  removeComments: true,
  minifyCSS: true,
  minifyJS: false, // JS inside HTML minified by terser separately
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function isAlreadyMinified(filename) {
  return filename.endsWith('.min.js') || filename.endsWith('.min.css');
}

async function processFile(src, dest) {
  ensureDir(path.dirname(dest));
  const ext = path.extname(src).toLowerCase();
  const basename = path.basename(src);

  if (ext === '.html') {
    const { minify } = require('html-minifier-terser');
    const raw = fs.readFileSync(src, 'utf8');
    const result = await minify(raw, HTML_OPTS);
    fs.writeFileSync(dest, result, 'utf8');

  } else if (ext === '.js' && !isAlreadyMinified(basename)) {
    const { minify } = require('terser');
    const raw = fs.readFileSync(src, 'utf8');
    try {
      const result = await minify(raw, { compress: true, mangle: true });
      fs.writeFileSync(dest, result.code, 'utf8');
    } catch {
      fs.copyFileSync(src, dest);
    }

  } else if (ext === '.css' && !isAlreadyMinified(basename)) {
    const CleanCSS = require('clean-css');
    const raw = fs.readFileSync(src, 'utf8');
    const result = new CleanCSS({ level: 2 }).minify(raw);
    fs.writeFileSync(dest, result.styles, 'utf8');

  } else {
    fs.copyFileSync(src, dest);
  }
}

async function walk(srcDir, destDir) {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDED.has(entry.name)) continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await walk(srcPath, destPath);
    } else {
      await processFile(srcPath, destPath);
      process.stdout.write(`  ✓ ${path.relative(ROOT, srcPath)}\n`);
    }
  }
}

async function main() {
  console.log('Building dist/ ...\n');
  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
  fs.mkdirSync(DIST, { recursive: true });
  await walk(ROOT, DIST);
  console.log('\nBuild complete.');
}

main().catch(err => { console.error(err); process.exit(1); });
