import dayjs from 'dayjs';
import Button from '@src/components/Button';
import { UserTag } from '@src/components/UserTag';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto } from '@src/data/serializers/museum.serializer';
import GalleryBlock from '@src/features/museum/GalleryBlock';
import { useAuth } from '@src/providers/AuthProvider';
import { EditIcon } from '@src/svgs/EditIcon';
import { EmptyGalleryIllustration } from '@src/svgs/EmptyGalleryIllustration';
import { ShareIcon } from '@src/svgs/ShareIcon';
import { shareUrl } from '@src/utils/shareUrl';
import styles from './museumView.module.scss';

export interface MuseumViewProps {
  galleries: GalleryDto[];
  museum: MuseumDto;
}

export const MuseumView = ({ galleries, museum }: MuseumViewProps) => {
  const auth = useAuth();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{museum.name}</h1>
        <p>
          Curated by <UserTag user={museum.curator} />
        </p>
        <p className={styles.established}>Est. {dayjs(museum.addedAt).year()}</p>

        <p>{museum.description}</p>

        <div className={styles.actions}>
          {auth.user?.id === museum.curator.id && (
            <Button className={styles.actionsItem} icon={EditIcon}>
              Edit
            </Button>
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
            <p className={styles.emptyStateText}>You have no galleries.</p>
            <Button className={styles.emptyStateAction}>Create gallery</Button>
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
