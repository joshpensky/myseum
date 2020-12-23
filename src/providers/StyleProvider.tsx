import { Fragment, PropsWithChildren } from 'react';
import { createGlobalStyle } from 'styled-components';
import { GlobalStyles as GlobalTwinStyles, theme } from 'twin.macro';

const GlobalCustomStyles = createGlobalStyle`
  /* Adding body color */
  body {
    background-color: ${theme`colors.off-white`};
  }

  /* Migra Font */
  @font-face {
    font-display: swap;
    font-family: 'Migra Web';
    font-stretch: normal;
    font-style: normal;
    font-weight: 400;
    src: url('/fonts/migra/Migra-Regular.woff2') format('woff2'),
      url('/fonts/migra/Migra-Regular.woff') format('woff'),
      url('/fonts/migra/Migra-Regular.otf') format('opentype'),
      url('/fonts/migra/Migra-Regular.ttf') format('truetype'),
      url('/fonts/migra/Migra-Regular.eot?#iefix') format('embedded-opentype');
  }
`;

export type StyleProviderProps = Record<string, unknown>;
const StyleProvider = ({ children }: PropsWithChildren<StyleProviderProps>) => (
  <Fragment>
    <GlobalTwinStyles />
    <GlobalCustomStyles />
    {children}
  </Fragment>
);

export default StyleProvider;
