const fs = require('fs/promises');
const path = require('path');
const { execFileSync } = require('child_process');
const terser = require('terser');

const ROOT = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(ROOT, 'build');
const DIST_DIR = path.join(BUILD_DIR, 'extension');
const ZIP_NAME = 'job-match-resume-preprod.zip';
const ZIP_PATH = path.join(BUILD_DIR, ZIP_NAME);

const EXCLUDE_NAMES = new Set(['node_modules', 'build', '.git', 'scripts', 'package.json', 'package-lock.json', 'yarn.lock']);
const JS_EXTENSIONS = new Set(['.js']);

async function deleteFolder(folderPath) {
  try {
    await fs.rm(folderPath, { recursive: true, force: true });
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

async function ensureDirectory(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyDirectory(source, target) {
  await ensureDirectory(target);
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    if (EXCLUDE_NAMES.has(entry.name)) continue;

    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
      continue;
    }

    if (entry.isFile()) {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

async function stripConsoleStatements(filePath) {
  const source = await fs.readFile(filePath, 'utf8');
  const result = await terser.minify(source, {
    compress: {
      drop_console: true,
      drop_debugger: true,
    },
    mangle: false,
    format: {
      beautify: true,
      comments: false,
    },
  });

  if (result.error) {
    throw result.error;
  }

  await fs.writeFile(filePath, result.code, 'utf8');
}

async function processJavaScriptFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await processJavaScriptFiles(fullPath);
      continue;
    }

    if (entry.isFile() && JS_EXTENSIONS.has(path.extname(entry.name))) {
      await stripConsoleStatements(fullPath);
    }
  }
}

function createZipArchive(sourceDir, zipFilePath) {
  try {
    execFileSync('zip', ['-r', '--quiet', zipFilePath, '.'], {
      cwd: sourceDir,
      stdio: 'inherit',
    });
  } catch (err) {
    throw new Error('Failed to create ZIP archive. Make sure the zip tool is installed. ' + err.message);
  }
}

async function build() {
  console.log('Cleaning previous build...');
  await deleteFolder(BUILD_DIR);
  await ensureDirectory(DIST_DIR);

  console.log('Copying extension files...');
  await copyDirectory(ROOT, DIST_DIR);

  console.log('Stripping console statements from JavaScript...');
  await processJavaScriptFiles(DIST_DIR);

  console.log('Creating production ZIP...');
  await ensureDirectory(BUILD_DIR);
  createZipArchive(DIST_DIR, ZIP_PATH);

  console.log(`Production build completed: ${ZIP_PATH}`);
}

build().catch((err) => {
  console.error('Preproduction build failed:', err);
  process.exit(1);
});
