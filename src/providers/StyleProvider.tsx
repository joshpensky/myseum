import { Fragment, ReactNode } from 'react';
import tw, { GlobalStyles as GlobalTwinStyles, theme } from 'twin.macro';
import { createGlobalStyle } from 'styled-components';

const GlobalCustomStyles = createGlobalStyle`
  /* Adding base body styles */
  body {
    background-color: ${theme`colors.off-white`};
    ${tw`font-sans`}
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
