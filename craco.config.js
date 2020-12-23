const path = require('path');

module.exports = {
  style: {
    postcss: {
      plugins: [require('tailwindcss')('./tailwind.config.js')],
    },
  },
  eslint: {
    enable: false,
  },
  webpack: {
    alias: {
      '@src': path.resolve(__dirname, 'src'),
    },
  },
};
