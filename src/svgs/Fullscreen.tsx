import styles from '@src/svgs/svgs.module.scss';

const Fullscreen = () => (
  <svg className={styles.root} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path className={styles.stroke} d="M2 10V14H6" />
    <path className={styles.stroke} d="M14 6L14 2L10 2" />
    <path className={styles.stroke} d="M2 14L6.5 9.5" />
    <path className={styles.stroke} d="M14 2L9.5 6.5" />
  </svg>
);

export default Fullscreen;
