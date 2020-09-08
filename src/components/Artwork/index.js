import React, { useState } from 'react';
import PropTypes from 'prop-types';
import c from 'classnames';
import styles from './artwork.module.scss';

const Artwork = ({ data, withShadow }) => {
  const { id, title, description, frame, src, alt } = data;
  const { width: frameWidth, height: frameHeight, depth } = frame.dimensions;
  const { width: windowWidth, height: windowHeight } = frame.window.dimensions;

  const [areDetailsExpanded, setAreDetailsExpanded] = useState(false);

  const [isFrameLoaded, setIsFrameLoaded] = useState(false);
  const [isArtworkLoaded, setIsArtworkLoaded] = useState(false);

  const loaded = isFrameLoaded && isArtworkLoaded;

  return (
    <span className={styles.root}>
      <svg
        className={c(styles.wrapper, withShadow && loaded && styles.wrapperShadow)}
        xmlns="http://www.w3.org/2000/svg"
        id={id}
        aria-describedby={`${id}-desc`}
        style={{
          '--frame-width': frameWidth,
          '--frame-height': frameHeight,
          '--frame-depth': depth,
        }}
        viewBox={`0 0 ${frameWidth} ${frameHeight}`}>
        <desc id={`${id}-desc`}>{alt}</desc>
        <image
          className={c(styles.frame, loaded && styles.loaded)}
          href={frame.src}
          preserveAspectRatio="xMinYMin slice"
          x="0"
          y="0"
          width={frameWidth}
          height={frameHeight}
          onLoad={() => setIsFrameLoaded(true)}
        />
        <rect
          className={styles.window}
          x={frame.window.position.x}
          y={frame.window.position.y}
          width={windowWidth}
          height={windowHeight}
        />
        {/* LIMITATION: no inset shadow */}
        <image
          className={c(styles.artwork, loaded && styles.loaded)}
          href={src}
          preserveAspectRatio="xMinYMin slice"
          x={frame.window.position.x}
          y={frame.window.position.y}
          width={windowWidth}
          height={windowHeight}
          onLoad={() => setIsArtworkLoaded(true)}
        />
      </svg>
      <button
        className={styles.button}
        title="Expand"
        aria-label={`Expand details for artwork "${title}"`}
        aria-expanded={areDetailsExpanded}
        aria-controls={`${id}-details`}
        onClick={() => setAreDetailsExpanded(true)}
      />
      <div id={`${id}-details`} className={styles.details} aria-hidden={!areDetailsExpanded}>
        <div className={styles.detailsHeader}>
          <button onClick={() => setAreDetailsExpanded(false)} aria-label="Close">
            X
          </button>
        </div>
        <div className={styles.detailsBody}>
          <p>{title}</p>
          <p>
            {frame.window.dimensions.width} x {frame.window.dimensions.height} in.
          </p>
          <p>{description}</p>
        </div>
      </div>
    </span>
  );

  // return (
  //   <div
  //     className={styles.frame}
  //     style={{
  //       backgroundColor: 'red',
  //       height: '100%',
  //       width: 0,
  //       paddingLeft: '50%',
  //     }}>
  //     {/* <img
  //       className={c(styles.frameImage, isFrameLoaded && styles.frameImageLoaded)}
  //       src={frame.src}
  //       alt="Frame"
  //       onLoad={() => setIsFrameLoaded(true)}
  //     />
  //     <figure
  //       className={c(styles.artwork, isFrameLoaded && styles.artworkLoading)}
  //       style={{
  //         width: windowWidth * itemSize,
  //         height: windowHeight * itemSize,
  //         transform: `translateX(${frame.window.position.x * itemSize}px) translateY(${
  //           frame.window.position.y * itemSize
  //         }px)`,
  //       }}>
  //       {isFrameLoaded && <img className={styles.artworkImage} src={src} alt={alt} />}
  //     </figure> */}
  //   </div>
  // );
};

Artwork.propTypes = {
  data: PropTypes.object.isRequired,
  withShadow: PropTypes.bool,
};

Artwork.defaultProps = {
  withShadow: false,
};

export default Artwork;
