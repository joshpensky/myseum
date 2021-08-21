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
    {{renderChild @key this @root.parameter}}
    {{/each}}
  };

  {{#each children}}
  {{renderChild @key this null}}
  {{/each}}
};
`.trim();

const parametrizedFunctionTemplate = `
{{node}}<{{title parameter.name}} extends {{parameter.type}}>({{parameter.name}}: {{title parameter.name}}): {
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
{{node}}: \`{{pathnameTemplate}}\`;
`.trim();
// {{#hoist}}
// type {{title pathname "page"}}{{#if parameters.length}}<{{#each parameters}}{{title this.name}}{{#if @last}}{{else}},{{/if}}{{/each}}>{{/if}} = \`{{pathnameTemplate}}\`;
// {{/hoist}}
// {{node}}: {{title pathname "page"}}{{#if parameters.length}}<{{#each parameters}}{{title this.name}}{{#if @last}}{{else}},{{/if}}{{/each}}>{{/if}};

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
): [string, string] => {
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

  let templateLiteral: string | null = null;
  if (pathname) {
    let pathnameTemplateLiteral = pathname;
    parameters.map(({ name }) => {
      pathnameTemplateLiteral = pathnameTemplateLiteral.replace(
        `[${name}]`,
        `$\{${titleCase(name)}}`,
      );
    });
    templateLiteral = pathnameTemplateLiteral;
  }

  let hoistedRender = '';
  const mainRender = render(
    {
      node,
      pathname,
      pathnameTemplate: templateLiteral,
      parameter,
      children,
      parameters,
    },
    {
      helpers: {
        title: titleCase,
        hoist(options: Handlebars.HelperOptions) {
          hoistedRender += options.fn(this);
        },
        renderChild(childNode: string, childDir: Directory, parameter: Parameter | null) {
          const childParameters = [...parameters];
          if (parameter) {
            childParameters.push(parameter);
          }

          const [mainChildRender, hoistedChildRender] = renderDirectoryFunctionType(
            childNode,
            childDir,
            childParameters,
            '  ',
          );

          hoistedRender += hoistedChildRender;
          return new Handlebars.SafeString(mainChildRender);
        },
      },
    },
  );

  // Then adjust tabbing
  return [mainRender.replace(/\n/g, `\n${pre}`), hoistedRender];
};

const dtsTemplate = `
declare module '@next/pages' {
  {{#if hoistedChildren}}
  {{hoistedChildren}}

  {{/if}}
  const {{children}}
}
`.trim();

export const renderPagesDTS = (directory: Readonly<Directory>) => {
  const [mainRender, hoistedRender] = renderDirectoryFunctionType('pages', directory, []);
  const children = new Handlebars.SafeString(mainRender);
  const hoistedChildren = new Handlebars.SafeString(hoistedRender.replace(/\n/g, `\n  `));

  const render = Handlebars.compile(dtsTemplate);
  return render({
    children,
    hoistedChildren,
  });
};
