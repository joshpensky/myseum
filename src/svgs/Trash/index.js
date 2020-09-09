import React from 'react';
import styles from '@src/svgs/sharedStyles.module.scss';

const Trash = () => (
  <svg className={styles.root} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path className={styles.stroke} d="M12.8001 4.3999L11.4287 13.9999H4.57156L3.20013 4.3999" />
    <path className={styles.stroke} d="M2 4.3999H14" />
    <path className={styles.stroke} d="M5.60034 3.2V2H10.4003V3.2" />
  </svg>
);

export default Trash;
