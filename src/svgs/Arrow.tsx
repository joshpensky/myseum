import styles from '@src/svgs/_svgs.module.scss';

const Arrow = () => (
  <svg className={styles.svg} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      d="M14.222 7.55219L7.99981 1.32999L1.77759 7.55219"
    />
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M8 1.33006L8 15.33" />
  </svg>
);

export default Arrow;
