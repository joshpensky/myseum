import { MouseEvent, PropsWithChildren } from 'react';
import styles from './floatingActionButton.module.scss';

export type FloatingActionButtonProps = {
  onClick?(evt: MouseEvent<HTMLButtonElement>): void;
  title: string;
};

const FloatingActionButton = ({
  children,
  onClick,
  title,
}: PropsWithChildren<FloatingActionButtonProps>) => (
  <button className={styles.wrapper} onClick={onClick} title={title}>
    <span className={styles.icon}>{children}</span>
  </button>
);

export default FloatingActionButton;
