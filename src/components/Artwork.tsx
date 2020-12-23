import { useState, Fragment } from 'react';
import dayjs from 'dayjs';
import { rgba } from 'polished';
import { Link, useParams } from 'react-router-dom';
import tw, { css, theme } from 'twin.macro';
import IconButton from '@src/components/IconButton';
import Close from '@src/svgs/Close';
import Edit from '@src/svgs/Edit';
import Fullscreen from '@src/svgs/Fullscreen';
import Trash from '@src/svgs/Trash';
import { Artwork as ArtworkData, MuseumCollectionItem } from '@src/types';
import Popover from './Popover';

export type ArtworkProps = {
  data: ArtworkData | MuseumCollectionItem;
  withShadow?: boolean;
};

const Artwork = ({ data, withShadow }: ArtworkProps) => {
  const { museumId } = useParams<{ museumId: string }>();

  const [isFrameLoaded, setIsFrameLoaded] = useState(false);
  const [isArtworkLoaded, setIsArtworkLoaded] = useState(false);

  const { id, title, artist, description, acquiredAt, createdAt, frame, src, alt } = data;
  const { width: frameWidth, height: frameHeight } = frame.dimensions;
  const { width: windowWidth, height: windowHeight } = frame.window.dimensions;

  const loaded = isFrameLoaded && isArtworkLoaded;

  return (
    <Popover
      css={tw`h-full`}
      id={`artwork-${id}-details`}
      position="right"
      align="top"
      renderHeader={({ closePopover }) => (
        <div css={tw`flex justify-between`}>
          <div css={tw`flex mr-3`}>
            <div css={tw`mr-3`}>
              <IconButton title="Expand artwork">
                <Fullscreen />
              </IconButton>
            </div>
            <div css={tw`mr-3`}>
              <IconButton title="Edit artwork">
                <Edit />
              </IconButton>
            </div>
            <div>
              <IconButton title="Delete artwork">
                <Trash />
              </IconButton>
            </div>
          </div>
          <div>
            <IconButton title="Close" onClick={closePopover}>
              <Close />
            </IconButton>
          </div>
        </div>
      )}
      renderBody={() => (
        <Fragment>
          <header css={tw`mb-4`}>
            <h1 css={tw`font-serif text-xl`}>{title}</h1>
            <p>
              <span>{artist ? artist.name : 'Unknown'}</span>,{' '}
              <time dateTime={createdAt.toString()}>{dayjs(createdAt).year()}</time>
            </p>
            <p css={tw`text-sm`}>
              {frame.window.dimensions.width} x {frame.window.dimensions.height} in.
            </p>
          </header>
          <p css={tw`text-sm`}>{description}</p>
          {(acquiredAt || 'gallery' in data) && (
            <div css={tw`italic mt-8`}>
              {acquiredAt && (
                <p css={tw`text-sm`}>
                  Acquired <time dateTime={acquiredAt.toString()}>{dayjs(acquiredAt).year()}</time>
                </p>
              )}
              {'gallery' in data && (
                <p css={tw`text-sm`}>
                  Featured in the{' '}
                  <Link
                    css={tw`text-black underline`}
                    to={`/museum/${museumId}/gallery/${data.gallery.id}`}>
                    {data.gallery.name}
                  </Link>
                </p>
              )}
            </div>
          )}
        </Fragment>
      )}>
      {({ openPopover, triggerProps }) => (
        <Fragment>
          <svg
            id={`artwork-${id}`}
            css={[
              tw`bg-mint-300 h-full`,
              withShadow &&
                loaded &&
                css`
                  // TODO: scale shadow with grid
                  box-shadow: calc(${frameWidth} * 0.3px) calc(${frameHeight} * 0.7px)
                      calc(${frame.depth} * 5px) 1px ${rgba(theme`colors.mint.800`, 0.1)},
                    calc(${frameWidth} * 0.5px) calc(${frameHeight} * 0.75px)
                      calc(${frame.depth} * 5px) -2px ${rgba(theme`colors.mint.800`, 0.15)},
                    calc(${frameWidth} * -1px) calc(${frameHeight} * -1px)
                      calc(${frame.depth} * 7px) 1px ${rgba(theme`colors.white`, 0.3)};
                `,
            ]}
            xmlns="http://www.w3.org/2000/svg"
            aria-labelledby={`artwork-${id}-title`}
            aria-describedby={`artwork-${id}-desc`}
            viewBox={`0 0 ${frameWidth} ${frameHeight}`}>
            <title id={`artwork-${id}-title`}>{title}</title>
            <desc id={`artwork-${id}-desc`}>{alt}</desc>
            <image
              css={[!loaded && tw`opacity-0`]}
              href={frame.src}
              preserveAspectRatio="xMinYMin slice"
              x="0"
              y="0"
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
              css={[!loaded && tw`opacity-0`]}
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
            css={tw`absolute inset-0 size-full cursor-pointer`}
            title="Expand"
            aria-label={`Expand details for artwork "${title}"`}
            {...triggerProps}
            onClick={openPopover}
          />
        </Fragment>
      )}
    </Popover>
  );
};

export default Artwork;
