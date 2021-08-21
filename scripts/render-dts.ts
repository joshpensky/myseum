import Handlebars from 'handlebars';
import { Directory, Parameter } from './types';

const overloadedParameterFunctionTemplate = `
{{node}}: {
  ({{parameter.name}}: {{parameter.type}}): {
    {{#each parameter.children}}
    {{renderChild @key this @root.parameter}}
    {{/each}}
  };

  {{#each children}}
  {{renderChild @key this null}}
  {{/each}}
};
`.trim();

const parametrizedFunctionTemplate = `
{{node}}({{parameter.name}}: {{parameter.type}}): {
  {{#each parameter.children}}
  {{renderChild @key this @root.parameter}}
  {{/each}}
};
`.trim();

const childrenFunctionTemplate = `
{{node}}: {
  {{#each children}}
  {{renderChild @key this null}}
  {{/each}}
};
`.trim();

const pathnameFunctionTemplate = `
{{node}}: {
  pathname: '{{ pathname }}';
  {{#if parameters.length}}
  query: {
    {{#each parameters}}
    {{this.name}}: {{this.type}};
    {{/each}}
  }
  {{/if}}
};
`.trim();

/**
 * Renders the directory structure type for TypeScript.
 *
 * @param cwd the current working directory to render
 * @param query any query parameters to include in valid path responses
 * @param depth the minimum tab depth to render as a prefix for all lines
 * @returns the directory structure types
 */
const renderDirectoryFunctionType = (
  node: string,
  cwd: Readonly<Directory>,
  parameters: readonly Parameter[],
  pre = '',
): string => {
  const { children, parameter, pathname } = cwd;

  let template = '';

  // If the directory has a parameter...
  if (parameter) {
    // Render the function that accepts the parameter and returns child paths
    const hasUnparametrizedChildren = !!Object.keys(children).length;
    if (hasUnparametrizedChildren) {
      template = overloadedParameterFunctionTemplate;
    } else {
      template = parametrizedFunctionTemplate;
    }
  } else if (Object.keys(children).length) {
    // If there are child paths, render those under a function with no parameters
    template = childrenFunctionTemplate;
  } else if (pathname) {
    // If the directory has a valid pathname, return the function that renders that
    template = pathnameFunctionTemplate;
  }

  // If no template was found, throw an error – something went wrong when building the directory
  if (!template) {
    throw new Error('A directory must have at least a parameter, children, or pathname.');
  }

  // Otherwise, render the template!
  const render = Handlebars.compile(template);
  const renderedString = render(
    { node, pathname, parameter, children, parameters },
    {
      helpers: {
        renderChild(childNode: string, childDir: Directory, parameter: Parameter | null) {
          if (parameter) {
            return new Handlebars.SafeString(
              renderDirectoryFunctionType(childNode, childDir, [...parameters, parameter], '  '),
            );
          } else {
            return new Handlebars.SafeString(
              renderDirectoryFunctionType(childNode, childDir, parameters, '  '),
            );
          }
        },
      },
    },
  );
  // Then adjust tabbing
  return renderedString.replace(/\n/g, `\n${pre}`);
};

const dtsTemplate = `
declare module '@next/pages' {
  const {{children}}
}
`.trim();

export const renderPagesDTS = (directory: Readonly<Directory>) => {
  const children = new Handlebars.SafeString(renderDirectoryFunctionType('pages', directory, []));

  const render = Handlebars.compile(dtsTemplate);
  return render({ children });
};
