module.exports = {
  sassOptions: {
    includePaths: ['./src/styles'],
  },

  webpack: config => {
    // Next.js doesn't expose CSS Loader or Sass Loader options, so it needs to be found and updated manually!
    // https://github.com/vercel/next.js/discussions/11267#discussioncomment-101154
    const rules = config.module.rules
      .find(rule => typeof rule.oneOf === 'object')
      .oneOf.filter(rule => Array.isArray(rule.use));

    rules.forEach(rule => {
      rule.use.forEach(moduleLoader => {
        if (
          moduleLoader.loader.includes('css-loader') &&
          typeof moduleLoader.options.modules === 'object'
        ) {
          moduleLoader.options = {
            ...moduleLoader.options,
            modules: {
              ...moduleLoader.options.modules,
              // UPDATE CSS LOADER OPTIONS HERE https://webpack.js.org/loaders/css-loader/#object
              exportLocalsConvention: 'camelCase',
            },
          };
          return;
        }

        if (moduleLoader.loader.includes('sass-loader')) {
          moduleLoader.options = {
            ...moduleLoader.options,
            // UPDATE SASS LOADER OPTIONS HERE https://webpack.js.org/loaders/sass-loader/#options
            additionalData: `@use 'sass:math';\n@import 'abstracts';`,
          };
          return;
        }
      });
    });

    return config;
  },
};
