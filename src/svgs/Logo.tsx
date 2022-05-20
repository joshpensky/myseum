import cx from 'classnames';
import styles from '@src/svgs/_svgs.module.scss';

const Logo = () => (
  <svg
    id="logo"
    className={cx(styles.svg, styles.svgByHeight)}
    viewBox="0 0 20 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby="logo-title">
    <title id="logo-title">Myseum Logo</title>
    <path className={styles.fill} d="M2.5 5L2 6H18L17.5 5L10 0L2.5 5Z" />
    <path
      className={styles.fill}
      d="M10 14.9995L6.99948 12.0002C6.99484 12.0327 6.49951 15.5042 6.49951 16.4998C6.49912 17.2996 7.16667 18.1665 7.50049 18.5H2.5C2.5 18.5 2.81507 18.1844 3 17.5C3.18493 16.8156 3.97433 10.2795 3.97433 10.2795C3.99088 9.91178 4.00049 9.63865 4.00049 9.5C4.00049 8.59321 3.5 8 2.99951 7.49976H7.00049L9.99976 10.4998L12.9995 7.49976H17.0005C16.5 8 15.9995 8.59321 15.9995 9.5C15.9995 9.63865 16.0091 9.91178 16.0257 10.2795C16.0257 10.2795 16.8151 16.8156 17 17.5C17.1849 18.1844 17.5 18.5 17.5 18.5H12.4995C12.8333 18.1665 13.5009 17.2996 13.5005 16.4998C13.5005 15.5042 13.0052 12.0327 13.0005 12.0002L10 14.9995Z"
    />
    <path className={styles.fill} d="M2 20L0.5 22L0 24H20L19.5 22L18 20H2Z" />
  </svg>
);

export default Logo;
