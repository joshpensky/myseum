import { Link, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { Museum } from '@src/types';

const MuseumMap = () => {
  const { museumId } = useParams<{ museumId: string }>();

  const { data, error } = useSWR<Museum>(`/api/museums/${museumId}`);

  if (error) {
    return <p>Error :(</p>;
  } else if (!data) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Map</h1>

      <ul>
        {data.galleries.map(({ item, position }) => (
          <li key={item.id}>
            <Link to={`/museum/${museumId}/gallery/${item.id}`}>
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
