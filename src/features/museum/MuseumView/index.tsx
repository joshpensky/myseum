import dayjs from 'dayjs';
import Button from '@src/components/Button';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto } from '@src/data/serializers/museum.serializer';
import GalleryBlock from '@src/features/museum/GalleryBlock';
import { useAuth } from '@src/providers/AuthProvider';
import { EditIcon } from '@src/svgs/EditIcon';
import { ShareIcon } from '@src/svgs/ShareIcon';
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
        <p>Curated by {museum.curator.name}</p>
        <p>Est. {dayjs(museum.addedAt).year()}</p>
        <p>{museum.description}</p>

        <div className={styles.actions}>
          {auth.user?.id === museum.curator.id && (
            <Button className={styles.actionsItem} icon={EditIcon}>
              Edit
            </Button>
          )}
          <Button className={styles.actionsItem} icon={ShareIcon}>
            Share
          </Button>
        </div>
      </header>

      <div className={styles.main}>
        <ul>
          {galleries.map(gallery => (
            <li key={gallery.id}>
              <GalleryBlock museum={museum} gallery={gallery} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
