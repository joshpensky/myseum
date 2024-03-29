import { Dispatch, SetStateAction, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import Button from '@src/components/Button';
import { SEO } from '@src/components/SEO';
import { UserTag } from '@src/components/UserTag';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { AddArtworkModal } from '@src/features/gallery/AddArtworkModal';
import { EditGalleryModal } from '@src/features/gallery/EditGalleryModal';
import { GridArtwork } from '@src/features/gallery/GridArtwork';
import * as Grid from '@src/features/grid';
import { useAuth } from '@src/providers/AuthProvider';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import { EditIcon } from '@src/svgs/icons/EditIcon';
import { ShareIcon } from '@src/svgs/icons/ShareIcon';
import { PlacedArtworkIllustration } from '@src/svgs/illustrations/PlacedArtworkIllustration';
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

  const [openedArtworkId, setOpenedArtworkId] = useState<string | null>(null);
  const width = 10 + Math.max(...gallery.artworks.map(item => item.position.x + item.size.width));

  return (
    <ThemeProvider theme={{ color: gallery.color }}>
      <SEO title={`${gallery.name} | ${gallery.museum.name}`} />

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
              {isCurrentUser && (
                <AddArtworkModal
                  gallery={gallery}
                  onSave={artwork => {
                    setGallery(gallery => ({
                      ...gallery,
                      artworks: [...gallery.artworks, artwork],
                    }));
                  }}
                  trigger={<Button className={styles.emptyStateAction}>Add artwork</Button>}
                />
              )}
            </div>
          ) : (
            <Grid.Root
              size={{ width, height: gallery.height }}
              items={gallery.artworks}
              step={1}
              getItemId={item => item.id}
              renderItem={(item, props) => (
                <GridArtwork
                  {...props}
                  item={item}
                  disabled={
                    props.disabled || (openedArtworkId !== null && openedArtworkId !== item.id)
                  }
                  onDetailsOpenChange={open => {
                    if (open) {
                      setOpenedArtworkId(item.id);
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
