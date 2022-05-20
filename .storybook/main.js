const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-addon-next',
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-webpack5',
  },
  webpackFinal: async config => {
    if (config.resolve.plugins) {
      config.resolve.plugins.push(new TsconfigPathsPlugin());
    } else {
      config.resolve.plugins = [new TsconfigPathsPlugin()];
    }

    config.module.rules.forEach(rule => {
      if (rule.use) {
        rule.use.forEach(use => {
          if (use.loader === 'css-loader') {
            use.options.modules.exportLocalsConvention = 'camelCase';
          }
        });
      }
    });

    return config;
  },
  env: config => ({
    ...config,
    NEXT_PUBLIC_USE_MOCK_API: 'true',
  }),
};
