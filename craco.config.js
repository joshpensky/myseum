const path = require('path');

const DIRS = {
  base: __dirname,
  src: path.resolve(__dirname, 'src'),
};

module.exports = {
  style: {
    css: {
      loaderOptions(options) {
        return {
          ...options,
          localsConvention: 'camelCaseOnly',
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
      extensions: ['.scss'],
    },
  },
};
