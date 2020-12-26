import { Fragment } from 'react';
import { useRouteMatch, Link, useHistory } from 'react-router-dom';
import tw from 'twin.macro';
import Portal from '@src/components/Portal';
import MuseumCollection from './MuseumCollection';
import MuseumMap from './MuseumMap';
import { useMuseum } from '@src/providers/MuseumProvider';
import CollectionViewIcon from '@src/svgs/CollectionViewIcon';
import MapViewIcon from '@src/svgs/MapViewIcon';

const MuseumHome = () => {
  const history = useHistory();
  const { museum } = useMuseum();

  const collectionMatch = useRouteMatch({
    path: '/museum/:museumId/collection',
    exact: true,
  });
  const isCollectionView = !!collectionMatch;

  const toggleView = () => {
    let toggleLink = `/museum/${museum.id}/collection`;
    if (isCollectionView) {
      toggleLink = `/museum/${museum.id}`;
    }
    history.replace(toggleLink);
  };

  return (
    <Fragment>
      <Portal to="nav-left" prepend>
        <Link to={`/museum/${museum.id}/about`}>About</Link>
      </Portal>
      <Portal to="nav-right" prepend>
        <button
          id="view-toggle"
          css={tw`relative flex bg-gray-300 rounded-full mr-4 focus:outline-none`}
          className="group"
          onClick={toggleView}
          aria-labelledby="view-toggle-label">
          {/* https://www.w3.org/TR/wai-aria-practices-1.1/#button */}
          <span id="view-toggle-label" css={tw`sr-only`}>
            Switch to {isCollectionView ? 'map' : 'collection'} view
          </span>
          <span
            css={[
              tw`absolute top-0 left-0 bg-white size-8 rounded-full transform-gpu transition-all ease-out`,
              tw`ring-0 ring-black ring-opacity-20 group-focus:ring-2`,
              isCollectionView && tw`translate-x-full`,
            ]}
          />
          <span css={tw`flex items-center justify-center size-8 z-10`}>
            <span css={tw`block size-4`}>
              <CollectionViewIcon />
            </span>
          </span>
          <span css={tw`flex items-center justify-center size-8 z-10`}>
            <span css={tw`block size-4`}>
              <MapViewIcon />
            </span>
          </span>
        </button>
      </Portal>

      {collectionMatch ? <MuseumCollection /> : <MuseumMap />}
    </Fragment>
  );
};

export default MuseumHome;
