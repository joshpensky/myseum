import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import Button from '@src/components/Button';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto } from '@src/data/serializers/museum.serializer';
import GalleryBlock from '@src/features/museum/GalleryBlock';
import { useAuth } from '@src/providers/AuthProvider';
import { EditIcon } from '@src/svgs/EditIcon';
import { EmptyGalleryIllustration } from '@src/svgs/EmptyGalleryIllustration';
import { ShareIcon } from '@src/svgs/ShareIcon';
import styles from './museumView.module.scss';

export interface MuseumViewProps {
  galleries: GalleryDto[];
  museum: MuseumDto;
}

export const MuseumView = ({ galleries, museum }: MuseumViewProps) => {
  const auth = useAuth();
  const router = useRouter();

  const shareLink = async () => {
    const url = `${window.location.origin}${router.pathname}`;

    if ('share' in navigator) {
      await navigator.share({ url });
    } else if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url);
      toast.success('Copied link!');
    } else {
      document.execCommand('copy', false, url);
      toast.success('Copied link!');
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{museum.name}</h1>
        <p>Curated by {museum.curator.name}</p>
        <p>Est. {dayjs(museum.addedAt).year()}</p>
        <p>{museum.description}</p>

        <div className={styles.actions}>
          {auth.user?.id === museum.curator.id && (
            <Button className={styles.actionsItem} icon={EditIcon}>
              Edit
            </Button>
          )}
          <Button className={styles.actionsItem} icon={ShareIcon} onClick={() => shareLink()}>
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
