import styles from '@src/svgs/_svgs.module.scss';

const MapViewIcon = () => (
  <svg className={styles.svg} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      d="M10.5 3.75L15.5 1.25V12.25L10.5 14.75L5.5 12.25L0.5 14.75V3.75L5.5 1.25L10.5 3.75Z"
    />
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M10.5 3.75V14.75" />
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M5.5 1.25V12.25" />
  </svg>
);

export default MapViewIcon;
