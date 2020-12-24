import { Fragment } from 'react';
import { useRouteMatch, Link } from 'react-router-dom';
import tw from 'twin.macro';
import Portal from '@src/components/Portal';
import MuseumCollection from './MuseumCollection';
import MuseumMap from './MuseumMap';
import { useMuseum } from '@src/providers/MuseumProvider';

const MuseumHome = () => {
  const { museum } = useMuseum();

  const collectionMatch = useRouteMatch({
    path: '/museum/:museumId/collection',
    exact: true,
  });

  let toggleLink = `/museum/${museum.id}/collection`;
  if (collectionMatch) {
    toggleLink = `/museum/${museum.id}`;
  }

  return (
    <Fragment>
      <Portal to="nav-left" prepend>
        <Link to={`/museum/${museum.id}/about`}>About</Link>
      </Portal>
      <Portal to="nav-right" prepend>
        <Link css={tw`mr-6`} to={toggleLink} replace>
          Go to {collectionMatch ? 'map' : 'collection'}
        </Link>
      </Portal>

      {collectionMatch ? <MuseumCollection /> : <MuseumMap />}
    </Fragment>
  );
};

export default MuseumHome;
