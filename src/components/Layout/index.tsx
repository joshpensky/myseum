import { PropsWithChildren } from 'react';
import Nav from '@src/components/Nav';
import styles from './layout.module.scss';

export type LayoutProps = Record<string, unknown>;
const Layout = ({ children }: PropsWithChildren<LayoutProps>) => (
  <div className={styles.page}>
    <Nav />
    <main className={styles.main}>{children}</main>
  </div>
);

export default Layout;
