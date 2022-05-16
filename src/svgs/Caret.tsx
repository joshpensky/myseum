import styles from '@src/svgs/_svgs.module.scss';

const Caret = () => (
  <svg className={styles.svg} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      d="M2 5L8.00011 11.0001L14.0002 5"
    />
  </svg>
);

export default Caret;
