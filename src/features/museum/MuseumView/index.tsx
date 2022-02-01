import dayjs from 'dayjs';
import Button from '@src/components/Button';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto } from '@src/data/serializers/museum.serializer';
import GalleryBlock from '@src/features/museum/GalleryBlock';
import { useAuth } from '@src/providers/AuthProvider';

export interface MuseumViewProps {
  galleries: GalleryDto[];
  museum: MuseumDto;
}

export const MuseumView = ({ galleries, museum }: MuseumViewProps) => {
  const auth = useAuth();

  return (
    <div>
      <h1>{museum.name}</h1>
      <p>Curated by {museum.curator.name}</p>
      <p>Est. {dayjs(museum.addedAt).year()}</p>
      <p>{museum.description}</p>

      {auth.user?.id === museum.curator.id && <Button>Edit</Button>}

      <Button>Share</Button>

      <ul>
        {galleries.map(gallery => (
          <li key={gallery.id}>
            <GalleryBlock museum={museum} gallery={gallery} />
          </li>
        ))}
      </ul>
    </div>
  );
};
