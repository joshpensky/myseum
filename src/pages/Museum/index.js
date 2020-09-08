import React, { Fragment } from 'react';
import { useRouteMatch, Link, useParams } from 'react-router-dom';
import Portal from '@src/components/Portal';
import MuseumCollection from '@src/pages/MuseumCollection';
import MuseumMap from '@src/pages/MuseumMap';

const Museum = () => {
  const { museumId } = useParams();

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

export default Museum;
