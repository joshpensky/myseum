import React from 'react';
import { useParams, Link } from 'react-router-dom';
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

      <ul>
        {data.map(artwork => (
          <li key={artwork.id}>
            <p>{artwork.title}</p>
            <p>
              Featured in the{' '}
              <Link to={`/museum/${museumId}/gallery/${artwork.gallery.id}`}>
                {artwork.gallery.name}
              </Link>
            </p>
            <div className={styles.artwork} style={{ height: 200 }}>
              <Artwork data={artwork} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MuseumCollection;
