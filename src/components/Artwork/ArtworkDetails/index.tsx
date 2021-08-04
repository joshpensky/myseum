import { Fragment, PropsWithChildren } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import IconButton from '@src/components/IconButton';
import { Popover } from '@src/components/Popover';
import { ArtworkDto } from '@src/data/ArtworkSerializer';
import { GalleryDto } from '@src/data/GallerySerializer';
import Edit from '@src/svgs/Edit';
import Fullscreen from '@src/svgs/Fullscreen';
import styles from './artworkDetails.module.scss';

export interface ArtworkDetailProps {
  data: ArtworkDto;
  galleries?: Omit<GalleryDto, 'artworks'>[];
  onOpenChange?(open: boolean): void;
}

const ArtworkDetails = ({
  children,
  data,
  galleries,
  onOpenChange,
}: PropsWithChildren<ArtworkDetailProps>) => {
  const router = useRouter();
  const museumId = router.query.museumId;

  const { title, artist, description, acquiredAt, createdAt } = data;

  return (
    <Popover.Root onOpenChange={open => onOpenChange?.(open)}>
      {children}

      <Popover.Trigger
        className={styles.trigger}
        title="Expand"
        aria-label={`Expand details for artwork "${title}`}
      />

      <Popover.Content side="right" align="start" aria-label={`Details for artwork "${title}"`}>
        <Popover.Header>
          <div className={styles.headerButtons}>
            <IconButton
              className={styles.headerButtonsItem}
              title="Expand artwork"
              tooltipProps={{ side: 'top' }}>
              <Fullscreen />
            </IconButton>
            <IconButton
              className={styles.headerButtonsItem}
              title="Edit artwork"
              tooltipProps={{ side: 'top' }}>
              <Edit />
            </IconButton>
          </div>
        </Popover.Header>

        <Popover.Body>
          <div className={styles.bodyTop}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.credit}>
              <span>{artist ? artist.name : 'Unknown'}</span>,{' '}
              <time dateTime={createdAt.toString()}>{dayjs(createdAt).year()}</time>
            </p>
            <p>
              {data.size.width} <abbr title="by">x</abbr> {data.size.height}{' '}
              <abbr title="inches">in.</abbr>
            </p>
          </div>

          <p className={styles.description}>{description}</p>

          {(acquiredAt || galleries?.length) && (
            <div className={styles.bodyFooter}>
              {acquiredAt && (
                <p className={styles.acquisition}>
                  Acquired <time dateTime={acquiredAt.toString()}>{dayjs(acquiredAt).year()}</time>
                </p>
              )}

              {galleries?.length && (
                <p className={styles.feature}>
                  Featured in{' '}
                  {galleries.map((gallery, idx) => {
                    let separator = '';
                    if (galleries.length === 2 && idx === 0) {
                      separator = ' and ';
                    } else if (galleries.length >= 3) {
                      if (idx === galleries.length - 2) {
                        separator = ', and ';
                      } else if (idx < galleries.length - 2) {
                        separator = ', ';
                      }
                    }

                    return (
                      <Fragment key={gallery.id}>
                        <Link
                          passHref
                          href={{
                            pathname: `/museum/[museumId]/gallery/[galleryId]`,
                            query: { museumId, galleryId: gallery.id },
                          }}>
                          <a>{gallery.name}</a>
                        </Link>
                        {separator}
                      </Fragment>
                    );
                  })}
                </p>
              )}
            </div>
          )}
        </Popover.Body>
      </Popover.Content>
    </Popover.Root>
  );
};

export default ArtworkDetails;
