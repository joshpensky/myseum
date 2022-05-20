import styles from '@src/svgs/_svgs.module.scss';

export const ShareIcon = () => (
  <svg className={styles.svg} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <circle className={styles.stroke} vectorEffect="non-scaling-stroke" cx="16" cy="4" r="3.5" />
    <circle className={styles.stroke} vectorEffect="non-scaling-stroke" cx="16" cy="16" r="3.5" />
    <circle className={styles.stroke} vectorEffect="non-scaling-stroke" cx="4" cy="10" r="3.5" />
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M7 8.5L13 5.5" />
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M7 11.5L13 14.5" />
  </svg>
);
