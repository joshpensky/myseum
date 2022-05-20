import { PropsWithChildren } from 'react';
import styles from './basicPageLayout.module.scss';

interface BasicPageLayoutProps {
  title: string;
}

export const BasicPageLayout = ({ children, title }: PropsWithChildren<BasicPageLayoutProps>) => (
  <div className={styles.page}>
    <h1 className={styles.title}>{title}</h1>

    <div className={styles.content}>{children}</div>
  </div>
);
