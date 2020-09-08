import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { GridContext } from '@src/utils/contexts';
import c from 'classnames';
import styles from './gridItem.module.scss';

const GridItem = ({ item, position }) => {
  const { itemSize } = useContext(GridContext);

  const [isFrameLoaded, setIsFrameLoaded] = useState(false);

  const { dimensions, window } = item.frame;
  const { width: frameWidth, height: frameHeight } = dimensions;

  // TODO: cleanup, determine whether to use CSS vars or inline styles for dimensions

  return (
    <div
      className={styles.container}
      style={{
        // CSS Vars
        '--frame-width': frameWidth,
        '--frame-height': frameHeight,
        '--frame-depth': dimensions.depth,
        // Styles
        width: Math.ceil(frameWidth) * itemSize,
        height: Math.ceil(frameHeight) * itemSize,
        transform: `translateX(${position.x * itemSize}px) translateY(${position.y * itemSize}px)`,
      }}>
      <div className={styles.frame}>
        <img
          className={c(styles.frameImage, isFrameLoaded && styles.frameImageLoaded)}
          src={item.frame.src}
          alt="Frame"
          onLoad={() => setIsFrameLoaded(true)}
        />
        <figure
          className={c(styles.artwork, isFrameLoaded && styles.artworkLoading)}
          style={{
            width: window.dimensions.width * itemSize,
            height: window.dimensions.height * itemSize,
            transform: `translateX(${window.position.x * itemSize}px) translateY(${
              window.position.y * itemSize
            }px)`,
          }}>
          {isFrameLoaded && <img className={styles.artworkImage} src={item.src} alt={item.alt} />}
        </figure>
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
