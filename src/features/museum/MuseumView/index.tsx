import { useState } from 'react';
import dayjs from 'dayjs';
import Button from '@src/components/Button';
import { SEO } from '@src/components/SEO';
import { UserTag } from '@src/components/UserTag';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto } from '@src/data/serializers/museum.serializer';
import { CreateGalleryModal } from '@src/features/gallery/CreateGalleryModal';
import { EditMuseumModal } from '@src/features/museum/EditMuseumModal';
import GalleryBlock from '@src/features/museum/GalleryBlock';
import { useAuth } from '@src/providers/AuthProvider';
import { EditIcon } from '@src/svgs/icons/EditIcon';
import { ShareIcon } from '@src/svgs/icons/ShareIcon';
import { EmptyGalleryIllustration } from '@src/svgs/illustrations/EmptyGalleryIllustration';
import { shareUrl } from '@src/utils/shareUrl';
import styles from './museumView.module.scss';

export interface MuseumViewProps {
  galleries: GalleryDto[];
  museum: MuseumDto;
}

export const MuseumView = (initProps: MuseumViewProps) => {
  const [museum, setMuseum] = useState(initProps.museum);
  const [galleries, setGalleries] = useState(initProps.galleries);

  const auth = useAuth();
  const isCurrentUser = auth.user?.id === museum.curator.id;

  return (
    <div className={styles.page}>
      <SEO title={museum.name} />

      <header className={styles.header}>
        <h1 className={styles.title}>{museum.name}</h1>

        <p>
          Curated by <UserTag className={styles.userTag} user={museum.curator} />
        </p>

        <p className={styles.established}>Est. {dayjs(museum.addedAt).year()}</p>

        <p>{museum.description}</p>

        <div className={styles.actions}>
          {isCurrentUser && (
            <EditMuseumModal
              museum={museum}
              galleries={galleries}
              onSave={({ galleries, ...museum }) => {
                setMuseum(museum);
                setGalleries(galleries);
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
            onClick={() => shareUrl(`/museum/${museum.id}`)}>
            Share
          </Button>
        </div>
      </header>

      <div className={styles.main}>
        {!galleries.length ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIllo}>
              <EmptyGalleryIllustration />
            </div>
            <p className={styles.emptyStateText}>
              {isCurrentUser ? 'Your' : 'This'} museum is empty.
            </p>
            {isCurrentUser && (
              <CreateGalleryModal
                onSave={() => {
                  // Do nothing on save — wait for complete
                }}
                onComplete={data => {
                  setGalleries([data, ...galleries]);
                }}
                trigger={<Button className={styles.emptyStateAction}>Create gallery</Button>}
              />
            )}
          </div>
        ) : (
          <ul className={styles.galleryList}>
            {galleries.map(gallery => (
              <li key={gallery.id} className={styles.galleryListItem}>
                <GalleryBlock museum={museum} gallery={gallery} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
