import styles from '@src/svgs/_svgs.module.scss';

export const PlusIcon = () => (
  <svg className={styles.svg} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <line
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      x1="2"
      y1="10"
      x2="18"
      y2="10"
    />
    <line
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      x1="10"
      y1="2"
      x2="10"
      y2="18"
    />
  </svg>
);
