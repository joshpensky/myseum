import fs from 'fs/promises';
import path from 'path';
import chokidar from 'chokidar';
import Handlebars from 'handlebars';
import { renderPagesInterface } from './interface';
import { Directory, Parameter } from './types';

const rootDir = path.resolve(__dirname, '..');
const pagesDir = path.resolve(rootDir, 'src/pages');

const routesPath = path.resolve(__dirname, 'routes.ts');

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

const overloadedParameterFunctionTemplate = `
{{#each children}}
{{renderChild @key this null}}
{{/each}}

function {{node}}_{{parameter.name}}({{parameter.name}}: {{parameter.type}}) {
  {{#each parameter.children}}
  {{renderChild @key this @root.parameter}}
  {{/each}}

  return {
    {{#each parameter.children}}
    {{@key}}: {{@root.node}}_{{@root.parameter.name}}_{{@key}},
    {{/each}}
  };
}

function {{node}}(): { {{#each children}} {{@key}}: typeof {{@root.node}}_{{@key}}; {{/each}} };
function {{node}}({{parameter.name}}: {{parameter.type}}): ReturnType<typeof {{node}}_{{parameter.name}}>;
function {{node}}({{parameter.name}}?: {{parameter.type}}): { {{#each children}} {{@key}}: typeof {{@root.node}}_{{@key}}; {{/each}} } | ReturnType<typeof {{node}}_{{parameter.name}}> {
  if (typeof {{parameter.name }} === 'undefined') {
    return {
      {{#each children}}
      {{@key}}: {{@root.node}}_{{@key}},
      {{/each}}
    };
  } else {
    return {{node}}_{{parameter.name}}({{parameter.name}});
  }
}`;

const parameterFunctionTemplate = `
function {{node}}({{parameter.name}}: {{parameter.type}}) {
  {{#each parameter.children}}
  {{renderChild @key this @root.parameter}}
  {{/each}}

  return {
    {{#each parameter.children}}
    {{@key}}: {{@root.node}}_{{@root.parameter.name}}_{{@key}},
    {{/each}}
  };
}`;

const childrenFunctionTemplate = `
function {{node}}() {
  {{#each children}}
  {{renderChild @key this null}}
  {{/each}}

  return {
    {{#each children}}
    {{@key}}: {{@root.node}}_{{@key}},
    {{/each}}
  };
}`;

const pathnameFunctionTemplate = `
function {{node}}() {
  return {
    pathname: '{{pathname}}' as const,
    {{#if parameters.length}}
    query: {
      {{#each parameters}}
      {{this.name}},
      {{/each}}
    },
    {{/if}}
  };
}`;

const renderPagesFunction = (
  node: string,
  cwd: Readonly<Directory>,
  parameters: readonly Parameter[],
  depth = 0,
): string => {
  const { parameter, children, pathname } = cwd;

  let template: string | undefined;

  // If there is a parameter...
  if (parameter) {
    const hasUnparametrizedChildren = !!Object.keys(children).length;
    if (hasUnparametrizedChildren) {
      // If there are children that don't rely on the parameter,
      // create an overloaded function that could handle both sets of child paths
      template = overloadedParameterFunctionTemplate;
    } else {
      // Otherwise, just create a parametrized function
      template = parameterFunctionTemplate;
    }
  }

  if (Object.keys(children).length) {
    // If there are children, create the function for children
    template = childrenFunctionTemplate;
  } else if (pathname) {
    // Otherwise, just create the function to return the path
    template = pathnameFunctionTemplate;
    // TODO: hoist these interfaces to the top
    //     const interfaceName = node
    //       .split('_')
    //       .map(p => p.slice(0, 1).toUpperCase() + p.slice(1))
    //       .join('');
    //     return `
    // interface ${interfaceName} {
    //   pathname: '${pathname}';
    //   ${
    //     paramaters.length
    //       ? `query: {
    //     ${paramaters.map(parameter => `${parameter.name}: ${parameter.type};`).join('\n')}
    //   }`
    //       : ''
    //   }
    // }
    //     `;
  }

  // If no template was found, throw an error – something went wrong when building the directory
  if (!template) {
    throw new Error('A directory must have at least a parameter, children, or pathname.');
  }

  // Otherwise, render the template!
  const render = Handlebars.compile(template);
  const renderedString = render(
    { node, pathname, children, parameter, parameters },
    {
      helpers: {
        /**
         * Renders the function template for the child.
         *
         * @param childNode the child node name
         * @param childDir the child directory
         * @param parameter the parent parameter, if there is one
         * @returns the child's rendered template
         */
        renderChild(childNode: string, childDir: Directory, parameter: Parameter | null) {
          if (parameter) {
            return new Handlebars.SafeString(
              renderPagesFunction(
                `${node}_${parameter.name}_${childNode}`,
                childDir,
                [...parameters, parameter],
                1,
              ),
            );
          } else {
            return new Handlebars.SafeString(
              renderPagesFunction(`${node}_${childNode}`, childDir, parameters, 1),
            );
          }
        },
      },
    },
  );
  // Then adjust tabbing
  return renderedString
    .split('\n')
    .map(str => `${'  '.repeat(depth)}${str}`)
    .join('\n');
};

const renderPagesContent = (directory: Directory) => {
  const pagesInterface = renderPagesInterface(directory);

  const pagesFunction = renderPagesFunction('pages', directory, []);

  return [pagesInterface, pagesFunction].join('\n');
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
    const content = renderPagesContent(directory);
    await fs.writeFile(routesPath, content);

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
