import styles from './_svgs.module.scss';

const Close = () => (
  <svg className={styles.svg} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M2.5 13.5L13.5 2.5" />
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M13.5 13.5L2.5 2.5" />
  </svg>
);

export const CloseIcon = Close;

export default Close;
