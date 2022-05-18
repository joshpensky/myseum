import { Fragment, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import cx from 'classnames';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import { FrameDto } from '@src/data/serializers/frame.serializer';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { getImageUrl } from '@src/utils/getImageUrl';
import styles from './artwork.module.scss';

const ArtworkDetails = dynamic(() => import('@src/components/Artwork/ArtworkDetails'));

export interface ArtworkProps {
  artwork: ArtworkDto;
  frame?: FrameDto | null;
  disabled?: boolean;
  galleries?: Omit<GalleryDto, 'artworks'>[];
  onDetailsOpenChange?(open: boolean): void;
  onLoad?(): void;
}

export const Artwork = ({
  artwork,
  frame,
  disabled,
  galleries,
  onDetailsOpenChange,
  onLoad,
}: ArtworkProps) => {
  const [isFrameLoaded, setIsFrameLoaded] = useState(false);
  const [isArtworkLoaded, setIsArtworkLoaded] = useState(false);
  const isLoaded = (!frame || isFrameLoaded) && isArtworkLoaded;

  useEffect(() => {
    if (isLoaded && onLoad) {
      onLoad();
    }
  }, [isLoaded]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [heightPx, setHeightPx] = useState(0);
  const [widthPx, setWidthPx] = useState(0);
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
  const { width: artworkWidth, height: artworkHeight } = artwork.size;
  const frameWidth = frame?.size.width ?? artworkWidth;
  const frameHeight = frame?.size.height ?? artworkHeight;
  // const frameDepth = frame?.size.depth ?? 0;

  // Center the artwork within the frame
  const artworkX = (frameWidth - artworkWidth) / 2;
  const artworkY = (frameHeight - artworkHeight) / 2;

  // Get the scale, from the input x/y to the actual px x/y
  const xScale = widthPx / frameWidth;
  const yScale = heightPx / frameHeight;

  const windowPath = CanvasUtils.getLineCommands(
    (frame?.window ?? []).map(({ x, y }) => ({
      x: x * xScale,
      y: y * yScale,
    })),
  );

  const artworkSrc = getImageUrl('artworks', artwork.src);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      {/* Use an SVG to define the dimensions of the element */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={[0, 0, frameWidth, frameHeight].join(' ')} />

      {!frame ? (
        <Image
          src={artworkSrc}
          layout="fill"
          objectFit="fill"
          onLoad={() => setIsArtworkLoaded(true)}
        />
      ) : (
        <Fragment>
          <Image
            src={frame.src}
            alt=""
            layout="fill"
            objectFit="fill"
            onLoad={evt => {
              if (evt.currentTarget.src.indexOf('data:image/gif;base64') < 0) {
                setIsFrameLoaded(true);
              }
            }}
          />

          <div
            className={styles.window}
            style={{
              '--path': `'${windowPath}'`,
            }}>
            {/* TODO: add mat bezel */}
            {/* TODO: add inner shadow */}
            <div
              className={styles.artwork}
              style={{
                '--x': `${artworkX * xScale}px`,
                '--y': `${artworkY * yScale}px`,
                '--width': `${artworkWidth * xScale}px`,
                '--height': `${artworkHeight * yScale}px`,
              }}>
              <Image
                src={artworkSrc}
                alt={artwork.alt}
                layout="fill"
                objectFit="fill"
                onLoad={evt => {
                  if (evt.currentTarget.src.indexOf('data:image/gif;base64') < 0) {
                    setIsArtworkLoaded(true);
                  }
                }}
              />
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

      {isLoaded && !disabled && (
        <ArtworkDetails data={artwork} galleries={galleries} onOpenChange={onDetailsOpenChange} />
      )}
    </div>
  );
};

// {
//   /* Then render the artwork through SVG */
// }
// <svg
//   id={`artwork-${id}`}
//   className={cx(`theme--${theme.color}`, styles.root)}
//   xmlns="http://www.w3.org/2000/svg"
//   aria-labelledby={`artwork-${id}-title`}
//   aria-describedby={`artwork-${id}-desc`}
//   viewBox={[0, 0, frameWidth, frameHeight].join(' ')}>
//   <title id={`artwork-${id}-title`}>{title}</title>
//   <desc id={`artwork-${id}-desc`}>{alt}</desc>

//   {frame && (
//     <Fragment>
//       <defs>
//         {/* Define window path */}
//         <path id={`artwork-${id}-window`} d={CanvasUtils.getLineCommands(frame.window)} />

//         {/* Define window inner shadow (https://stackoverflow.com/a/53503687) */}
//         <filter id={`artwork-${id}-inner-shadow`}>
//           {/* Shadow Offset */}
//           <feOffset dx={0} dy={0} />
//           {/* Shadow Blur */}
//           <feGaussianBlur stdDeviation={0.15 * frameDepth} result="offset-blur" />
//           {/* Invert the drop shadow to create an inner shadow */}
//           <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
//           {/* Color & opacity */}
//           <feFlood floodColor="black" floodOpacity={0.5} result="color" />
//           {/* Clip color inside shadow */}
//           <feComposite operator="in" in="color" in2="inverse" result="shadow" />
//           {/* Shadow opacity */}
//           <feComponentTransfer in="shadow" result="shadow">
//             <feFuncA type="linear" slope="1" />
//           </feComponentTransfer>
//         </filter>

//         {/* Define window mask for artwork */}
//         <mask id={`artwork-${id}-window-mask`}>
//           <rect fill="black" x={0} y={0} width={frameWidth} height={frameHeight} />
//           <use fill="white" href={`#artwork-${id}-window`} />
//         </mask>
//       </defs>

//       {/* Render frame */}
//       {isLoaded && frameSrc && (
//         <image
//           className={cx(styles.frame, isLoaded && styles.frameLoaded)}
//           href={frameSrc}
//           preserveAspectRatio="none"
//           x={0}
//           y={0}
//           width={frameWidth}
//           height={frameHeight}
//         />
//       )}

//       {/* Render frame window when loading, and frame mat when loaded */}
//       <use
//         className={cx(styles.window, isLoaded && styles.windowLoaded)}
//         href={`#artwork-${id}-window`}
//       />

//       {/* Render bezel for the frame mat */}
//       {isLoaded && (
//         <g id={`artwork-${id}-mat-bezel`} mask={`url(#artwork-${id}-window-mask)`}>
//           {/* Render base light of the bezel */}
//           <rect
//             fill="white"
//             x={artworkX - BEZEL}
//             y={artworkY - BEZEL}
//             width={artworkWidth + BEZEL * 2}
//             height={artworkHeight + BEZEL * 2}
//           />
//           {/* Render shadow sides of bezel */}
//           <path
//             className={styles.bezelShadow}
//             d={CanvasUtils.getLineCommands([
//               {
//                 x: artworkX + artworkWidth + BEZEL,
//                 y: artworkY - BEZEL,
//               },
//               {
//                 x: artworkX + artworkWidth,
//                 y: artworkY,
//               },
//               {
//                 x: artworkX,
//                 y: artworkY + artworkHeight,
//               },
//               {
//                 x: artworkX - BEZEL,
//                 y: artworkY + artworkHeight + BEZEL,
//               },
//               {
//                 x: artworkX - BEZEL,
//                 y: artworkY - BEZEL,
//               },
//             ])}
//           />
//           {/* Render darker top shadow of bezel */}
//           <path
//             className={styles.bezelShadow}
//             d={CanvasUtils.getLineCommands([
//               {
//                 x: artworkX + artworkWidth + BEZEL,
//                 y: artworkY - BEZEL,
//               },
//               {
//                 x: artworkX + artworkWidth,
//                 y: artworkY,
//               },
//               {
//                 x: artworkX,
//                 y: artworkY,
//               },
//               {
//                 x: artworkX - BEZEL,
//                 y: artworkY - BEZEL,
//               },
//             ])}
//           />
//           {/* Render back of frame under mat */}
//           <rect
//             className={styles.mat}
//             x={artworkX}
//             y={artworkY}
//             width={artworkWidth}
//             height={artworkHeight}
//           />
//         </g>
//       )}
//     </Fragment>
//   )}

//   {/* Render artwork image, centered in frame */}
//   {isLoaded && artworkSrc && (
//     <image
//       className={cx(styles.artwork, isLoaded && styles.artworkLoaded)}
//       href={artworkSrc}
//       preserveAspectRatio="xMinYMin slice"
//       x={artworkX}
//       y={artworkY}
//       width={artworkWidth}
//       height={artworkHeight}
//       mask={frame ? `url(#artwork-${id}-window-mask)` : undefined}
//     />
//   )}

//   {/* Render frame inner shadow */}
//   {isLoaded && frame && (
//     <use
//       className={styles.frameInnerShadow}
//       href={`#artwork-${id}-window`}
//       filter={`url(#artwork-${id}-inner-shadow)`}
//     />
//   )}
// </svg>;
