import Handlebars from 'handlebars';
import { Directory, Parameter } from './types';

const overloadedParameterFunctionTemplate = `
{{#each children}}
{{renderChild @key this null ""}}
{{/each}}

function {{node}}_{{parameter.name}}({{parameter.name}}) {
  {{#each parameter.children}}
  {{renderChild @key this @root.parameter "  "}}
  {{/each}}

  return {
    {{#each parameter.children}}
    {{@key}}: {{@root.node}}_{{@root.parameter.name}}_{{@key}},
    {{/each}}
  };
}

function {{node}}({{parameter.name}}) {
  if (typeof {{parameter.name}} === 'undefined') {
    return {
      {{#each children}}
      {{@key}}: {{@root.node}}_{{@key}},
      {{/each}}
    };
  } else {
    return {{node}}_{{parameter.name}}({{parameter.name}});
  }
}
`.trim();

const parameterFunctionTemplate = `
function {{node}}({{parameter.name}}) {
  {{#each parameter.children}}
  {{renderChild @key this @root.parameter "  "}}
  {{/each}}

  return {
    {{#each parameter.children}}
    {{@key}}: {{@root.node}}_{{@root.parameter.name}}_{{@key}},
    {{/each}}
  };
}
`.trim();

const childrenFunctionTemplate = `
{{#each children}}
{{renderChild @key this null ""}}
{{/each}}

var {{node}} = {
  {{#each children}}
  {{@key}}: {{@root.node}}_{{@key}},
  {{/each}}
}
`.trim();

const pathnameFunctionTemplate = `
var {{node}} = \`{{pathnameTemplateLiteral}}\`;
`.trim();

const renderPagesFunction = (
  node: string,
  cwd: Readonly<Directory>,
  parameters: readonly Parameter[],
  pre = '',
): string => {
  const { parameter, children, pathname } = cwd;

  let template = '';
  let pathnameTemplateLiteral = '';

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
  } else if (Object.keys(children).length) {
    // If there are children, create the function for children
    template = childrenFunctionTemplate;
  } else if (pathname) {
    // Otherwise, just create the function to return the path
    template = pathnameFunctionTemplate;
    // Then update pathname to replace [parameters] with template literal `${argument}` names
    pathnameTemplateLiteral = pathname;
    parameters.map(({ name }) => {
      pathnameTemplateLiteral = pathnameTemplateLiteral.replace(`[${name}]`, `$\{${name}}`);
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
      children,
      parameter,
      parameters,
    },
    {
      helpers: {
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
          if (parameter) {
            return new Handlebars.SafeString(
              renderPagesFunction(
                `${node}_${parameter.name}_${childNode}`,
                childDir,
                [...parameters, parameter],
                pre,
              ),
            );
          } else {
            return new Handlebars.SafeString(
              renderPagesFunction(`${node}_${childNode}`, childDir, parameters, pre),
            );
          }
        },
      },
    },
  );
  // Then update the pre-whitespace for each line
  return renderedString.replace(/\n/g, `\n${pre}`);
};

const browserTemplate = `
{{children}}

export { pages };
`.trim();

export const renderPagesJSBrowser = (directory: Directory) => {
  const children = new Handlebars.SafeString(renderPagesFunction('pages', directory, []));

  const render = Handlebars.compile(browserTemplate);
  return render({ children });
};

const nodeTemplate = `
{{children}}

module.exports = { pages };
`.trim();

export const renderPagesJSNode = (directory: Directory) => {
  const children = new Handlebars.SafeString(renderPagesFunction('pages', directory, []));

  const render = Handlebars.compile(nodeTemplate);
  return render({ children });
};
