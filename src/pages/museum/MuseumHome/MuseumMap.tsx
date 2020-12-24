import { Link } from 'react-router-dom';
import { useMuseum } from '@src/providers/MuseumProvider';

const MuseumMap = () => {
  const { museum } = useMuseum();
  return (
    <div>
      <h1>Map</h1>

      <ul>
        {museum.galleries.map(({ item, position }) => (
          <li key={item.id}>
            <Link to={`/museum/${museum.id}/gallery/${item.id}`}>
              <p>{item.name}</p>
              <p>Est. {item.createdAt}</p>
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
