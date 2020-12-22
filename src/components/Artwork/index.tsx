import { useState, useEffect, useRef } from 'react';
import cx from 'classnames';
import { Link, useParams } from 'react-router-dom';
import IconButton from '@src/components/IconButton';
import Close from '@src/svgs/Close';
import Fullscreen from '@src/svgs/Fullscreen';
import Edit from '@src/svgs/Edit';
import Trash from '@src/svgs/Trash';
import styles from './artwork.module.scss';
import { Artwork as ArtworkData, MuseumCollectionItem } from '@src/types';

export type ArtworkProps = {
  data: ArtworkData | MuseumCollectionItem;
  withShadow?: boolean;
};

const Artwork = ({ data, withShadow }: ArtworkProps) => {
  const { museumId } = useParams<{ museumId: string }>();

  const detailsRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  const [areDetailsExpanded, setAreDetailsExpanded] = useState(false);

  const [isFrameLoaded, setIsFrameLoaded] = useState(false);
  const [isArtworkLoaded, setIsArtworkLoaded] = useState(false);

  const onOutsideClick = (evt: MouseEvent) => {
    if (
      detailsRef.current &&
      evt.target &&
      evt.target instanceof Node &&
      !(detailsRef.current === evt.target || detailsRef.current.contains(evt.target))
    ) {
      setAreDetailsExpanded(false);
    }
  };

  const onCloseButton = () => {
    setAreDetailsExpanded(false);
    triggerButtonRef.current?.focus();
  };

  const onKeyDown = (evt: KeyboardEvent) => {
    switch (evt.key) {
      case 'Esc':
      case 'Escape': {
        evt.preventDefault();
        setAreDetailsExpanded(false);
        triggerButtonRef.current?.focus();
        break;
      }
      // TODO: add tab lock
    }
  };

  useEffect(() => {
    if (areDetailsExpanded) {
      detailsRef.current?.focus();
      document.addEventListener('click', onOutsideClick);
      document.addEventListener('keydown', onKeyDown);

      return () => {
        document.removeEventListener('click', onOutsideClick);
        document.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [areDetailsExpanded]);

  const { id, title, artist, description, acquiredAt, createdAt, frame, src, alt } = data;
  const { width: frameWidth, height: frameHeight } = frame.dimensions;
  const { width: windowWidth, height: windowHeight } = frame.window.dimensions;

  const loaded = isFrameLoaded && isArtworkLoaded;

  return (
    <span className={styles.root}>
      <svg
        className={cx(styles.wrapper, withShadow && loaded && styles.wrapperShadow)}
        xmlns="http://www.w3.org/2000/svg"
        id={`artwork-${id}`}
        aria-labelledby={`artwork-${id}-title`}
        aria-describedby={`artwork-${id}-desc`}
        style={{
          '--frame-width': frameWidth,
          '--frame-height': frameHeight,
          '--frame-depth': frame.depth,
        }}
        viewBox={`0 0 ${frameWidth} ${frameHeight}`}>
        <title id={`artwork-${id}-title`}>{title}</title>
        <desc id={`artwork-${id}-desc`}>{alt}</desc>
        <image
          className={cx(styles.frame, loaded && styles.loaded)}
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
          className={cx(styles.artwork, loaded && styles.loaded)}
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
        aria-controls={`artwork-${id}-details`}
        onClick={() => setAreDetailsExpanded(true)}
      />
      <div
        ref={detailsRef}
        id={`artwork-${id}-details`}
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
              <span>{artist || 'Unknown'}</span>,{' '}
              <time dateTime={createdAt.toString()}>{createdAt}</time>
            </p>
            <p className={styles.detailsBodySmall}>
              {frame.window.dimensions.width} x {frame.window.dimensions.height} in.
            </p>
          </div>
          <p className={styles.detailsBodySmall}>{description}</p>
          {(acquiredAt || 'gallery' in data) && (
            <div className={styles.detailsBodyFooter}>
              {acquiredAt && <p className={styles.detailsBodySmall}>Acquired {acquiredAt}</p>}
              {'gallery' in data && (
                <p className={styles.detailsBodySmall}>
                  Featured in the{' '}
                  <Link to={`/museum/${museumId}/gallery/${data.gallery.id}`}>
                    {data.gallery.name}
                  </Link>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </span>
  );
};

export default Artwork;
