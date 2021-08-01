import { Fragment, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import cx from 'classnames';
import { ArtworkDto } from '@src/data/ArtworkSerializer';
import { GalleryDto } from '@src/data/GallerySerializer';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { useTheme } from '@src/providers/ThemeProvider';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import styles from './artwork.module.scss';

const ArtworkDetails = dynamic(() => import('@src/components/Artwork/ArtworkDetails'));

export interface ArtworkProps {
  data: ArtworkDto;
  disabled?: boolean;
  gallery?: Omit<GalleryDto, 'artworks'>;
  onLoad?(): void;
}

const BEZEL = 0.05;

export const Artwork = ({ data, disabled, gallery, onLoad }: ArtworkProps) => {
  const theme = useTheme();

  const { id, title, frame, src, alt } = data;

  const [isFrameLoaded, setIsFrameLoaded] = useState(!frame);
  const [isArtworkLoaded, setIsArtworkLoaded] = useState(false);
  const isLoaded = isFrameLoaded && isArtworkLoaded;

  useEffect(() => {
    if (isLoaded && onLoad) {
      onLoad();
    }
  }, [isLoaded]);

  // Loads the image and artwork on mount
  useIsomorphicLayoutEffect(() => {
    const artworkImg = new Image();
    artworkImg.onload = () => {
      setIsArtworkLoaded(true);
    };
    artworkImg.src = src;

    if (frame) {
      const frameImg = new Image();
      frameImg.onload = () => {
        setIsFrameLoaded(true);
      };
      frameImg.src = frame.src;
    }
  }, [src]);

  const { width: artworkWidth, height: artworkHeight } = data.size;
  const frameWidth = frame?.size.width ?? artworkWidth;
  const frameHeight = frame?.size.height ?? artworkHeight;
  const frameDepth = frame?.size.depth ?? 0;

  const artworkX = (frameWidth - artworkWidth) / 2;
  const artworkY = (frameHeight - artworkHeight) / 2;

  return (
    <div className={styles.wrapper}>
      <svg
        id={`artwork-${id}`}
        className={cx(`theme--${theme.color}`, styles.root)}
        xmlns="http://www.w3.org/2000/svg"
        aria-labelledby={`artwork-${id}-title`}
        aria-describedby={`artwork-${id}-desc`}
        viewBox={[0, 0, frameWidth, frameHeight].join(' ')}>
        <title id={`artwork-${id}-title`}>{title}</title>
        <desc id={`artwork-${id}-desc`}>{alt}</desc>

        {frame && (
          <Fragment>
            <defs>
              {/* Define window path */}
              <path id={`artwork-${id}-window`} d={CanvasUtils.getLineCommands(frame.window)} />

              {/* Define window inner shadow (https://stackoverflow.com/a/53503687) */}
              <filter id={`artwork-${id}-inner-shadow`}>
                {/* Shadow Offset */}
                <feOffset dx={0} dy={0} />
                {/* Shadow Blur */}
                <feGaussianBlur stdDeviation={0.15 * frameDepth} result="offset-blur" />
                {/* Invert the drop shadow to create an inner shadow */}
                <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                {/* Color & opacity */}
                <feFlood floodColor="black" floodOpacity={0.5} result="color" />
                {/* Clip color inside shadow */}
                <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                {/* Shadow opacity */}
                <feComponentTransfer in="shadow" result="shadow">
                  <feFuncA type="linear" slope="1" />
                </feComponentTransfer>
              </filter>

              {/* Define window mask for artwork */}
              <mask id={`artwork-${id}-window-mask`}>
                <rect fill="black" x={0} y={0} width={frameWidth} height={frameHeight} />
                <use fill="white" href={`#artwork-${id}-window`} />
              </mask>
            </defs>

            {/* Render frame */}
            <image
              className={cx(styles.frame, isLoaded && styles.frameLoaded)}
              href={frame.src}
              preserveAspectRatio="none"
              x={0}
              y={0}
              width={frameWidth}
              height={frameHeight}
            />

            {/* Render frame window when loading, and frame mat when loaded */}
            <use
              className={cx(styles.window, isArtworkLoaded && styles.windowLoaded)}
              href={`#artwork-${id}-window`}
            />

            {/* Render bezel for the frame mat */}
            {isArtworkLoaded && (
              <g id={`artwork-${id}-mat-bezel`} mask={`url(#artwork-${id}-window-mask)`}>
                {/* Render base light of the bezel */}
                <rect
                  fill="white"
                  x={artworkX - BEZEL}
                  y={artworkY - BEZEL}
                  width={artworkWidth + BEZEL * 2}
                  height={artworkHeight + BEZEL * 2}
                />
                {/* Render shadow sides of bezel */}
                <path
                  className={styles.bezelShadow}
                  d={CanvasUtils.getLineCommands([
                    {
                      x: artworkX + artworkWidth + BEZEL,
                      y: artworkY - BEZEL,
                    },
                    {
                      x: artworkX + artworkWidth,
                      y: artworkY,
                    },
                    {
                      x: artworkX,
                      y: artworkY + artworkHeight,
                    },
                    {
                      x: artworkX - BEZEL,
                      y: artworkY + artworkHeight + BEZEL,
                    },
                    {
                      x: artworkX - BEZEL,
                      y: artworkY - BEZEL,
                    },
                  ])}
                />
                {/* Render darker top shadow of bezel */}
                <path
                  className={styles.bezelShadow}
                  d={CanvasUtils.getLineCommands([
                    {
                      x: artworkX + artworkWidth + BEZEL,
                      y: artworkY - BEZEL,
                    },
                    {
                      x: artworkX + artworkWidth,
                      y: artworkY,
                    },
                    {
                      x: artworkX,
                      y: artworkY,
                    },
                    {
                      x: artworkX - BEZEL,
                      y: artworkY - BEZEL,
                    },
                  ])}
                />
                {/* Render back of frame under mat */}
                <rect
                  className={styles.mat}
                  x={artworkX}
                  y={artworkY}
                  width={artworkWidth}
                  height={artworkHeight}
                />
              </g>
            )}
          </Fragment>
        )}

        {/* Render artwork image, centered in frame */}
        <image
          className={cx(styles.artwork, isLoaded && styles.artworkLoaded)}
          href={src}
          preserveAspectRatio="xMinYMin slice"
          x={artworkX}
          y={artworkY}
          width={artworkWidth}
          height={artworkHeight}
          mask={frame ? `url(#artwork-${id}-window-mask)` : undefined}
        />

        {/* Render frame inner shadow */}
        {isArtworkLoaded && frame && (
          <use
            className={styles.frameInnerShadow}
            href={`#artwork-${id}-window`}
            filter={`url(#artwork-${id}-inner-shadow)`}
          />
        )}
      </svg>

      {isLoaded && !disabled && <ArtworkDetails data={data} gallery={gallery} />}
    </div>
  );
};
