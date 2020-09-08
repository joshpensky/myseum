import React from 'react';
import { Link, useParams } from 'react-router-dom';
import useMuseum from '@src/hooks/useMuseum';

const MuseumMap = () => {
  const { museumId } = useParams();

  const { museum, isLoading, error } = useMuseum(museumId);

  if (isLoading) {
    return <p>Loading...</p>;
  } else if (error) {
    return <p>Error :(</p>;
  }

  return (
    <div>
      <h1>Map</h1>

      <ul>
        {museum.galleries.map(({ item, position }) => (
          <li key={item.id}>
            <Link to={`/museum/${museumId}/gallery/${item.id}`}>
              <p>{item.name}</p>
              <p>Est. {item.established}</p>
              <p>
                ({position.x}, {position.y})
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MuseumMap;
