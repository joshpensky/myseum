import { Directory } from './types';

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
export const buildDirectory = (pages: string[]) => {
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
          type: 'string | number', // Default to type string (TODO: other types? [id:number])
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
