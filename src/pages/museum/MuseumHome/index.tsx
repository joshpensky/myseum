import { Fragment } from 'react';
import { useRouteMatch, Link, useParams } from 'react-router-dom';
import Portal from '@src/components/Portal';
import MuseumCollection from './MuseumCollection';
import MuseumMap from './MuseumMap';

const MuseumHome = () => {
  const { museumId } = useParams<{ museumId: string }>();

  const collectionMatch = useRouteMatch({
    path: '/museum/:museumId/collection',
    exact: true,
  });

  let toggleLink = `/museum/${museumId}/collection`;
  if (collectionMatch) {
    toggleLink = `/museum/${museumId}`;
  }

  return (
    <Fragment>
      <Portal to="nav-left" prepend>
        <Link to={`/museum/${museumId}/about`}>About</Link>
      </Portal>
      <Portal to="nav-right" prepend>
        <Link to={toggleLink} replace>
          Go to {collectionMatch ? 'map' : 'collection'}
        </Link>
      </Portal>

      {collectionMatch ? <MuseumCollection /> : <MuseumMap />}
    </Fragment>
  );
};

export default MuseumHome;
