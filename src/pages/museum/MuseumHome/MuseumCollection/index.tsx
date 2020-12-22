import { MuseumCollectionItem } from '@src/types';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import Artwork from '@src/components/Artwork';
import styles from './museumCollection.module.scss';

const MuseumCollection = () => {
  const { museumId } = useParams<{ museumId: string }>();

  const { data, error } = useSWR<MuseumCollectionItem[]>(`/api/museums/${museumId}/collection`);

  if (error) {
    return <p>Error :(</p>;
  } else if (!data) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Collection</h1>
      <p>
        {data.length} item{data.length === 1 ? '' : 's'}
      </p>

      <ul className={styles.collection}>
        {data.map(artwork => (
          <li key={artwork.id} className={styles.artwork}>
            <Artwork data={artwork} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MuseumCollection;
