import Link from 'next/link';
import tw from 'twin.macro';
import dayjs from 'dayjs';
import { GalleryDto } from '@src/data/gallery.serializer';
import { MuseumDto } from '@src/data/museum.serializer';
import { GridArtwork } from '@src/features/gallery/GridArtwork';
import { Grid } from '@src/features/grid';
import { ThemeProvider } from '@src/providers/ThemeProvider';

export interface GalleryBlockProps {
  gallery: GalleryDto;
  museum: MuseumDto;
}

const GalleryBlock = ({ museum, gallery }: GalleryBlockProps) => {
  const gridWidth = gallery.artworks.reduce(
    (acc, item) => Math.max(acc, item.position.x + item.size.width),
    1,
  );

  return (
    <div css={tw`flex flex-shrink-0 m-2.5`}>
      <ThemeProvider theme={{ color: gallery.color }}>
        <Link passHref href={`/museum/${museum.id}/gallery/${gallery.id}`}>
          <a
            className={`theme--${gallery.color}`}
            css={[tw`block w-96 ratio-4-3 relative rounded-lg overflow-hidden`]}>
            <div
              css={tw`absolute inset-0 size-full flex flex-col flex-1`}
              style={{ backgroundColor: `rgba(var(--c-bg), 1)` }}>
              <div css={tw`relative flex-1`}>
                {gallery.artworks.length > 0 && (
                  <div
                    css={tw`absolute inset-0 size-full flex flex-col origin-bottom-left transform scale-125`}>
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
              <div css={tw`flex flex-col text-center px-4 pb-4 pt-5`}>
                <p
                  css={tw`leading-none font-serif text-2xl`}
                  style={{ color: `rgba(var(--c-text), 1)` }}>
                  {gallery.name}
                </p>
                <p css={tw`text-sm`} style={{ color: `rgba(var(--c-text), 1)` }}>
                  Est. {dayjs(gallery.addedAt).year()}
                </p>
              </div>
            </div>
          </a>
        </Link>
      </ThemeProvider>
    </div>
  );
};

export default GalleryBlock;
