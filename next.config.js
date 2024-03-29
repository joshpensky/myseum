const path = require('path');

module.exports = {
  images: {
    domains: [process.env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', '')],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  sassOptions: {
    includePaths: [path.resolve(__dirname, 'src/styles')],
    additionalData: `@use 'sass:math';\n@import 'abstracts';`,
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
          typeof moduleLoader === 'object' &&
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
      });
    });

    return config;
  },
};
