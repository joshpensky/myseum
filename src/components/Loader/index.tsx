import cx from 'classnames';
import styles from './loader.module.scss';

interface LoaderProps {
  size?: 'normal' | 'large';
}

export const Loader = ({ size = 'normal' }: LoaderProps) => (
  <div className={cx(styles.loader, styles[`size--${size}`])}>
    <div className={styles.item} />
  </div>
);
