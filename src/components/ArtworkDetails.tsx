import { PropsWithChildren } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import tw from 'twin.macro';
import dayjs from 'dayjs';
import IconButton from '@src/components/IconButton';
import Popover, { usePopover } from '@src/components/Popover';
import { useUniqueId } from '@src/hooks/useUniqueId';
import Close from '@src/svgs/Close';
import Edit from '@src/svgs/Edit';
import Fullscreen from '@src/svgs/Fullscreen';
import Trash from '@src/svgs/Trash';
import { Artwork as ArtworkData, MuseumCollectionItem } from '@src/types';

export type ArtworkDetailProps = {
  data: ArtworkData | MuseumCollectionItem;
  disabled?: boolean;
};

const ArtworkDetails = ({ children, data, disabled }: PropsWithChildren<ArtworkDetailProps>) => {
  const router = useRouter();
  const museumId = router.query.museumId;

  const detailsId = useUniqueId();

  const popover = usePopover(`artwork-details-${detailsId}`);

  const { title, artist, description, acquiredAt, createdAt, dimensions } = data;

  return (
    <Popover {...popover.wrapperProps} css={tw`h-full`} disabled={disabled} origin="right top">
      {children}
      {!disabled && (
        <button
          {...popover.anchorProps}
          css={[
            tw`absolute inset-0 size-full cursor-pointer transition-shadow`,
            tw`rounded-sm ring-0 ring-white focus:(outline-none) focus-visible:(ring-6)`,
          ]}
          title="Expand"
          aria-label={`Expand details for artwork "${title}"`}
        />
      )}
      <Popover.Body>
        <header css={tw`py-4 px-5 bg-white flex items-center justify-between rounded-t-lg mb-px`}>
          <div css={tw`flex items-center`}>
            <div css={tw`flex mr-5`}>
              <IconButton title="Expand artwork">
                <Fullscreen />
              </IconButton>
            </div>
            <div css={tw`flex mr-5`}>
              <IconButton title="Edit artwork">
                <Edit />
              </IconButton>
            </div>
            <div css={tw`flex mr-5`}>
              <IconButton title="Delete artwork">
                <Trash />
              </IconButton>
            </div>
          </div>
          <IconButton title="Close" onClick={() => popover.close(true)}>
            <Close />
          </IconButton>
        </header>
        <section css={tw`px-5 pt-4 pb-5 bg-white rounded-b-lg`}>
          <div css={tw`mb-2`}>
            <h1 css={tw`font-serif text-2xl -mb-1`}>{title}</h1>
            <p css={tw`text-lg -mb-0.5`}>
              <span>{artist ? artist.name : 'Unknown'}</span>,{' '}
              <time dateTime={createdAt.toString()}>{dayjs(createdAt).year()}</time>
            </p>
            <p>
              {dimensions.width} x {dimensions.height} in.
            </p>
          </div>
          <p>{description}</p>
          {(acquiredAt || 'gallery' in data) && (
            <div css={tw`italic mt-6`}>
              {acquiredAt && (
                <p css={tw`text-sm`}>
                  Acquired <time dateTime={acquiredAt.toString()}>{dayjs(acquiredAt).year()}</time>
                </p>
              )}
              {'gallery' in data && (
                <p css={tw`text-sm`}>
                  Featured in the{' '}
                  <Link
                    passHref
                    href={{
                      pathname: `/museum/[museumId]/gallery/[galleryId]`,
                      query: { museumId, galleryId: data.gallery.id },
                    }}>
                    <a css={tw`text-black underline`}>{data.gallery.name}</a>
                  </Link>
                </p>
              )}
            </div>
          )}
        </section>
      </Popover.Body>
    </Popover>
  );
};

export default ArtworkDetails;
