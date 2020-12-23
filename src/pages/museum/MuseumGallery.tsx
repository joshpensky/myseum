import { useState, useLayoutEffect, ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import useSWR from 'swr';
import tw from 'twin.macro';
import FloatingActionButton from '@src/components/FloatingActionButton';
import Grid from '@src/components/Grid';
import GridItem from '@src/components/GridItem';
import Portal from '@src/components/Portal';
import NotFound from '@src/pages/NotFound';
import Edit from '@src/svgs/Edit';
import { Gallery } from '@src/types';

const MuseumGallery = () => {
  const { museumId, galleryId } = useParams<{ museumId: string; galleryId: string }>();

  const { data: gallery, error } = useSWR<Gallery>(() => `/api/galleries/${galleryId}`);

  const [wallHeight, setWallHeight] = useState(0);
  const onHeightChange = (evt: ChangeEvent<HTMLInputElement>) => {
    let value = evt.target.valueAsNumber;
    if (Number.isNaN(value)) {
      value = 0;
    }
    setWallHeight(value);
  };

  useLayoutEffect(() => {
    if (gallery) {
      setWallHeight(gallery.height);
    }
  }, [gallery]);

  if (error) {
    return <NotFound />;
  } else if (!gallery) {
    return <p>Loading...</p>;
  }

  const { artworks } = gallery;

  const minHeight = artworks.reduce((acc, { item, position }) => {
    const y2 = position.y + Math.ceil(item.frame.dimensions.height);
    return Math.max(acc, y2);
  }, 1);

  const minColumns = artworks.reduce((acc, { item, position }) => {
    const x2 = position.x + Math.ceil(item.frame.dimensions.width);
    return Math.max(acc, x2);
  }, 1);

  return (
    <div css={tw`bg-mint-400 flex flex-col flex-1`}>
      <Portal to="nav-left" prepend>
        <Link to={`/museum/${museumId}`}>Back</Link>
      </Portal>
      <Portal to="nav-center" prepend>
        <Link to={`/museum/${museumId}/gallery/${galleryId}`}>
          <h1>{gallery.name}</h1>
        </Link>
      </Portal>

      <div css={tw`fixed bottom-6 right-6 flex flex-col`}>
        <FloatingActionButton title="Edit">
          <Edit />
        </FloatingActionButton>
      </div>

      <div>
        <label htmlFor="wallHeight">Wall Height</label>
        <input
          id="wallHeight"
          type="number"
          step={1}
          min={minHeight}
          value={wallHeight === 0 ? '' : wallHeight}
          onChange={onHeightChange}
        />
        in
      </div>

      <Grid rows={wallHeight} minColumns={minColumns}>
        {artworks.map(({ item, position }, idx) => (
          <GridItem key={idx} item={item} position={position} />
        ))}
      </Grid>
    </div>
  );
};

export default MuseumGallery;
