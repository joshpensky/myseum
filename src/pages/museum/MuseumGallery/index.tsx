import { useState, useLayoutEffect } from 'react';
import Grid from '@src/components/Grid';
import GridItem from '@src/components/GridItem';
import styles from './museumGallery.module.scss';
import Portal from '@src/components/Portal';
import { Link, useParams, useHistory } from 'react-router-dom';
import useSWR from 'swr';
import NotFound from '@src/pages/NotFound';
import { Gallery } from '@src/types';

const MuseumGallery = () => {
  const history = useHistory();
  const { museumId, galleryId } = useParams<{ museumId: string; galleryId: string }>();

  const { data: gallery, error } = useSWR<Gallery>(() => `/api/galleries/${galleryId}`);

  const [wallHeight, setWallHeight] = useState(0);

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
    return acc > y2 ? acc : y2;
  }, 0);

  const minColumns = artworks.reduce((acc, { item, position }) => {
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
        {artworks.map(({ item, position }, idx) => (
          <GridItem key={idx} item={item} position={position} />
        ))}
      </Grid>
    </div>
  );
};

export default MuseumGallery;
