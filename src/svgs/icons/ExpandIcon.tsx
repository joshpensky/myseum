import styles from '@src/svgs/_svgs.module.scss';

export const ExpandIcon = () => (
  <svg className={styles.svg} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M2 12.6667V18H7.33333" />
    <path
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      d="M18 7.33333L18 2L12.6667 2"
    />
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M2 18L8 12" />
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M18 2L12 8" />
  </svg>
);
