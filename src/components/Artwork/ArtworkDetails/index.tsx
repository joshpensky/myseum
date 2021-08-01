import { PropsWithChildren } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Gallery } from '@prisma/client';
import dayjs from 'dayjs';
import type { ArtworkProps } from '@src/components/Artwork';
import IconButton from '@src/components/IconButton';
import { Popover } from '@src/components/Popover';
import Edit from '@src/svgs/Edit';
import Fullscreen from '@src/svgs/Fullscreen';
import styles from './artworkDetails.module.scss';

export interface ArtworkDetailProps {
  data: ArtworkProps['data'];
  gallery?: Gallery;
}

const ArtworkDetails = ({ children, data, gallery }: PropsWithChildren<ArtworkDetailProps>) => {
  const router = useRouter();
  const museumId = router.query.museumId;

  const { title, artist, description, acquiredAt, createdAt } = data;

  return (
    <Popover.Root>
      {children}

      <Popover.Trigger
        className={styles.trigger}
        title="Expand"
        aria-label={`Expand details for artwork "${title}`}
      />

      <Popover.Content side="right" align="start" aria-label={`Details for artwork "${title}"`}>
        <Popover.Header>
          <div className={styles.headerButtons}>
            <IconButton className={styles.headerButtonsItem} title="Expand artwork">
              <Fullscreen />
            </IconButton>
            <IconButton className={styles.headerButtonsItem} title="Edit artwork">
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
              {data.width} <abbr title="by">x</abbr> {data.height} <abbr title="inches">in.</abbr>
            </p>
          </div>

          <p className={styles.description}>{description}</p>

          {(acquiredAt || gallery) && (
            <div className={styles.bodyFooter}>
              {acquiredAt && (
                <p className={styles.acquisition}>
                  Acquired <time dateTime={acquiredAt.toString()}>{dayjs(acquiredAt).year()}</time>
                </p>
              )}

              {gallery && (
                <p className={styles.feature}>
                  Featured in the{' '}
                  <Link
                    passHref
                    href={{
                      pathname: `/museum/[museumId]/gallery/[galleryId]`,
                      query: { museumId, galleryId: gallery.id },
                    }}>
                    <a>{gallery.name}</a>
                  </Link>
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
