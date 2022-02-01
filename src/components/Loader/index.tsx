import cx from 'classnames';
import styles from './loader.module.scss';

interface LoaderProps {
  size?: 'normal' | 'large';
}

export const Loader = ({ size = 'normal' }: LoaderProps) => (
  <span className={cx(styles.loader, styles[`size--${size}`])}>
    <span className={styles.item} />
  </span>
);
