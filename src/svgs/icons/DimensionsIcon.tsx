import styles from '@src/svgs/_svgs.module.scss';

export const DimensionsIcon = () => (
  <svg className={styles.svg} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M2 17H13" />
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M2 15.5V18.5" />
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M13 15.5V18.5" />
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M17 2L17 13" />
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M18.5 2L15.5 2" />
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M18.5 13L15.5 13" />
    <rect
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      x="2"
      y="2"
      width="11"
      height="11"
    />
  </svg>
);
