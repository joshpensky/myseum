const defaultTheme = require('tailwindcss/defaultTheme');
const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette').default;

module.exports = {
  purge: {
    content: ['./src/**/*.ts', './src/**/*.tsx'],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    fill: {
      current: 'currentColor',
      none: 'none',
    },
    extend: {
      colors: {
        'off-white': '#f8f8f8',
        mint: {
          400: '#f0f2ea',
          500: '#dde1d2',
          800: '#585f3c',
          900: '#4e533f',
        },
      },
      cursor: {
        grab: 'grab',
        grabbing: 'grabbing',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', ...defaultTheme.fontFamily.sans],
        serif: ['Migra Web', ...defaultTheme.fontFamily.serif],
      },
      zIndex: {
        '-1': '-1',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('tailwindcss-interaction-variants'),
    /**
     * Adds the ability to set border colors for individual sides.
     *
     * @example 'border-t-blue-100'
     */
    function addIndividualBorderSideColors({ addUtilities, e, theme, variants }) {
      const colors = flattenColorPalette(theme('borderColor'));
      delete colors['DEFAULT'];

      const colorMap = Object.keys(colors).map(color => ({
        [`.${e(`border-t-${color}`)}`]: { borderTopColor: colors[color] },
        [`.${e(`border-r-${color}`)}`]: { borderRightColor: colors[color] },
        [`.${e(`border-b-${color}`)}`]: { borderBottomColor: colors[color] },
        [`.${e(`border-l-${color}`)}`]: { borderLeftColor: colors[color] },
      }));
      const utilities = Object.assign({}, ...colorMap);

      addUtilities(utilities, variants('borderColor'));
    },
    /**
     * Adds the ability to use padding ratios in Tailwind.
     *
     * @example 'ratio-2-3' // will produce a 2:3 ratio
     */
    function addRatioUtilities({ addUtilities }) {
      const ratios = [
        [16, 9],
        [4, 3],
        [2, 3],
      ];

      const ratioMap = ratios.map(([w, h]) => ({
        [`.ratio-${h}-${w}`]: {
          height: '0px',
          paddingTop: `calc((${w} / ${h}) * 100%)`,
        },
        [`.ratio-${w}-${h}`]: {
          height: '0px',
          paddingTop: `calc((${h} / ${w}) * 100%)`,
        },
      }));
      const ratioUtilities = Object.assign({}, ...ratioMap);

      addUtilities(ratioUtilities, []);
    },
  ],
};
