import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { GridContext } from '@src/utils/contexts';
import styles from './gridItem.module.scss';

const GridItem = ({ x, y, width, height }) => {
  const { itemSize } = useContext(GridContext);

  return (
    <div
      className={styles.gridItem}
      style={{
        width: width * itemSize,
        height: height * itemSize,
        transform: `translateX(${x * itemSize}px) translateY(${y * itemSize}px)`,
      }}
    />
  );
};

GridItem.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

export default GridItem;
