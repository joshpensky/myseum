import styles from '@src/svgs/_svgs.module.scss';

export const SelectionIcon = () => (
  <svg className={styles.svg} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <circle className={styles.stroke} vectorEffect="non-scaling-stroke" cx="4" cy="4" r="2.5" />
    <circle className={styles.stroke} vectorEffect="non-scaling-stroke" cx="4" cy="13" r="2.5" />
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M6.5 13L13.5 16" />
    <circle className={styles.stroke} vectorEffect="non-scaling-stroke" cx="16" cy="4" r="2.5" />
    <circle className={styles.stroke} vectorEffect="non-scaling-stroke" cx="16" cy="16" r="2.5" />
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M16 13.5V6.5" />
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M13.5 4H6.5" />
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M4 6.5V10.5" />
  </svg>
);
