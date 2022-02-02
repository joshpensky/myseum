import styles from './_svgs.module.scss';

export const LockIcon = () => (
  <svg className={styles.svg} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <rect
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      x="2.5"
      y="8.5"
      width="15"
      height="10"
      rx="0.5"
    />
    <path
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      d="M14.5 6V8.5H5.5V6C5.5 3.51472 7.51472 1.5 10 1.5C12.4853 1.5 14.5 3.51472 14.5 6Z"
    />
  </svg>
);
