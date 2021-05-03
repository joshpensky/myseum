import { createContext, Fragment, PropsWithChildren, ReactNode, useContext } from 'react';
import tw from 'twin.macro';
import Nav, { NavProps } from '@src/components/Layout/Nav';

export interface LayoutContextValue {
  navOverrides?: NavProps['overrides'];
}
export const LayoutContext = createContext<LayoutContextValue | null>(null);

export interface LayoutProps {
  navOverrides?: NavProps['overrides'];
}
const Layout = ({ children, navOverrides }: PropsWithChildren<LayoutProps>) => {
  const layoutCtx = useContext(LayoutContext);

  const overrides = {
    left: (
      <Fragment>
        {layoutCtx?.navOverrides?.left ?? null}
        {navOverrides?.left ?? null}
      </Fragment>
    ),
    center: (
      <Fragment>
        {layoutCtx?.navOverrides?.center ?? null}
        {navOverrides?.center ?? null}
      </Fragment>
    ),
    right: (
      <Fragment>
        {layoutCtx?.navOverrides?.right ?? null}
        {navOverrides?.right ?? null}
      </Fragment>
    ),
  };

  return (
    <div css={tw`flex flex-col flex-1 min-h-screen`}>
      <Nav overrides={overrides} />
      <main css={tw`flex flex-col flex-1`}>{children}</main>
    </div>
  );
};

export default Layout;

export type SubLayoutProps<T = any> = PropsWithChildren<{ pageProps: T }>;
