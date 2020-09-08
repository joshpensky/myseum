import React, { useState, useLayoutEffect } from 'react';
import Grid from '@src/components/Grid';
import GridItem from '@src/components/GridItem';
import styles from './gallery.module.scss';
import Portal from '@src/components/Portal';
import { Link, useParams, useHistory } from 'react-router-dom';
import useSWR from 'swr';
import NotFound from '@src/pages/NotFound';

const Gallery = () => {
  const history = useHistory();
  const { museumId, galleryId } = useParams();

  const { data: gallery, error } = useSWR(() => `/api/galleries/${galleryId}`);

  const [wallHeight, setWallHeight] = useState(0);

  useLayoutEffect(() => {
    if (gallery) {
      setWallHeight(gallery.height);
    }
  }, [gallery]);

  if (!gallery && !error) {
    return <p>Loading...</p>;
  } else if (error) {
    return <NotFound />;
  }

  const { artwork } = gallery;

  const minHeight = artwork.reduce((acc, { item, position }) => {
    const y2 = position.y + Math.ceil(item.frame.dimensions.height);
    return acc > y2 ? acc : y2;
  }, 0);

  const minColumns = artwork.reduce((acc, { item, position }) => {
    const x2 = position.x + Math.ceil(item.frame.dimensions.width);
    return acc > x2 ? acc : x2;
  }, 0);

  return (
    <div className={styles.container}>
      <Portal to="nav-left" prepend>
        <button onClick={history.goBack}>Back</button>
      </Portal>
      <Portal to="nav-center" prepend>
        <Link to={`/museum/${museumId}/gallery/${galleryId}`}>
          <h1>{gallery.name}</h1>
        </Link>
      </Portal>

      <div>
        <label htmlFor="wallHeight">Wall Height</label>
        <input
          id="wallHeight"
          type="number"
          step={1}
          min={minHeight}
          value={wallHeight}
          onChange={e => setWallHeight(Number(e.target.value))}
        />
        in
      </div>

      <Grid rows={wallHeight} minColumns={minColumns}>
        {artwork.map(({ item, position }, idx) => (
          <GridItem key={idx} item={item} position={position} />
        ))}
      </Grid>
    </div>
  );
};

export default Gallery;
