import styles from '@src/svgs/_svgs.module.scss';

const DragHandle = () => (
  <svg className={styles.svg} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <line
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      x1="14"
      y1="8"
      x2="2"
      y2="8"
    />
    <line
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      x1="8"
      y1="2"
      x2="8"
      y2="14"
    />
    <path className={styles.fill} d="M6 2.5L10 2.5L8 0.5L6 2.5Z" />
    <path className={styles.fill} d="M10 13.5H6L8 15.5L10 13.5Z" />
    <path className={styles.fill} d="M13.5 6L13.5 10L15.5 8L13.5 6Z" />
    <path className={styles.fill} d="M2.5 10L2.5 6L0.5 8L2.5 10Z" />
  </svg>
);

export default DragHandle;
