import Artwork from '@src/components/Artwork';
import styles from './gridItem.module.scss';
import { useGrid } from '@src/providers/GridProvider';
import { Artwork as ArtworkData, Position } from '@src/types';

export type GridItemProps = {
  item: ArtworkData;
  position: Position;
};

const GridItem = ({ item, position }: GridItemProps) => {
  const { itemSize } = useGrid();

  const { dimensions } = item.frame;
  const { width: frameWidth, height: frameHeight } = dimensions;

  return (
    <div
      className={styles.container}
      style={{
        width: Math.ceil(frameWidth) * itemSize,
        height: Math.ceil(frameHeight) * itemSize,
        transform: `translateX(${position.x * itemSize}px) translateY(${position.y * itemSize}px)`,
      }}>
      <div className={styles.inner} style={{ height: frameHeight * itemSize }}>
        <Artwork data={item} withShadow />
      </div>
    </div>
  );
};

export default GridItem;
