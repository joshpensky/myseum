import { Fragment, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import cx from 'classnames';
import { PlacedArtworkDto } from '@src/data/serializers/gallery.serializer';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { getImageUrl } from '@src/utils/getImageUrl';
import styles from './artwork.module.scss';

const ArtworkDetails = dynamic(() => import('@src/components/Artwork/ArtworkDetails'));

export interface ArtworkProps {
  item: PlacedArtworkDto;
  disabled?: boolean;
  onDetailsOpenChange?(open: boolean): void;
  onLoad?(): void;
}

export const Artwork = ({ item, disabled, onDetailsOpenChange, onLoad }: ArtworkProps) => {
  const [isFrameLoaded, setIsFrameLoaded] = useState(false);
  const [isArtworkLoaded, setIsArtworkLoaded] = useState(false);
  const isLoaded = (!item.frame || isFrameLoaded) && isArtworkLoaded;

  useEffect(() => {
    if (isLoaded && onLoad) {
      onLoad();
    }
  }, [isLoaded]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [_heightPx, setHeightPx] = useState(0);
  const [_widthPx, setWidthPx] = useState(0);
  useIsomorphicLayoutEffect(() => {
    if (wrapperRef.current) {
      const observer = new ResizeObserver(entries => {
        const [wrapper] = entries;
        setHeightPx(wrapper.contentRect.height);
        setWidthPx(wrapper.contentRect.width);
      });
      observer.observe(wrapperRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  // Get the width and height
  const { width: artworkWidth, height: artworkHeight } = item.artwork.size;
  const frameWidth = item.frame?.size.width ?? artworkWidth;
  const frameHeight = item.frame?.size.height ?? artworkHeight;

  const { width: widthPx, height: heightPx } = CanvasUtils.objectContain(
    { width: _widthPx, height: _heightPx },
    { width: frameWidth, height: frameHeight },
  );

  // const frameDepth = frame?.size.depth ?? 0;

  // Center the artwork within the frame
  const artworkX = (frameWidth - artworkWidth) / 2;
  const artworkY = (frameHeight - artworkHeight) / 2;

  // Get the scale, from the input x/y to the actual px x/y
  const xScale = widthPx / frameWidth;
  const yScale = heightPx / frameHeight;

  const windowPoints = (item.frame?.window ?? []).map(({ x, y }) => ({
    x: x * widthPx,
    y: y * heightPx,
  }));
  const windowPath = CanvasUtils.getLineCommands(windowPoints);

  let artworkStyle: Record<string, any> = {
    '--x': `${artworkX * xScale}px`,
    '--y': `${artworkY * yScale}px`,
    '--scale': 100,
    '--width': `${artworkWidth * xScale}px`,
    '--height': `${artworkHeight * yScale}px`,
  };

  if (item.framingOptions.isScaled) {
    const windowMinX = Math.min(...windowPoints.map(point => point.x));
    const windowMinY = Math.min(...windowPoints.map(point => point.y));
    const windowMaxX = Math.max(...windowPoints.map(point => point.x));
    const windowMaxY = Math.max(...windowPoints.map(point => point.y));

    const windowDimensions = {
      width: windowMaxX - windowMinX,
      height: windowMaxY - windowMinY,
    };
    const scaledDimensions = CanvasUtils.objectContain(windowDimensions, item.artwork.size);

    artworkStyle = {
      '--x': `${windowMinX + (windowDimensions.width - scaledDimensions.width) / 2}px`,
      '--y': `${windowMinY + (windowDimensions.height - scaledDimensions.height) / 2}px`,
      '--scale': item.framingOptions.scaling,
      '--width': `${scaledDimensions.width}px`,
      '--height': `${scaledDimensions.height}px`,
    };
  }

  const artworkSrc = getImageUrl('artworks', item.artwork.src);

  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      style={{ '--aspect-ratio': frameWidth / frameHeight }}>
      <div>
        {!item.frame ? (
          <Image
            src={artworkSrc}
            layout="fill"
            objectFit="fill"
            onLoadingComplete={() => setIsArtworkLoaded(true)}
          />
        ) : (
          <Fragment>
            <Image
              src={getImageUrl('frames', item.frame.src)}
              alt=""
              layout="fill"
              objectFit="fill"
              onLoadingComplete={() => {
                setIsFrameLoaded(true);
              }}
            />

            <div
              className={cx(styles.window, styles[`matting--${item.framingOptions.matting}`])}
              style={{
                '--path': `'${windowPath}'`,
              }}>
              {/* TODO: add scaling based on item.framingOptions.scaling */}
              <div className={styles.artwork} style={artworkStyle}>
                <div className={styles.artworkInner}>
                  <Image
                    src={artworkSrc}
                    alt={item.artwork.alt}
                    layout="fill"
                    objectFit="fill"
                    onLoadingComplete={() => {
                      setIsArtworkLoaded(true);
                    }}
                  />
                </div>
              </div>
            </div>
          </Fragment>
        )}

        <div className={cx(styles.placeholder, isLoaded && styles.placeholderLoaded)}>
          {windowPath && (
            <div
              className={styles.placeholderWindow}
              style={{
                '--path': `'${windowPath}'`,
              }}
            />
          )}
        </div>
      </div>

      {isLoaded && !disabled && (
        <ArtworkDetails data={item.artwork} onOpenChange={onDetailsOpenChange} />
      )}
    </div>
  );
};
