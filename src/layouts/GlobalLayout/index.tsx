import { createContext, PropsWithChildren, useContext, useState } from 'react';
import cx from 'classnames';
import Nav, { NavProps } from '@src/components/Layout/Nav';
import { AnimationStatus } from '@src/providers/AnimationStatus';
import { useTheme } from '@src/providers/ThemeProvider';
import styles from './layout.module.scss';

export interface LayoutContextValue {
  hideNav(hide: boolean): void;
  updateNavVisibility(visible: boolean): void;
}
export const LayoutContext = createContext<LayoutContextValue | null>(null);
export function useGlobalLayout(): LayoutContextValue {
  const value = useContext(LayoutContext);
  if (!value) {
    throw new Error('useGlobalLayout must be used within context of LayoutContext.Provider.');
  }
  return value;
}

export interface GlobalLayoutProps {
  navOverrides?: NavProps['overrides'];
}

export const GlobalLayout = ({ children, navOverrides }: PropsWithChildren<GlobalLayoutProps>) => {
  const theme = useTheme();

  const [isNavVisible, setIsNavVisible] = useState<boolean | null>(null);
  const [hideNav, setHideNav] = useState(false);
  const [isNavAnimating, setIsNavAnimating] = useState(false);

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
              overrides={navOverrides}
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
