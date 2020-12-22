import { useState, useLayoutEffect, ChangeEvent } from 'react';
import Grid from '@src/components/Grid';
import GridItem from '@src/components/GridItem';
import styles from './museumGallery.module.scss';
import Portal from '@src/components/Portal';
import { Link, useParams } from 'react-router-dom';
import useSWR from 'swr';
import NotFound from '@src/pages/NotFound';
import { Gallery } from '@src/types';
import FloatingActionButton from '@src/components/FloatingActionButton';
import Edit from '@src/svgs/Edit';

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
    <div className={styles.container}>
      <Portal to="nav-left" prepend>
        <Link to={`/museum/${museumId}`}>Back</Link>
      </Portal>
      <Portal to="nav-center" prepend>
        <Link to={`/museum/${museumId}/gallery/${galleryId}`}>
          <h1>{gallery.name}</h1>
        </Link>
      </Portal>

      <div className={styles.fabWrapper}>
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
