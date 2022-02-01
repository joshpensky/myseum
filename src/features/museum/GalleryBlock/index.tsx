import Link from 'next/link';
import { useRouter } from 'next/router';
import cx from 'classnames';
import dayjs from 'dayjs';
import { GalleryDto } from '@src/data/serializers/gallery.serializer';
import { MuseumDto } from '@src/data/serializers/museum.serializer';
import { GridArtwork } from '@src/features/gallery/GridArtwork';
import { Grid } from '@src/features/grid';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import styles from './galleryBlock.module.scss';

export interface GalleryBlockProps {
  gallery: GalleryDto;
  museum: MuseumDto;
}

const GalleryBlock = ({ museum, gallery }: GalleryBlockProps) => {
  const router = useRouter();
  let href: string;
  if (router.pathname === '/') {
    href = `/gallery/${gallery.id}`;
  } else {
    href = `/museum/${museum.id}/gallery/${gallery.id}`;
  }

  const gridWidth = gallery.artworks.reduce(
    (acc, item) => Math.max(acc, item.position.x + item.size.width),
    1,
  );

  return (
    <ThemeProvider theme={{ color: gallery.color }}>
      <Link href={href}>
        <a className={cx(styles.wrapper, `theme--${gallery.color}`)}>
          <div className={styles.inner}>
            <div className={styles.gridWrapper}>
              {gallery.artworks.length > 0 && (
                <div className={styles.grid}>
                  <Grid
                    preview
                    size={{ width: gridWidth, height: gallery.height }}
                    items={gallery.artworks}
                    getItemId={item => String(item.artwork.id)}
                    renderItem={(item, props) => <GridArtwork {...props} item={item} />}
                  />
                </div>
              )}
            </div>

            <div className={styles.info}>
              <p className={styles.name}>{gallery.name}</p>
              <p className={styles.established}>Est. {dayjs(gallery.addedAt).year()}</p>
            </div>
          </div>
        </a>
      </Link>
    </ThemeProvider>
  );
};

export default GalleryBlock;
