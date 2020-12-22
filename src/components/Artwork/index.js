import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import c from 'classnames';
import { Link, useParams } from 'react-router-dom';
import IconButton from '@src/components/IconButton';
import Close from '@src/svgs/Close';
import Fullscreen from '@src/svgs/Fullscreen';
import Edit from '@src/svgs/Edit';
import Trash from '@src/svgs/Trash';
import styles from './artwork.module.scss';

const Artwork = ({ data, withShadow }) => {
  const { museumId } = useParams();

  const detailsRef = useRef(null);
  const triggerButtonRef = useRef(null);

  const [areDetailsExpanded, setAreDetailsExpanded] = useState(false);

  const [isFrameLoaded, setIsFrameLoaded] = useState(false);
  const [isArtworkLoaded, setIsArtworkLoaded] = useState(false);

  const onOutsideClick = evt => {
    if (!(detailsRef.current === evt.target || detailsRef.current.contains(evt.target))) {
      setAreDetailsExpanded(false);
    }
  };

  const onCloseButton = () => {
    setAreDetailsExpanded(false);
    triggerButtonRef.current.focus();
  };

  const onKeyDown = evt => {
    switch (evt.key) {
      case 'Esc':
      case 'Escape': {
        evt.preventDefault();
        setAreDetailsExpanded(false);
        triggerButtonRef.current.focus();
        break;
      }
      // TODO: add tab lock
    }
  };

  useEffect(() => {
    if (areDetailsExpanded) {
      detailsRef.current.focus();
      document.addEventListener('click', onOutsideClick);
      document.addEventListener('keydown', onKeyDown);

      return () => {
        document.removeEventListener('click', onOutsideClick);
        document.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [areDetailsExpanded]);

  const { id, title, artist, description, acquired, created, frame, gallery, src, alt } = data;
  const { width: frameWidth, height: frameHeight, depth } = frame.dimensions;
  const { width: windowWidth, height: windowHeight } = frame.window.dimensions;

  const loaded = isFrameLoaded && isArtworkLoaded;

  return (
    <span className={styles.root}>
      <svg
        className={c(styles.wrapper, withShadow && loaded && styles.wrapperShadow)}
        xmlns="http://www.w3.org/2000/svg"
        id={id}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
        style={{
          '--frame-width': frameWidth,
          '--frame-height': frameHeight,
          '--frame-depth': depth,
        }}
        viewBox={`0 0 ${frameWidth} ${frameHeight}`}>
        <title id={`${id}-title`}>{title}</title>
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
        ref={triggerButtonRef}
        className={styles.button}
        title="Expand"
        aria-label={`Expand details for artwork "${title}"`}
        aria-expanded={areDetailsExpanded}
        aria-controls={`${id}-details`}
        onClick={() => setAreDetailsExpanded(true)}
      />
      <div
        ref={detailsRef}
        id={`${id}-details`}
        tabIndex={-1}
        className={styles.details}
        aria-modal={true}
        aria-hidden={!areDetailsExpanded}>
        <div className={styles.detailsHeader}>
          <div className={styles.detailsHeaderGroup}>
            <div className={styles.detailsHeaderButton}>
              <IconButton icon={Fullscreen} title="Expand artwork" />
            </div>
            <div className={styles.detailsHeaderButton}>
              <IconButton icon={Edit} title="Edit artwork" />
            </div>
            <div className={styles.detailsHeaderButton}>
              <IconButton icon={Trash} title="Delete artwork" />
            </div>
          </div>
          <div className={styles.detailsHeaderButton}>
            <IconButton icon={Close} title="Close" onClick={onCloseButton} />
          </div>
        </div>
        <div className={styles.detailsBody}>
          <div className={styles.detailsBodyHeader}>
            <p>{title}</p>
            <p>
              <span>{artist || 'Unknown'}</span>, <time dateTime={created}>{created}</time>
            </p>
            <p className={styles.detailsBodySmall}>
              {frame.window.dimensions.width} x {frame.window.dimensions.height} in.
            </p>
          </div>
          <p className={styles.detailsBodySmall}>{description}</p>
          {(acquired || gallery) && (
            <div className={styles.detailsBodyFooter}>
              {acquired && <p className={styles.detailsBodySmall}>Acquired {acquired}</p>}
              {gallery && (
                <p className={styles.detailsBodySmall}>
                  Featured in the{' '}
                  <Link to={`/museum/${museumId}/gallery/${gallery.id}`}>{gallery.name}</Link>
                </p>
              )}
            </div>
          )}
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
