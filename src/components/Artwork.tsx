import { useState } from 'react';
import { rgba } from 'polished';
import tw, { css, theme } from 'twin.macro';
import ArtworkDetails from '@src/components/ArtworkDetails';
import { Artwork as ArtworkData, MuseumCollectionItem } from '@src/types';
import { useGrid } from '@src/providers/GridProvider';
import { useTheme } from '@src/providers/ThemeProvider';

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
  const { width: windowWidth, height: windowHeight } = frame.window.dimensions;

  const isLoaded = isFrameLoaded && isArtworkLoaded;

  /**
   * Gets the pixel value for a shadow, scaled to the grid item size.
   *
   * @param value the value to scale
   */
  const px = (value: number) => `${value * ((gridCtx?.itemSize ?? 0) / 25)}px`;

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

        {/* Define inner shadow */}
        <defs>
          <filter id={`artwork-${id}-inner-shadow`}>
            {/* Shadow Offset */}
            <feOffset dx={0} dy={0} />
            {/* Shadow Blur */}
            <feGaussianBlur stdDeviation={0.15 * frame.depth} result="offset-blur" />
            {/* Invert the drop shadow to create an inner shadow */}
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            {/* Color & Opacity */}
            <feFlood floodColor={theme`colors.black`} floodOpacity={0.5} result="color" />
            {/* Clip color inside shadow */}
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            {/* Put shadow over original object */}
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
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

        {/* Render frame window (for loading state) */}
        <rect
          css={[
            tw`fill-current`,
            {
              mint: tw`text-mint-200`,
              pink: tw`text-pink-200`,
              navy: tw`text-navy-200`,
              paper: tw`text-paper-200`,
            }[themeCtx?.color ?? 'mint'],
          ]}
          x={frame.window.position.x}
          y={frame.window.position.y}
          width={windowWidth}
          height={windowHeight}
        />

        {/* Render artwork image */}
        <image
          css={[!isLoaded && tw`opacity-0`]}
          href={src}
          preserveAspectRatio="xMinYMin slice"
          x={frame.window.position.x}
          y={frame.window.position.y}
          width={windowWidth}
          height={windowHeight}
          filter={`url(#artwork-${id}-inner-shadow)`}
          onLoad={() => setIsArtworkLoaded(true)}
        />
      </svg>
    </ArtworkDetails>
  );
};

export default Artwork;
