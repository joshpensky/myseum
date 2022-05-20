import styles from '@src/svgs/_svgs.module.scss';

export const TrashIcon = () => (
  <svg className={styles.svg} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      d="M16.399 5.19987L14.693 17.1413C14.6227 17.6339 14.2007 17.9999 13.7031 17.9999H6.29483C5.79718 17.9999 5.37526 17.6339 5.30488 17.1413L3.59896 5.19987"
    />
    <path className={styles.stroke} vectorEffect="non-scaling-stroke" d="M2 5.19987H18" />
    <path
      className={styles.stroke}
      vectorEffect="non-scaling-stroke"
      d="M6.79948 3.6V3C6.79948 2.44772 7.24719 2 7.79948 2H12.1995C12.7518 2 13.1995 2.44772 13.1995 3V3.6"
    />
  </svg>
);
