import { useState } from 'react';
import { rgba } from 'polished';
import tw, { css, theme } from 'twin.macro';
import ArtworkDetails from '@src/components/ArtworkDetails';
import { Artwork as ArtworkData, MuseumCollectionItem } from '@src/types';

export type ArtworkProps = {
  data: ArtworkData | MuseumCollectionItem;
  withShadow?: boolean;
};

const Artwork = ({ data, withShadow }: ArtworkProps) => {
  const [isFrameLoaded, setIsFrameLoaded] = useState(false);
  const [isArtworkLoaded, setIsArtworkLoaded] = useState(false);

  const { id, title, frame, src, alt } = data;
  const { width: frameWidth, height: frameHeight } = frame.dimensions;
  const { width: windowWidth, height: windowHeight } = frame.window.dimensions;

  const isLoaded = isFrameLoaded && isArtworkLoaded;

  return (
    <ArtworkDetails data={data} disabled={!isLoaded}>
      <svg
        id={`artwork-${id}`}
        css={[
          tw`bg-mint-300 h-full`,
          withShadow &&
            isLoaded &&
            css`
              // TODO: scale shadow with grid
              // TODO: change shadow with theme
              box-shadow: calc(${frameWidth} * 0.3px) calc(${frameHeight} * 0.7px)
                  calc(${frame.depth} * 5px) 1px ${rgba(theme`colors.mint.800`, 0.1)},
                calc(${frameWidth} * 0.5px) calc(${frameHeight} * 0.75px) calc(${frame.depth} * 5px) -2px
                  ${rgba(theme`colors.mint.800`, 0.15)},
                calc(${frameWidth} * -1px) calc(${frameHeight} * -1px) calc(${frame.depth} * 7px)
                  1px ${rgba(theme`colors.white`, 0.3)};
            `,
        ]}
        xmlns="http://www.w3.org/2000/svg"
        aria-labelledby={`artwork-${id}-title`}
        aria-describedby={`artwork-${id}-desc`}
        viewBox={[0, 0, frameWidth, frameHeight].join(' ')}>
        <title id={`artwork-${id}-title`}>{title}</title>
        <desc id={`artwork-${id}-desc`}>{alt}</desc>
        <image
          css={[!isLoaded && tw`opacity-0`]}
          href={frame.src}
          preserveAspectRatio="xMinYMin slice"
          x={0}
          y={0}
          width={frameWidth}
          height={frameHeight}
          onLoad={() => setIsFrameLoaded(true)}
        />
        <rect
          css={tw`fill-current text-mint-200`}
          x={frame.window.position.x}
          y={frame.window.position.y}
          width={windowWidth}
          height={windowHeight}
        />
        {/* LIMITATION: no inset shadow */}
        <image
          css={[!isLoaded && tw`opacity-0`]}
          href={src}
          preserveAspectRatio="xMinYMin slice"
          x={frame.window.position.x}
          y={frame.window.position.y}
          width={windowWidth}
          height={windowHeight}
          onLoad={() => setIsArtworkLoaded(true)}
        />
      </svg>
    </ArtworkDetails>
  );
};

export default Artwork;
