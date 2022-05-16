import styles from '@src/svgs/_svgs.module.scss';

type LayerProps = {
  as: 'outline' | 'inner';
};

const Layer = ({ as }: LayerProps) => (
  <svg className={styles.svg} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect
      className={styles.stroke}
      opacity={as === 'inner' ? 0.5 : 1}
      x="2.5"
      y="0.5"
      width="19"
      height="23"
    />
    <rect
      className={styles.stroke}
      opacity={as === 'outline' ? 0.5 : 1}
      x="7.5"
      y="5.5"
      width="9"
      height="13"
    />
  </svg>
);

export default Layer;
