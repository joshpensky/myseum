import styles from '@src/svgs/_svgs.module.scss';

export const CheckmarkIcon = () => (
  <svg className={styles.svg} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      d="M2.25 8.75L6.11364 12.25L13.75 3.25"
    />
  </svg>
);
