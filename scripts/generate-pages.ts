import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import glob from 'glob';
import { buildDirectory } from './build-directory';
import { renderPagesDTS } from './render-dts';
import { renderPagesJSBrowser, renderPagesJSNode } from './render-js';
import { renderPackageJson } from './render-package';

// Captures the root directory
const ROOT_DIR = path.resolve(__dirname, '..');

// Match any JS files in the pages directory (except for _app, _document, or the error pages)
const PAGES_GLOB = `**/!(_app|_document|404|500).@(js|jsx|ts|tsx)`;

type GeneratePagesCallback = (pages: string[]) => void;

/**
 * Watches the pages directory for any changes and generates the pages
 * whenever files are added or removed.
 *
 * @param cwd the pages directory to work within
 * @param generatePages the generate callback
 */
function watch(cwd: string, generatePages: GeneratePagesCallback) {
  console.info(`Watching for changes...`);
  const watcher = chokidar.watch(PAGES_GLOB, { cwd });

  let pagesTimeout: ReturnType<typeof setTimeout> | null = null;
  watcher.on('all', () => {
    // Clear the timeout
    if (pagesTimeout) {
      clearTimeout(pagesTimeout);
    }
    // And reset it for a 200ms debounce
    pagesTimeout = setTimeout(() => {
      // Generate the list of pages being watched
      const pages: string[] = [];
      Object.entries(watcher.getWatched()).map(([dir, files]) => {
        if (dir === '.') {
          pages.push(...files);
        } else {
          pages.push(...files.map(file => `${dir}/${file}`));
        }
      });
      // Then callback
      generatePages(pages);
    }, 200);
  });
}

/**
 * Fetches all pages within the directory and generates the pages only once.
 *
 * @param cwd the pages directory to work within
 * @param generatePages the generate callback
 */
function once(cwd: string, generatePages: GeneratePagesCallback) {
  const pages = glob.sync(PAGES_GLOB, { cwd });
  generatePages(pages);
}

function main() {
  // Find the pages directory (either in root directory, or in `src` directory)
  let pagesDir = path.resolve(ROOT_DIR, 'pages');
  if (!fs.existsSync(pagesDir)) {
    pagesDir = path.resolve(ROOT_DIR, 'src', 'pages');
    if (!fs.existsSync(pagesDir)) {
      throw new Error('`pages` directory not found.');
    }
  }

  // Create the build directory, if it doesn't exist
  const buildDir = path.resolve(ROOT_DIR, 'node_modules', 'next-pages-gen');
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  // Determine whether script should be run once or in watch mode
  const cliArgs = process.argv.slice(2);
  const shouldWatch = cliArgs[0] === '--watch';
  const modeFn = shouldWatch ? watch : once;

  // Then generate the pages directory based on the mode
  modeFn(pagesDir, pages => {
    console.info('Building pages...');
    // Build the pages directory structure
    const directory = buildDirectory(pages);
    // Render and write the package.json to file
    const packageJsonContent = renderPackageJson();
    fs.writeFileSync(path.resolve(buildDir, 'package.json'), packageJsonContent);
    // Render and write the JS browser content to file
    const jsBrowserContent = renderPagesJSBrowser(directory);
    fs.writeFileSync(path.resolve(buildDir, 'index-browser.js'), jsBrowserContent);
    // Render and write the JS browser content to file
    const jsNodeContent = renderPagesJSNode(directory);
    fs.writeFileSync(path.resolve(buildDir, 'index.js'), jsNodeContent);
    // Render and write the D.TS content to file
    const dtsContent = renderPagesDTS(directory);
    fs.writeFileSync(path.resolve(buildDir, 'index.d.ts'), dtsContent);
    console.info('Built new page types to next-pages-gen!');
  });
}

main();
