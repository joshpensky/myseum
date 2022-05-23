import { ThemeProvider } from '@src/providers/ThemeProvider';

const themes = [
  {
    name: 'paper',
    value: '#f8f8f8',
  },
  {
    name: 'ink',
    value: '#090909',
  },
  {
    name: 'mint',
    value: '#f0f2ea',
  },
  {
    name: 'rose',
    value: '#fcf1ec',
  },
  {
    name: 'navy',
    value: '#232e3f',
  },
];

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  layout: 'centered',
  backgrounds: {
    default: 'paper',
    values: themes,
  },
};

export const decorators = [
  (Story, context) => {
    const theme =
      themes.find(theme => theme.value === context.globals.backgrounds?.value) ?? themes[0];

    return (
      <ThemeProvider theme={{ color: theme.name }}>
        <div className={`theme--${theme.name}`}>
          <Story />
        </div>
      </ThemeProvider>
    );
  },
];
