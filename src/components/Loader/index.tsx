import cx from 'classnames';
import styles from './loader.module.scss';

interface LoaderProps {
  className?: string;
  size?: 'normal' | 'large';
}

export const Loader = ({ className, size = 'normal' }: LoaderProps) => (
  <span className={cx(styles.loader, styles[`size--${size}`], className)}>
    <span className={styles.item} />
  </span>
);
