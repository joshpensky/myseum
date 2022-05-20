import styles from '@src/svgs/_svgs.module.scss';

export const CollectionIcon = () => (
  <svg className={styles.svg} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <rect
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      x="2.5"
      y="2.5"
      width="4"
      height="4"
      rx="0.5"
    />
    <rect
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      x="2.5"
      y="9.5"
      width="4"
      height="4"
      rx="0.5"
    />
    <rect
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      x="9.5"
      y="2.5"
      width="4"
      height="4"
      rx="0.5"
    />
    <rect
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      x="9.5"
      y="9.5"
      width="4"
      height="4"
      rx="0.5"
    />
  </svg>
);
