import React from 'react';
import { useParams, Link } from 'react-router-dom';
import useSWR from 'swr';

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
        {data.map(({ id, title, src, alt, gallery }) => (
          <li key={id}>
            <p>{title}</p>
            <p>
              Featured in the{' '}
              <Link to={`/museum/${museumId}/gallery/${gallery.id}`}>{gallery.name}</Link>
            </p>
            <img src={src} alt={alt} width="100" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MuseumCollection;
