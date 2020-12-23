import { Fragment, PropsWithChildren } from 'react';
import { createGlobalStyle } from 'styled-components';
import tw, { GlobalStyles as GlobalTwinStyles, theme } from 'twin.macro';

const GlobalCustomStyles = createGlobalStyle`
  /* Adding body color */
  body {
    background-color: ${theme`colors.off-white`};
    ${tw`font-sans`}
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
