import React from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import Artwork from '@src/components/Artwork';
import styles from './museumCollection.module.scss';

const MuseumCollection = () => {
  const { museumId } = useParams();

  const { data, error } = useSWR(`/api/museums/${museumId}/collection`);

  if (!data && !error) {
    return <p>Loading...</p>;
  } else if (error) {
    return <p>Error :(</p>;
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
