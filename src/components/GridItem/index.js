import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Artwork from '@src/components/Artwork';
import { GridContext } from '@src/utils/contexts';
import styles from './gridItem.module.scss';

const GridItem = ({ item, position }) => {
  const { itemSize } = useContext(GridContext);

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

GridItem.propTypes = {
  item: PropTypes.object.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
};

export default GridItem;
