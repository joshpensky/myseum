import { PropsWithChildren } from 'react';
import cx from 'classnames';
import { ThemeContextValue, ThemeProvider, useTheme } from '@src/providers/ThemeProvider';
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
  const ctxTheme = useTheme();
  const theme = propsTheme ?? ctxTheme;

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
