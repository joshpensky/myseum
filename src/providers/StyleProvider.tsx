import { Fragment, ReactNode } from 'react';
import { GlobalStyles as GlobalTwinStyles } from 'twin.macro';

export type StyleProviderProps = {
  children: ReactNode;
};
const StyleProvider = ({ children }: StyleProviderProps) => (
  <Fragment>
    <GlobalTwinStyles />
    {children}
  </Fragment>
);

export default StyleProvider;
