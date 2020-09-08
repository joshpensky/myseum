import React from 'react';
import { Link, useParams } from 'react-router-dom';

const MuseumMap = () => {
  const { museumId } = useParams();

  return (
    <div>
      <h1>Map</h1>

      <ul>
        <li>
          <Link to={`/museum/${museumId}/gallery/fine-r-gallery`}>Fine R. Gallery</Link>
        </li>
      </ul>
    </div>
  );
};

export default MuseumMap;
