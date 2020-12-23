import { useState, useEffect, useRef } from 'react';
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
    <span css={[tw`h-full relative`]}>
      <svg
        id={`artwork-${id}`}
        css={[
          tw`bg-mint-500 h-full`,
          withShadow &&
            loaded &&
            css`
              // TODO: scale shadow with grid
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
          css={[tw`fill-current text-mint-400`]}
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
        ref={triggerButtonRef}
        css={[tw`absolute top-0 left-0 w-full h-full cursor-pointer`]}
        title="Expand"
        aria-label={`Expand details for artwork "${title}"`}
        aria-expanded={areDetailsExpanded}
        aria-controls={`artwork-${id}-details`}
        onClick={() => setAreDetailsExpanded(true)}
      />
      <div
        ref={detailsRef}
        id={`artwork-${id}-details`}
        css={[
          tw`absolute top-0 -right-2.5 bg-white rounded-md shadow-xl ring-mint-800 transform translate-x-full w-96`,
          !areDetailsExpanded && tw`pointer-events-none invisible`,
        ]}
        tabIndex={-1}
        aria-modal={true}
        aria-hidden={!areDetailsExpanded}>
        <section css={tw`border-b border-mint-500 flex justify-between py-2 px-5`}>
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
            <IconButton title="Close" onClick={onCloseButton}>
              <Close />
            </IconButton>
          </div>
        </section>
        <section css={tw`p-5`}>
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
        </section>
      </div>
    </span>
  );
};

export default Artwork;
