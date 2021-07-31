import Link from 'next/link';
import tw from 'twin.macro';
import { Gallery, GalleryArtwork, Artwork, Frame, Artist } from '@prisma/client';
import dayjs from 'dayjs';
import { GridArtwork } from '@src/features/gallery/GridArtwork';
import { Grid } from '@src/features/grid';
import { useMuseum } from '@src/providers/MuseumProvider';
import { ThemeProvider } from '@src/providers/ThemeProvider';

export interface GalleryBlockProps {
  gallery: Gallery & {
    artworks: (GalleryArtwork & {
      artwork: Artwork & {
        frame: Frame | null;
        artist: Artist | null;
      };
    })[];
  };
}

const GalleryBlock = ({ gallery }: GalleryBlockProps) => {
  const { basePath } = useMuseum();

  const gridWidth = gallery.artworks.reduce((acc, item) => {
    const x2 = item.xPosition + Math.ceil(item.artwork.frame?.width ?? item.artwork.width);
    return Math.max(acc, x2);
  }, 1);

  return (
    <div css={tw`flex flex-shrink-0 m-2.5`}>
      <Link
        passHref
        href={{
          pathname: `${basePath}/gallery/[galleryId]`,
          query: { galleryId: gallery.id },
        }}>
        <a
          css={[
            tw`block w-96 ratio-4-3 relative rounded-lg overflow-hidden`,
            {
              mint: tw`bg-mint-200`,
              pink: tw`bg-pink-200`,
              navy: tw`bg-navy-200 text-white`,
              paper: tw`bg-paper-200`,
            }[gallery.color],
          ]}>
          <ThemeProvider theme={{ color: gallery.color }}>
            <div css={tw`absolute inset-0 size-full flex flex-col flex-1`}>
              <div css={tw`relative flex-1`}>
                {gallery.artworks.length > 0 && (
                  <div
                    css={tw`absolute inset-0 size-full flex flex-col origin-bottom-left transform scale-125`}>
                    <Grid
                      className={`theme--${gallery.color}`}
                      preview
                      size={{ width: gridWidth, height: gallery.height }}
                      items={gallery.artworks.map(item => ({
                        artwork: item.artwork,
                        position: {
                          x: item.xPosition,
                          y: item.yPosition,
                        },
                        size: {
                          width: item.artwork.frame?.width ?? item.artwork.width,
                          height: item.artwork.frame?.height ?? item.artwork.height,
                        },
                      }))}
                      getItemId={item => String(item.artwork.id)}
                      renderItem={(item, props) => <GridArtwork {...props} item={item} />}
                    />
                  </div>
                )}
              </div>
              <div css={tw`flex flex-col text-center px-4 pb-4 pt-5`}>
                <p css={tw`leading-none font-serif text-2xl`}>{gallery.name}</p>
                <p css={tw`text-sm`}>Est. {dayjs(gallery.createdAt).year()}</p>
              </div>
            </div>
          </ThemeProvider>
        </a>
      </Link>
    </div>
  );
};

export default GalleryBlock;
