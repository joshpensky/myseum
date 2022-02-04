import styles from './_svgs.module.scss';

export const SearchIcon = () => (
  <svg className={styles.svg} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <circle className={styles.stroke} vectorEffect="non-scaling-stroke" cx="9" cy="9" r="6.9" />
    <line
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      x1="13.9243"
      y1="13.0757"
      x2="18.9243"
      y2="18.0757"
    />
  </svg>
);
