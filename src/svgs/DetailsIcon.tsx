import styles from './_svgs.module.scss';

export const DetailsIcon = () => (
  <svg className={styles.svg} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <rect
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      x="1.5"
      y="3.5"
      width="17"
      height="13"
      rx="1.5"
    />
    <line
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      x1="4"
      y1="7"
      x2="16"
      y2="7"
    />
    <line
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      x1="4"
      y1="10"
      x2="16"
      y2="10"
    />
    <line
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      x1="4"
      y1="13"
      x2="10"
      y2="13"
    />
  </svg>
);
