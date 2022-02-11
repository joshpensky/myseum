import { Dispatch, SetStateAction, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import Button from '@src/components/Button';
import { UserTag } from '@src/components/UserTag';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { GridArtwork } from '@src/features/gallery/GridArtwork';
import { EditGalleryModal } from '@src/features/gallery/_new/EditGalleryModal';
import * as Grid from '@src/features/grid';
import { useAuth } from '@src/providers/AuthProvider';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import { EditIcon } from '@src/svgs/EditIcon';
import { PlacedArtworkIllustration } from '@src/svgs/PlacedArtworkIllustration';
import { ShareIcon } from '@src/svgs/ShareIcon';
import { PageComponent } from '@src/types';
import { shareUrl } from '@src/utils/shareUrl';
import styles from './galleryView.module.scss';

export interface GalleryViewProps {
  gallery: GalleryDto;
}

export interface GalleryViewComputedProps {
  gallery: GalleryDto;
  setGallery: Dispatch<SetStateAction<GalleryDto>>;
}

export const GalleryView: PageComponent<GalleryViewProps, GalleryViewComputedProps> = ({
  gallery,
  setGallery,
}) => {
  const auth = useAuth();
  const isCurrentUser = auth.user?.id === gallery.museum.curator.id;

  const [openedArtworkId, setOpenedArtworkId] = useState<number | null>(null);
  const width = Math.max(
    ...gallery.artworks.map(artwork => artwork.position.x + artwork.size.width),
  );

  return (
    <ThemeProvider theme={{ color: gallery.color }}>
      <div className={styles.page}>
        <header className={styles.header}>
          <Link href={isCurrentUser ? '/' : `/museum/${gallery.museum.id}`}>
            <a className={styles.museum}>{gallery.museum.name}</a>
          </Link>

          <h1 className={styles.title}>{gallery.name}</h1>

          <p>
            Curated by <UserTag className={styles.userTag} user={gallery.museum.curator} />
          </p>

          <p className={styles.established}>Est. {dayjs(gallery.addedAt).year()}</p>

          <p>{gallery.description}</p>

          <div className={styles.actions}>
            {isCurrentUser && (
              <EditGalleryModal
                gallery={gallery}
                onSave={gallery => {
                  setGallery(gallery);
                }}
                trigger={
                  <Button className={styles.actionsItem} icon={EditIcon}>
                    Edit
                  </Button>
                }
              />
            )}

            <Button
              className={styles.actionsItem}
              icon={ShareIcon}
              onClick={() => shareUrl(`/museum/${gallery.museum.id}/gallery/${gallery.id}`)}>
              Share
            </Button>
          </div>
        </header>

        <div className={styles.main}>
          {!gallery.artworks.length ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIllo}>
                <PlacedArtworkIllustration />
              </div>
              <p className={styles.emptyStateText}>
                {isCurrentUser ? 'Your' : 'This'} gallery is empty.
              </p>
              {isCurrentUser && <Button className={styles.emptyStateAction}>Add artwork</Button>}
            </div>
          ) : (
            <Grid.Root
              preview
              size={{ width, height: gallery.height }}
              items={gallery.artworks}
              step={1}
              getItemId={item => String(item.artwork.id)}
              renderItem={(item, props) => (
                <GridArtwork
                  {...props}
                  item={item}
                  disabled={
                    props.disabled ||
                    (openedArtworkId !== null && openedArtworkId !== item.artwork.id)
                  }
                  onDetailsOpenChange={open => {
                    if (open) {
                      setOpenedArtworkId(item.artwork.id);
                    } else {
                      setOpenedArtworkId(null);
                    }
                  }}
                />
              )}>
              <Grid.Grid className={styles.grid} />
            </Grid.Root>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
};

GalleryView.useComputedProps = props => {
  const [gallery, setGallery] = useState(props.gallery);

  return {
    global: {
      theme: {
        color: gallery.color,
      },
    },
    page: {
      gallery,
      setGallery,
    },
  };
};
