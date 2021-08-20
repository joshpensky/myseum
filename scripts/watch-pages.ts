import fs from 'fs/promises';
import path from 'path';
import chokidar from 'chokidar';

const rootDir = path.resolve(__dirname, '..');
const pagesDir = path.resolve(rootDir, 'src/pages');

const routesPath = path.resolve(__dirname, 'routes.ts');

interface Parameter {
  name: string;
  type: string;
  children: Record<string, Directory>;
}

interface Directory {
  pathname: string | null;
  parameter: Parameter | null;
  children: Record<string, Directory>;
}

/**
 * Constructs the pathname given a set of nodes.
 *
 * @param pathNodes the nodes to construct the pathname
 * @returns the constructed pathname
 */
const getPathname = (pathNodes: string[]) => {
  // Remove any nodes with `index` (these are implicit)
  const currentPathNodes = pathNodes.filter(node => node !== 'index');
  // Then join with forward slashes
  return `/${currentPathNodes.join('/')}`;
};

/**
 * Builds a directory based on a set of page file paths.
 *
 * @param pages the Next.js page file paths
 * @returns the structured directory
 */
const buildDirectory = (pages: string[]) => {
  // Start with an empty root directory
  const directory: Directory = {
    pathname: null,
    parameter: null,
    children: {},
  };

  // Loop through all page file paths
  for (const page of pages) {
    // Remove the extension from the path
    const pathWithoutExtension = page.replace(/(\.[tj]sx?)$/g, '');
    // And split by forward slashes to get individual nodes
    const pathNodes = pathWithoutExtension.split('/');

    // Define the parent and current working directories
    let pwd = directory;
    let cwd = directory.children;

    // Loop through all nodes within the path
    for (let index = 0; index < pathNodes.length; index++) {
      const node = pathNodes[index];
      const isLastNode = index === pathNodes.length - 1;

      // If the node is a parameter (i.e., surrounded by square brackets [])...
      const isParameter = /^\[.*\]$/.test(node);
      if (isParameter) {
        // Assign the parameter to the parent directory
        // TODO: catch-all routes: https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes (JS Proxy?)
        // TODO: optional catch-all routes: https://nextjs.org/docs/routing/dynamic-routes#optional-catch-all-routes
        pwd.parameter = {
          name: node.replace(/(^\[)|(\]$)/g, ''), // Extract the name from the node
          type: 'string', // Default to type string (TODO: other types)
          children: pwd.parameter?.children ?? {}, // Extend or create the parameter's children
        };
        // Then update the current working directory to the parameter's children
        cwd = pwd.parameter.children;

        // If this is the last node in the path, add an `index` directory
        if (isLastNode) {
          cwd['index'] = {
            pathname: getPathname(pathNodes.slice(0, index + 1)),
            parameter: null,
            children: {},
          };
        }

        // Then continue to the next node
        continue;
      }

      // Get the pathname — if this isn't the last node, use null to signify so
      let pathname: Directory['pathname'] = null;
      if (isLastNode) {
        // If this _is_ the last node, generate the pathname
        pathname = getPathname(pathNodes.slice(0, index + 1));
      }

      // Assign the node as a child of the current directory
      cwd[node] = {
        pathname: cwd[node]?.pathname ?? pathname, // Reuse or create pathname
        parameter: cwd[node]?.parameter ?? null, // Reuse or create parameter
        children: cwd[node]?.children ?? {}, // Reuse or create children
      };

      // Then update the parent directory to the current working directory
      pwd = cwd[node];
      // And the current working directory to the children
      cwd = cwd[node].children;
    }
  }

  // Once all pages have been accounted for, return the directory
  return directory;
};

/**
 * Renders the directory structure type for TypeScript.
 *
 * @param cwd the current working directory to render
 * @param query any query parameters to include in valid path responses
 * @param depth the minimum tab depth to render as a prefix for all lines
 * @returns the directory structure types
 */
const renderDirectoryStructureType = (
  cwd: Directory,
  query: Record<string, string>,
  depth: number,
): string => {
  const { children, parameter, pathname } = cwd;

  const lines: string[] = [];

  // If the directory has a parameter and child paths...
  if (parameter && Object.keys(parameter.children).length) {
    // Render the function definiton with the parameter argument
    lines.push(`(${parameter.name}: ${parameter.type}): {`);

    // Add the parameter to the child directory's query
    const childQuery = {
      ...query,
      [parameter.name]: parameter.type,
    };
    // Then render all child paths under the parameter
    Object.entries(parameter.children).forEach(([childPathNode, childPathDir]) => {
      lines.push(`\t${childPathNode}: {`);
      lines.push(...renderDirectoryStructureType(childPathDir, childQuery, 2).split('\n'));
      lines.push(`\t};`);
    });

    // Then end the function definition
    lines.push(`};`);
  }

  if (Object.keys(children).length) {
    // If the directory has non-parametrized children...
    // Render the empty function definition
    lines.push(`(): {`);
    // Then render all child paths
    Object.entries(children).forEach(([childPathNode, childPathDir]) => {
      lines.push(`\t${childPathNode}: {`);
      lines.push(...renderDirectoryStructureType(childPathDir, query, 2).split('\n'));
      lines.push(`\t};`);
    });
    // Then end the function definition
    lines.push(`};`);
  } else if (pathname) {
    // If the directory has a valid pathname...
    // Render the empty function definition
    lines.push(`(): {`);
    // Then render the pathname return
    lines.push(`\tpathname: '${pathname}';`);
    // If there are any query parameters, render those!
    if (Object.keys(query).length) {
      lines.push(`\tquery: {`);
      Object.entries(query).forEach(([name, type]) => {
        lines.push(`\t\t${name}: ${type};`);
      });
      lines.push('\t};');
    }
    // Then end the function definition
    lines.push(`};`);
  }

  // Then add global depth tabs, join, and return the rendered type
  return lines.map(line => `${'\t'.repeat(depth)}${line}`).join('\n');
};

// const parameterFunction = `
// {% for child in children %}

// {% endfor %}

// function {{ node }}_{{ parameter.name }}({{ parameter.name }}: {{ parameter.type }}) {
//   {% for }
// }
// `

const renderPagesFunction = (node: string, cwd: Directory, paramaters: Parameter[]): string => {
  const { parameter, children, pathname } = cwd;

  if (parameter) {
    const hasUnparametrizedChildren = !!Object.keys(children).length;
    if (hasUnparametrizedChildren) {
      return `
${Object.entries(children)
    .map(([childNode, childDir]) => renderPagesFunction(`${node}_${childNode}`, childDir, paramaters))
    .join('\n')}

function ${node}_${parameter.name}(${parameter.name}: ${parameter.type}) {
  ${Object.entries(parameter.children)
    .map(([childNode, childDir]) =>
      renderPagesFunction(`${node}_${childNode}`, childDir, [...paramaters, parameter]),
    )
    .join('\n')}

  return {
    ${Object.entries(parameter.children)
    .map(([childNode]) => `${childNode}: ${node}_${childNode},`)
    .join('\n\t\t')}
  };
}

function ${node}(): { ${Object.entries(children).map(
  ([childNode]) => `${childNode}: typeof ${node}_${childNode}; `,
)}};
function ${node}(${parameter.name}: ${parameter.type}): ReturnType<typeof ${node}_${
  parameter.name
}>;
function ${node}(${parameter.name}?: ${parameter.type}): { ${Object.entries(children).map(
  ([childNode]) => `${childNode}: typeof ${node}_${childNode}; `,
)}} | ReturnType<typeof ${node}_${parameter.name}> {
  if (typeof ${parameter.name} === 'undefined') {
    return {
      ${Object.entries(children)
    .map(([childNode]) => `${childNode}: ${node}_${childNode},`)
    .join('\n\t\t')}
    };
  } else {
    return ${node}_${parameter.name}(${parameter.name});
  }
}
      `;
    }

    return `
function ${node}(${parameter.name}: ${parameter.type}) {
    ${Object.entries(parameter.children)
    .map(([childNode, childDir]) =>
      renderPagesFunction(`${node}_${childNode}`, childDir, [...paramaters, parameter]),
    )
    .join('\n')}

  return {
    ${Object.entries(parameter.children)
    .map(([childNode]) => `${childNode}: ${node}_${childNode},`)
    .join('\n\t\t')}
  };
}
    `;
  }

  if (Object.keys(children).length) {
    return `
function ${node}() {
  ${Object.entries(children)
    .map(([childNode, childDir]) =>
      renderPagesFunction(`${node}_${childNode}`, childDir, paramaters),
    )
    .join('\n\t')}

  return {
    ${Object.entries(children)
    .map(([childNode]) => `${childNode}: ${node}_${childNode},`)
    .join('\n\t\t')}
  };
}
    `;
  }

  if (pathname) {
    const interfaceName = node
      .split('_')
      .map(p => p.slice(0, 1).toUpperCase() + p.slice(1))
      .join('');
    return `
interface ${interfaceName} {
  pathname: '${pathname}';
  ${
  paramaters.length
    ? `query: {
    ${paramaters.map(parameter => `${parameter.name}: ${parameter.type};`).join('\n')}
  }`
    : ''
}
}

function ${node}() {
  return {
    pathname: '${pathname}' as const,
    ${
  paramaters.length
    ? `query: {
      ${paramaters.map(parameter => `${parameter.name},`).join('\n')}
    }
    `
    : ''
}
  }
}
    `;
  }

  throw new Error('A directory must have at least a parameter, children, or pathname.');
};

const renderPagesInterface = (directory: Directory) => {
  const lines: string[] = [];

  lines.push('export interface Pages {');
  lines.push(renderDirectoryStructureType(directory, {}, 1));
  lines.push('}');

  return `
${renderPagesFunction('pages', directory, [])}

export { pages };
  `;
};

async function main() {
  const watcher = chokidar.watch(`${pagesDir}/**/!(_app|_document|404|500).(ts|tsx|js|jsx)`, {
    cwd: pagesDir,
  });

  const pagesSet = new Set<string>();

  watcher.on('all', async (evt, path) => {
    if (evt === 'add') {
      pagesSet.add(path);
    } else if (evt === 'unlink') {
      pagesSet.delete(path);
    }

    const directory = buildDirectory(Array.from(pagesSet));

    // console.dir(directory, { depth: 50 });
    // console.log('--------------------');
    const pagesInterface = renderPagesInterface(directory);
    await fs.writeFile(routesPath, pagesInterface);

    // console.dir(directory, { depth: 50 });
    // console.log(Array.from(pagesSet));
  });
}

main();

/**
 * /pages/index.tsx
 * routes.index()
 *
 * /pages/grid.tsx
 * routes.grid();
 * routes.grid().index();
 *
 * /pages/me.tsx
 * routes.me();
 * routes.me().index();
 *
 * /pages/museum/[museumId]/index.tsx
 * routes.museum(museumId: string);
 * routes.museum(museumId: string).index();
 *
 * /pages/museum/[museumId]/collection.tsx
 * routes.museum(museumId: string).collection();
 * routes.museum(museumId: string).collection().index();
 *
 * /pages/museum/[museumId]/about.tsx
 * routes.museum(museumId: string).about();
 * routes.museum(museumId: string).about().index();
 *
 * /pages/museum/[museumId]/gallery/[galleryId].tsx
 * routes.museum(museumId: string).gallery(galleryId: string);
 * routes.museum(museumId: string).gallery(galleryId: string).index();
 *
 * /pages/api/artworks/index.tsx
 * routes.api().artworks();
 * routes.api().artworks().index();
 *
 * /pages/api/frames/index.tsx
 * routes.api().frames();
 * routes.api().frames().index();
 *
 * /pages/api/museum/[museumId]/index.tsx
 * routes.api().museum(museumId: string);
 * routes.api().museum(museumId: string).index();
 *
 * /pages/api/museum/[museumId]/collection.tsx
 * routes.api().museum(museumId: string).collection();
 * routes.api().museum(museumId: string).collection().index();
 *
 * /pages/api/museum/[museumId]/gallery/[galleryId].tsx
 * routes.api().museum(museumId: string).gallery(galleryId: string);
 * routes.api().museum(museumId: string).gallery(galleryId: string).index();
 *
 * /pages/api/user/[userId].tsx
 * routes.api().user(userId: string);
 * routes.api().user(userId: string).index();
 *
 * /pages/api/auth.tsx
 * routes.api().auth();
 * routes.api().auth().index();
 */
