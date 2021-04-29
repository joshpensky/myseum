import { Fragment, ReactNode } from 'react';
import { createGlobalStyle } from 'styled-components';
import tw, { GlobalStyles as GlobalTwinStyles, theme } from 'twin.macro';

const GlobalCustomStyles = createGlobalStyle`
  /* Adding base body styles */
  body {
    background-color: ${theme`colors.off-white`};
    ${tw`font-sans`}
  }

  /* Adding Migra font */
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

export type StyleProviderProps = {
  children: ReactNode;
};
const StyleProvider = ({ children }: StyleProviderProps) => (
  <Fragment>
    <GlobalTwinStyles />
    <GlobalCustomStyles />
    {children}
  </Fragment>
);

export default StyleProvider;
