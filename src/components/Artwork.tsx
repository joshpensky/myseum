import { useState } from 'react';
import { rgba } from 'polished';
import tw, { css, theme } from 'twin.macro';
import ArtworkDetails from '@src/components/ArtworkDetails';
import { Artwork as ArtworkData, MuseumCollectionItem } from '@src/types';
import { useGrid } from '@src/providers/GridProvider';
import { useTheme } from '@src/providers/ThemeProvider';
import { CanvasUtils } from '@src/utils/CanvasUtils';

export type ArtworkProps = {
  data: ArtworkData | MuseumCollectionItem;
  withShadow?: boolean;
};

const Artwork = ({ data, withShadow }: ArtworkProps) => {
  const themeCtx = useTheme();
  const gridCtx = useGrid();

  const [isFrameLoaded, setIsFrameLoaded] = useState(false);
  const [isArtworkLoaded, setIsArtworkLoaded] = useState(false);

  const { id, title, frame, src, alt } = data;
  const { width: frameWidth, height: frameHeight } = frame.dimensions;
  const { width: artworkWidth, height: artworkHeight } = data.dimensions;

  const isLoaded = isFrameLoaded && isArtworkLoaded;

  /**
   * Gets the pixel value for a shadow, scaled to the grid item size.
   *
   * @param value the value to scale
   */
  const px = (value: number) => `${value * ((gridCtx?.itemSize ?? 0) / 25)}px`;

  const backgroundColor = {
    mint: tw`text-mint-200`,
    pink: tw`text-pink-200`,
    navy: tw`text-navy-200`,
    paper: tw`text-paper-200`,
  }[themeCtx?.color ?? 'mint'];

  const shadowColor = {
    mint: theme`colors.mint.800`,
    pink: theme`colors.mint.800`, // TODO: update
    navy: theme`colors.navy.50`,
    paper: theme`colors.mint.800`, // TODO: update
  }[themeCtx?.color ?? 'mint'];

  const highlightColor = {
    mint: theme`colors.white`,
    pink: theme`colors.white`, // TODO: update
    navy: theme`colors.navy.800`,
    paper: theme`colors.white`, // TODO: update
  }[themeCtx?.color ?? 'mint'];

  const boxShadow = [
    [
      // Cast small shadow (bottom right)
      px(frameHeight * 0.25),
      px(frameHeight * 0.25),
      px(frame.depth * 5),
      px(-2),
      rgba(shadowColor, 0.25),
    ],
    [
      // Cast larger shadow (bottom right)
      px(frameHeight * 0.75),
      px(frameHeight * 0.75),
      px(frame.depth * 10),
      px(frame.depth * 2),
      rgba(shadowColor, 0.15),
    ],
    [
      // Cast highlight (top left)
      px(frameHeight * -0.5),
      px(frameHeight * -0.5),
      px(frame.depth * 15),
      px(frame.depth),
      rgba(highlightColor, 0.15),
    ],
  ]
    .map(shadowValues => shadowValues.join(' '))
    .join(', ');

  return (
    <ArtworkDetails data={data} disabled={!isLoaded || gridCtx?.asPreview}>
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
          withShadow && isLoaded && css({ boxShadow }),
        ]}
        xmlns="http://www.w3.org/2000/svg"
        aria-labelledby={`artwork-${id}-title`}
        aria-describedby={`artwork-${id}-desc`}
        viewBox={[0, 0, frameWidth, frameHeight].join(' ')}>
        <title id={`artwork-${id}-title`}>{title}</title>
        <desc id={`artwork-${id}-desc`}>{alt}</desc>

        <defs>
          {/* Define artwork drop shadow (https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDropShadow) */}
          <filter id={`artwork-${id}-drop-shadow`}>
            <feDropShadow
              dx="0.025"
              dy="0.025"
              stdDeviation="0.05"
              floodColor="#black"
              floodOpacity="0.2"
            />
          </filter>

          {/* Define window path */}
          <path id={`artwork-${id}-window`} d={CanvasUtils.getLineCommands(frame.window)} />

          {/* Define window inner shadow (https://stackoverflow.com/a/53503687) */}
          <filter id={`artwork-${id}-inner-shadow`}>
            {/* Shadow Offset */}
            <feOffset dx={0} dy={0} />
            {/* Shadow Blur */}
            <feGaussianBlur stdDeviation={0.15 * frame.depth} result="offset-blur" />
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
          onLoad={() => setIsFrameLoaded(true)}
        />

        {/* Render frame window when loading, and frame mat when loaded */}
        <use
          css={[tw`fill-current`, isArtworkLoaded ? tw`text-white` : backgroundColor]}
          href={`#artwork-${id}-window`}
        />

        {/* Render artwork image, centered in frame */}
        <image
          css={[!isLoaded && tw`opacity-0`]}
          href={src}
          preserveAspectRatio="xMinYMin slice"
          x={(frameWidth - artworkWidth) / 2}
          y={(frameHeight - artworkHeight) / 2}
          width={artworkWidth}
          height={artworkHeight}
          mask={`url(#artwork-${id}-window-mask)`}
          filter={`url(#artwork-${id}-drop-shadow)`}
          onLoad={() => setIsArtworkLoaded(true)}
        />

        {/* Render frame inner shadow */}
        {isArtworkLoaded && (
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

export default Artwork;
