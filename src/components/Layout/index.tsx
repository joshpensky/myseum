import { createContext, Fragment, PropsWithChildren, useContext, useState } from 'react';
import Nav, { NavProps } from '@src/components/Layout/Nav';
import styles from './layout.module.scss';

export interface LayoutContextValue {
  updateNavVisibility(visible: boolean): void;
  navOverrides?: NavProps['overrides'];
}
export const LayoutContext = createContext<LayoutContextValue | null>(null);

export function useLayout(): LayoutContextValue;
export function useLayout(__dangerous_useOutsideContext: true): LayoutContextValue | null;
export function useLayout(__dangerous_useOutsideContext?: true): LayoutContextValue | null {
  const value = useContext(LayoutContext);
  if (__dangerous_useOutsideContext) {
    return value;
  }
  if (!value) {
    throw new Error('useLayout must be used within context of LayoutContext.Provider.');
  }
  return value;
}

export interface LayoutProps {
  navOverrides?: NavProps['overrides'];
}
const Layout = ({ children, navOverrides }: PropsWithChildren<LayoutProps>) => {
  const layoutCtx = useLayout(true);

  const [isNavVisible, setIsNavVisible] = useState<boolean | null>(null);

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
    <LayoutContext.Provider value={{ updateNavVisibility: visible => setIsNavVisible(visible) }}>
      <div className={styles.page}>
        <Nav overrides={overrides} visible={isNavVisible} />
        <main className={styles.main}>{children}</main>
      </div>
    </LayoutContext.Provider>
  );
};

export default Layout;

export type SubLayoutProps<T = any> = PropsWithChildren<{ pageProps: T }>;
