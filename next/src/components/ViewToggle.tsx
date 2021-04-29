import { useRouter } from 'next/router';
import tw from 'twin.macro';
import CollectionViewIcon from '@src/svgs/CollectionViewIcon';
import MapViewIcon from '@src/svgs/MapViewIcon';

const ViewToggle = () => {
  const router = useRouter();

  const isCollectionView = router.pathname === '/museums/[museumId]/collection';

  const toggleView = () => {
    let toggleLink = `/museums/[museumId]/collection`;
    if (isCollectionView) {
      toggleLink = `/museums/[museumId]`;
    }
    router.push({ pathname: toggleLink, query: router.query });
  };

  return (
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
          <MapViewIcon />
        </span>
      </span>
      <span css={tw`flex items-center justify-center size-8 z-10`}>
        <span css={tw`block size-4`}>
          <CollectionViewIcon />
        </span>
      </span>
    </button>
  );
};

export default ViewToggle;
