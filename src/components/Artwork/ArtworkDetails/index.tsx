import { Fragment, PropsWithChildren } from 'react';
import dayjs from 'dayjs';
import IconButton from '@src/components/IconButton';
import { Popover } from '@src/components/Popover';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import { ExpandIcon } from '@src/svgs/icons/ExpandIcon';
import styles from './artworkDetails.module.scss';

export interface ArtworkDetailProps {
  data: ArtworkDto;
  onOpenChange?(open: boolean): void;
}

const ArtworkDetails = ({
  children,
  data,
  onOpenChange,
}: PropsWithChildren<ArtworkDetailProps>) => {
  // const { museum } = useMuseum();

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
            {/* TODO: fullscreen modal */}
            <IconButton className={styles.headerButtonsItem} title="Expand artwork">
              <ExpandIcon />
            </IconButton>
          </div>
        </Popover.Header>

        <Popover.Body>
          <div className={styles.bodyTop}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.credit}>
              <span>{artist ? artist.name : 'Unknown'}</span>
              {createdAt && (
                <Fragment>
                  , <time dateTime={createdAt.toString()}>{dayjs(createdAt).year()}</time>
                </Fragment>
              )}
            </p>
            <p>
              {data.size.width} <abbr title="by">x</abbr> {data.size.height}{' '}
              <abbr title="inches">in.</abbr>
            </p>
          </div>

          <p className={styles.description}>{description}</p>

          {acquiredAt && (
            <div className={styles.bodyFooter}>
              <p className={styles.acquisition}>
                Acquired <time dateTime={acquiredAt.toString()}>{dayjs(acquiredAt).year()}</time>
              </p>
            </div>
          )}
        </Popover.Body>
      </Popover.Content>
    </Popover.Root>
  );
};

export default ArtworkDetails;
