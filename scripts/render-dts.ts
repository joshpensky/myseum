import Handlebars from 'handlebars';
import { Directory, Parameter } from './types';

/**
 * Formats the value into a single TitleCased string.
 *
 * @param value the value to format
 * @returns the formatted string
 */
const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const overloadedParameterFunctionTemplate = `
{{node}}: {
  <{{title parameter.name}} extends {{parameter.type}}>({{parameter.name}}: {{title parameter.name}}): {
    {{#each parameter.children}}
    {{renderChild @key this @root.parameter "    "}}
    {{/each}}
  };

  {{#each children}}
  {{renderChild @key this null "  "}}
  {{/each}}
};
`.trim();

const parameterFunctionTemplate = `
{{node}}<{{title parameter.name}} extends {{parameter.type}}>({{parameter.name}}: {{title parameter.name}}): {
  {{#each parameter.children}}
  {{renderChild @key this @root.parameter "  "}}
  {{/each}}
};
`.trim();

const childrenFunctionTemplate = `
{{node}}: {
  {{#each children}}
  {{renderChild @key this null "  "}}
  {{/each}}
};
`.trim();

const pathnameFunctionTemplate = `
{{node}}: \`{{pathnameTemplateLiteral}}\`;
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
  let pathnameTemplateLiteral = '';

  // If the directory has a parameter...
  if (parameter) {
    // Render the function that accepts the parameter and returns child paths
    const hasUnparametrizedChildren = !!Object.keys(children).length;
    if (hasUnparametrizedChildren) {
      template = overloadedParameterFunctionTemplate;
    } else {
      template = parameterFunctionTemplate;
    }
  } else if (Object.keys(children).length) {
    // If there are child paths, render those under a function with no parameters
    template = childrenFunctionTemplate;
  } else if (pathname) {
    // If the directory has a valid pathname, return the function that renders that
    template = pathnameFunctionTemplate;
    // Then update pathname to replace [parameters] with template literal `${GenericType}` names
    pathnameTemplateLiteral = pathname;
    parameters.map(({ name }) => {
      pathnameTemplateLiteral = pathnameTemplateLiteral.replace(
        `[${name}]`,
        `$\{${titleCase(name)}}`,
      );
    });
  }

  // If no template was found, throw an error – something went wrong when building the directory
  if (!template) {
    throw new Error('A directory must have at least a parameter, children, or pathname.');
  }

  // Otherwise, render the template!
  const render = Handlebars.compile(template);
  const renderedString = render(
    {
      node,
      pathname,
      pathnameTemplateLiteral,
      parameter,
      children,
      parameters,
    },
    {
      helpers: {
        title: titleCase,
        /**
         * Renders the function template for the child.
         *
         * @param childNode the child node name
         * @param childDir the child directory
         * @param parameter the parent parameter, if there is one
         * @param pre the amount of whitespae to include before each line
         * @returns the child's rendered template
         */
        renderChild(childNode: string, childDir: Directory, parameter: Parameter | null, pre = '') {
          const childParameters = [...parameters];
          if (parameter) {
            childParameters.push(parameter);
          }

          const renderedString = renderDirectoryFunctionType(
            childNode,
            childDir,
            childParameters,
            pre,
          );

          return new Handlebars.SafeString(renderedString);
        },
      },
    },
  );

  // Then update the pre-whitespace for each line
  return renderedString.replace(/\n/g, `\n${pre}`);
};

const dtsTemplate = `
declare module 'next-pages-gen' {
  const {{children}}
}
`.trim();

export const renderPagesDTS = (directory: Readonly<Directory>) => {
  const children = renderDirectoryFunctionType('pages', directory, [], '  ');

  const render = Handlebars.compile(dtsTemplate);
  return render({ children: new Handlebars.SafeString(children) });
};
