import { useState } from 'react';
import dayjs from 'dayjs';
import Button from '@src/components/Button';
import { UserTag } from '@src/components/UserTag';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { GridArtwork } from '@src/features/gallery/GridArtwork';
import { Grid } from '@src/features/grid/Grid';
import { useAuth } from '@src/providers/AuthProvider';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import { EditIcon } from '@src/svgs/EditIcon';
import { ShareIcon } from '@src/svgs/ShareIcon';
import { PageComponent } from '@src/types';
import { shareUrl } from '@src/utils/shareUrl';
import styles from './galleryView.module.scss';
import { EditGalleryModal } from '../EditGalleryModal';

export interface GalleryViewProps {
  gallery: GalleryDto;
}

export const GalleryView: PageComponent<GalleryViewProps> = (initProps: GalleryViewProps) => {
  const auth = useAuth();

  const [gallery, setGallery] = useState(initProps.gallery);

  let width = Math.max(...gallery.artworks.map(artwork => artwork.position.x + artwork.size.width));
  width = 100;
  const [openedArtworkId, setOpenedArtworkId] = useState<number | null>(null);

  return (
    <ThemeProvider theme={{ color: gallery.color }}>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>{gallery.name}</h1>

          <p>
            Curated by <UserTag className={styles.userTag} user={gallery.museum.curator} />
          </p>

          <p className={styles.established}>Est. {dayjs(gallery.addedAt).year()}</p>

          <p>{gallery.description}</p>

          <div className={styles.actions}>
            {auth.user?.id === gallery.museum.curator.id && (
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
          <Grid
            className={styles.grid}
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
            )}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

GalleryView.getGlobalLayoutProps = ({ gallery }) => ({
  theme: {
    color: gallery.color,
  },
});
