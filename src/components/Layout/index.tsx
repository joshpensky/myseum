import { createContext, Fragment, PropsWithChildren, useContext, useState } from 'react';
import cx from 'classnames';
import Nav, { NavProps } from '@src/components/Layout/Nav';
import { AnimationStatus } from '@src/providers/AnimationStatus';
import { useTheme } from '@src/providers/ThemeProvider';
import styles from './layout.module.scss';

export interface LayoutContextValue {
  hideNav(hide: boolean): void;
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
  const theme = useTheme();

  const [isNavVisible, setIsNavVisible] = useState<boolean | null>(null);
  const [hideNav, setHideNav] = useState(false);
  const [isNavAnimating, setIsNavAnimating] = useState(false);

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
    <AnimationStatus value={isNavAnimating}>
      <LayoutContext.Provider
        value={{
          hideNav: hide => setHideNav(hide),
          updateNavVisibility: visible => setIsNavVisible(visible),
        }}>
        <div className={cx(styles.page, `theme--${theme.color}`)}>
          {!hideNav && (
            <Nav
              overrides={overrides}
              visible={isNavVisible}
              onAnimationChange={isAnimating => setIsNavAnimating(isAnimating)}
            />
          )}
          <main className={styles.main}>{children}</main>
        </div>
      </LayoutContext.Provider>
    </AnimationStatus>
  );
};

export default Layout;

export type SubLayoutProps<T = any> = PropsWithChildren<{ pageProps: T }>;
