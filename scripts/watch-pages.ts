import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { buildDirectory } from './build-directory';
import { renderPagesDTS } from './render-dts';
import { renderPagesJSBrowser, renderPagesJSNode } from './render-js';
import { renderPackageJson } from './render-package';

const rootDir = path.resolve(__dirname, '..');
const buildDir = path.resolve(rootDir, 'node_modules', '@next', 'pages');

function main() {
  // Find the pages directory
  let pagesDir = path.resolve(rootDir, 'pages');
  if (!fs.existsSync(pagesDir)) {
    pagesDir = path.resolve(rootDir, 'src', 'pages');
    if (!fs.existsSync(pagesDir)) {
      throw new Error('`pages` directory not found.');
    }
  }

  // Create the build directory, if it doesn't exist
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  // Render and write the package.json to file
  const dtsContent = renderPackageJson();
  fs.writeFileSync(path.resolve(buildDir, 'package.json'), dtsContent);

  // Watch all of the ts/tsx/js/jsx files in the pages directory
  const watcher = chokidar.watch(`${pagesDir}/**/!(_app|_document|404|500).(ts|tsx|js|jsx)`, {
    cwd: pagesDir,
  });

  const pagesSet = new Set<string>();
  watcher.on('all', (evt, pagePath) => {
    // Update pages set on watcher events
    if (evt === 'add') {
      pagesSet.add(pagePath);
    } else if (evt === 'unlink') {
      pagesSet.delete(pagePath);
    }

    // Then rebuild the directory structure
    const directory = buildDirectory(Array.from(pagesSet));
    // Render and write the JS browser content to file
    const jsBrowserContent = renderPagesJSBrowser(directory);
    fs.writeFileSync(path.resolve(buildDir, 'index-browser.js'), jsBrowserContent);
    // Render and write the JS browser content to file
    const jsNodeContent = renderPagesJSNode(directory);
    fs.writeFileSync(path.resolve(buildDir, 'index.js'), jsNodeContent);
    // Render and write the D.TS content to file
    const dtsContent = renderPagesDTS(directory);
    fs.writeFileSync(path.resolve(buildDir, 'index.d.ts'), dtsContent);
  });
}

main();
