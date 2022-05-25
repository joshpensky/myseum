import { PropsWithChildren, useEffect, useState } from 'react';
import cx from 'classnames';
import { ThemeContextValue, ThemeProvider } from '@src/providers/ThemeProvider';
import { Footer } from './Footer';
import Nav from './Nav';
import styles from './layout.module.scss';

export interface GlobalLayoutProps {
  theme?: ThemeContextValue;
}

export const GlobalLayout = ({
  children,
  theme: propsTheme,
}: PropsWithChildren<GlobalLayoutProps>) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return 'paper';
    } else {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  });

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onQueryChange = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches);
    };
    query.addEventListener('change', onQueryChange);
    return () => {
      query.removeEventListener('change', onQueryChange);
    };
  }, []);

  const theme: ThemeContextValue = propsTheme ?? { color: isDarkMode ? 'ink' : 'paper' };

  return (
    <ThemeProvider theme={theme}>
      <div className={cx(styles.page, `theme--${theme.color}`)}>
        <Nav />
        <main className={styles.main}>{children}</main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};
