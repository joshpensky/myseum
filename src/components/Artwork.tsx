import { Fragment, useState } from 'react';
import tw, { theme } from 'twin.macro';
import { Artist, Artwork, Frame, Gallery } from '@prisma/client';
import ArtworkDetails from '@src/components/ArtworkDetails';
import { useGrid } from '@src/features/grid';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { useTheme } from '@src/providers/ThemeProvider';
import { CanvasUtils } from '@src/utils/CanvasUtils';

export type ArtworkProps = {
  data: Artwork & {
    frame: Frame | null;
    artist: Artist | null;
    gallery?: Gallery;
  };
  disabled?: boolean;
};

const BEZEL = 0.05;

const ArtworkComponent = ({ data, disabled }: ArtworkProps) => {
  const themeCtx = useTheme();
  const gridCtx = useGrid(true);

  const { id, title, frame, src, alt } = data;

  const [isFrameLoaded, setIsFrameLoaded] = useState(!frame);
  const [isArtworkLoaded, setIsArtworkLoaded] = useState(false);
  const isLoaded = isFrameLoaded && isArtworkLoaded;

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

  const { width: artworkWidth, height: artworkHeight } = data;
  const frameWidth = frame?.width ?? artworkWidth;
  const frameHeight = frame?.height ?? artworkHeight;
  const frameDepth = frame?.depth ?? 0;

  const artworkX = (frameWidth - artworkWidth) / 2;
  const artworkY = (frameHeight - artworkHeight) / 2;

  const backgroundStyle = {
    mint: tw`text-mint-200`,
    pink: tw`text-pink-200`,
    navy: tw`text-navy-200`,
    paper: tw`text-paper-200`,
  }[themeCtx?.color ?? 'mint'];

  return (
    <ArtworkDetails data={data} disabled={!isLoaded || !gridCtx || disabled}>
      <svg
        id={`artwork-${id}`}
        css={[
          tw`h-full`,
          {
            mint: tw`bg-mint-300`,
            pink: tw`bg-mint-300`, // TODO: update
            navy: tw`bg-navy-100`,
            paper: tw`bg-mint-300`, // TODO: update
          }[themeCtx?.color ?? 'mint'],
          // !!gridCtx && isLoaded && css({ boxShadow }),
        ]}
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
              <path
                id={`artwork-${id}-window`}
                d={CanvasUtils.getLineCommands([
                  {
                    x: frame.windowX1,
                    y: frame.windowY1,
                  },
                  {
                    x: frame.windowX2,
                    y: frame.windowY2,
                  },
                  {
                    x: frame.windowX3,
                    y: frame.windowY3,
                  },
                  {
                    x: frame.windowX4,
                    y: frame.windowY4,
                  },
                ])}
              />

              {/* Define window inner shadow (https://stackoverflow.com/a/53503687) */}
              <filter id={`artwork-${id}-inner-shadow`}>
                {/* Shadow Offset */}
                <feOffset dx={0} dy={0} />
                {/* Shadow Blur */}
                <feGaussianBlur stdDeviation={0.15 * frameDepth} result="offset-blur" />
                {/* Invert the drop shadow to create an inner shadow */}
                <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                {/* Color & opacity */}
                <feFlood floodColor={theme`colors.black`} floodOpacity={0.5} result="color" />
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
              css={[!isLoaded && tw`opacity-0`]}
              href={frame.src}
              preserveAspectRatio="none"
              x={0}
              y={0}
              width={frameWidth}
              height={frameHeight}
            />

            {/* Render frame window when loading, and frame mat when loaded */}
            <use
              css={[tw`fill-current`, isArtworkLoaded ? tw`text-paper-200` : backgroundStyle]}
              href={`#artwork-${id}-window`}
            />

            {/* Render bezel for the frame mat */}
            {isArtworkLoaded && (
              <g id={`artwork-${id}-mat-bezel`} mask={`url(#artwork-${id}-window-mask)`}>
                {/* Render base light of the bezel */}
                <rect
                  css={tw`fill-current text-white`}
                  x={artworkX - BEZEL}
                  y={artworkY - BEZEL}
                  width={artworkWidth + BEZEL * 2}
                  height={artworkHeight + BEZEL * 2}
                />
                {/* Render shadow sides of bezel */}
                <path
                  css={tw`fill-current text-black text-opacity-40`}
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
                  css={tw`fill-current text-black text-opacity-20`}
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
                  css={tw`fill-current text-paper-300`}
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
          css={[!isLoaded && tw`opacity-0`]}
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
            css={[tw`fill-current`]}
            href={`#artwork-${id}-window`}
            filter={`url(#artwork-${id}-inner-shadow)`}
          />
        )}
      </svg>
    </ArtworkDetails>
  );
};

export default ArtworkComponent;
