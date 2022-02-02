import { PropsWithChildren } from 'react';
import cx from 'classnames';
import { useTheme } from '@src/providers/ThemeProvider';
import { Footer } from './Footer';
import Nav from './Nav';
import styles from './layout.module.scss';

export type GlobalLayoutProps = Record<never, string>;

export const GlobalLayout = ({ children }: PropsWithChildren<GlobalLayoutProps>) => {
  const theme = useTheme();

  return (
    <div className={cx(styles.page, `theme--${theme.color}`)}>
      <Nav />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
};
