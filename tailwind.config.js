const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');
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
      boxShadow: {
        popover: '0 20px 25px -5px var(--tw-ring-color), 0 10px 10px -5px var(--tw-ring-color)',
      },
      colors: {
        'off-white': '#f8f8f8',
        gray: {
          300: '#cacaca',
        },
        red: {
          500: '#FF3737',
        },
        magenta: {
          500: '#D400A6',
        },
        blue: {
          500: '#0989FF',
        },
        yellow: {
          500: '#FFAF37',
        },
        mint: {
          200: '#f0f2ea',
          300: '#dde1d2',
          400: '#b6bba8',
          600: '#8C8E84',
          700: '#6a715c',
          800: '#585f3c',
          900: '#4e533f',
        },
        pink: {
          200: '#f6efe8',
        },
        navy: {
          50: '#101824',
          100: '#161f2e',
          200: '#232e3f',
          800: '#6582ab',
        },
        paper: {
          200: '#f8f8f8',
          300: '#eaeaea',
        },
      },
      cursor: {
        'ew-resize': 'ew-resize',
        grab: 'grab',
        grabbing: 'grabbing',
        none: 'none',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', ...defaultTheme.fontFamily.sans],
        serif: ['Migra Web', ...defaultTheme.fontFamily.serif],
      },
      maxHeight: {
        '3xl': '48rem',
      },
      opacity: {
        15: '0.15',
      },
      ringWidth: {
        0.5: '0.5px',
        6: '6px',
      },
      rotate: {
        360: '360deg',
      },
      scale: {
        '-100': '-1',
      },
      transitionDuration: {
        0: '0ms',
      },
      transitionProperty: {
        'modal-enter': 'transform, opacity',
        'modal-leave': 'transform, opacity, visibility',
      },
      zIndex: {
        '-1': '-1',
        1: '1',
        fab: '100',
        popover: '110',
        modal: '200',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    /**
     * Adds the `size` mixin as a utility, for defining height and width at the same time!
     *
     * @example `size-4` === `w-4 h-4`
     */
    plugin(function addSizeUtility({ addUtilities, e, theme, variants }) {
      const widthUtilities = theme('width');
      const heightUtilities = theme('height');

      const sizeUtilities = {};
      Object.entries(widthUtilities).map(([key, value]) => {
        // If utility exists for height and width, add new size utility!
        if (heightUtilities[key] === value) {
          sizeUtilities[`.${e(`size-${key}`)}`] = {
            height: value,
            width: value,
          };
        }
      });

      const sizeVariants = new Set([...variants('width'), ...variants('height')]);

      addUtilities(sizeUtilities, Array.from(sizeVariants));
    }),

    /**
     * Adds the ability to set border colors for individual sides.
     *
     * @example 'border-t-blue-100'
     */
    plugin(function addIndividualBorderSideColors({ addUtilities, e, theme, variants }) {
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
    }),

    /**
     * Adds the ability to use padding ratios in Tailwind.
     *
     * @example 'ratio-2-3' // will produce a 2:3 ratio
     */
    plugin(function addRatioUtilities({ addUtilities }) {
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
    }),
  ],
};
