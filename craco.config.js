const path = require('path');

const DIRS = {
  base: __dirname,
  src: path.resolve(__dirname, 'src'),
};

module.exports = {
  style: {
    postcss: {
      plugins: [require('tailwindcss')('./tailwind.config.js')],
    },
    css: {
      loaderOptions(options) {
        return {
          ...options,
          modules: {
            exportLocalsConvention: 'camelCaseOnly',
          },
        };
      },
    },
    sass: {
      loaderOptions(options) {
        return {
          ...options,
          implementation: require('sass'),
          prependData: `@import 'abstracts';`,
          sassOptions: {
            includePaths: [path.join(DIRS.src, 'style')],
          },
        };
      },
    },
  },
  eslint: {
    enable: false,
  },
  webpack: {
    alias: {
      '@src': DIRS.src,
    },
    resolve: {
      extensions: ['.css', '.scss'],
    },
  },
  plugins: [
    {
      plugin: {
        overrideCracoConfig: ({ cracoConfig }) => {
          if (typeof cracoConfig.eslint.enable !== 'undefined') {
            cracoConfig.disableEslint = !cracoConfig.eslint.enable;
          }
          delete cracoConfig.eslint;
          return cracoConfig;
        },
        overrideWebpackConfig: ({ webpackConfig, cracoConfig }) => {
          if (
            typeof cracoConfig.disableEslint !== 'undefined' &&
            cracoConfig.disableEslint === true
          ) {
            webpackConfig.plugins = webpackConfig.plugins.filter(
              instance => instance.constructor.name !== 'ESLintWebpackPlugin',
            );
          }
          return webpackConfig;
        },
      },
    },
  ],
};
