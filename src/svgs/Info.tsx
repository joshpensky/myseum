import styles from '@src/svgs/_svgs.module.scss';

export const Info = () => (
  <svg className={styles.svg} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <line
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      x1="8"
      y1="7"
      x2="8"
      y2="11"
    />
    <circle className={styles.stroke} vectorEffect="non-scaling-stroke" cx="8" cy="8" r="6.5" />
    <circle className={styles.fill} cx="8" cy="5.625" r="0.625" />
  </svg>
);
