import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { getMuseumHomeLayout } from '@src/layouts/MuseumLayout';
import { Artwork, Gallery, Museum } from '@src/types';
import { getMuseum } from '@src/data';
import tw from 'twin.macro';
import Arrow from '@src/svgs/Arrow';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import Grid from '@src/components/Grid';
import GridItem from '@src/components/GridItem';
import dayjs from 'dayjs';

export interface MuseumMapViewProps {
  museum: Museum;
}

const MuseumMapView = ({ museum }: MuseumMapViewProps) => {
  let minX = 0;
  let maxX = 0;
  let maxY = 0;

  // A map of coordinates to galleries
  // { [xPos]: { [yPos]: Gallery } }
  const galleryMap: Record<number, Record<number, Gallery<Artwork>>> = {};
  museum.galleries.forEach(({ item, position }) => {
    // Update the min and max X/Y coords for grid positioning
    minX = Math.min(minX, position.x);
    maxX = Math.max(maxX, position.x);
    maxY = Math.max(maxY, position.y);

    // Add the gallery to the map
    if (!galleryMap[position.x]) {
      galleryMap[position.x] = {};
    }
    galleryMap[position.x][position.y] = item;
  });

  // Grid width = longest side from the center * 2, plus 1 (to account for x=0 column)
  const gridWidth = Math.max(Math.abs(maxX), Math.abs(minX)) * 2 + 1;
  // Grid height = max y + 1 (y will ALWAYS be greater than 0)
  const gridHeight = maxY + 1;

  return (
    <div css={tw`w-full pt-6 overflow-hidden`}>
      <div css={tw`flex flex-col flex-1 items-center`}>
        {/* Renders the entrance block */}
        <div
          css={tw`h-32 px-6 py-2 bg-gradient-to-b from-transparent to-paper-300 flex flex-col items-center rounded-b-lg`}>
          <p>Entrance</p>
          <span css={tw`block mt-1 size-4 transform rotate-180`}>
            <Arrow />
          </span>
        </div>
        {/* Renders the museum grid */}
        <div css={tw`flex flex-col mt-2.5`}>
          {Array(gridHeight)
            .fill(null)
            .map((_, y) => (
              <div key={y} css={tw`flex`}>
                {Array(gridWidth)
                  .fill(null)
                  .map((_, xIndex) => {
                    const startingX = (gridWidth - 1) / -2;
                    const x = startingX + xIndex;
                    // If no gallery for position, render empty block
                    if (!galleryMap[x]?.[y]) {
                      return (
                        <div key={`${x}-${y}`} css={tw`flex flex-shrink-0`}>
                          <div css={tw`block w-96 ratio-4-3 m-2.5`} />
                        </div>
                      );
                    }
                    // Otherwise, render gallery block
                    const gallery = galleryMap[x][y];
                    return (
                      <div key={`${x}-${y}`} css={tw`flex flex-shrink-0`}>
                        <Link
                          href={{
                            pathname: `/museums/[museumId]/gallery/[galleryId]`,
                            query: { museumId: museum.id, galleryId: gallery.id },
                          }}>
                          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                          <a>
                            <div
                              css={[
                                tw`block w-96 ratio-4-3 m-2.5 relative rounded-lg overflow-hidden`,
                                {
                                  mint: tw`bg-mint-200`,
                                  pink: tw`bg-pink-200`,
                                  navy: tw`bg-navy-200 text-white`,
                                  paper: tw`bg-paper-200`,
                                }[gallery.color],
                              ]}>
                              <ThemeProvider color={gallery.color}>
                                <div css={tw`absolute inset-0 size-full flex flex-col flex-1`}>
                                  <div css={tw`relative flex-1`}>
                                    {gallery.artworks.length > 0 && (
                                      <div
                                        css={tw`absolute inset-0 size-full flex flex-col origin-bottom-left transform scale-125`}>
                                        <Grid asPreview rows={gallery.height}>
                                          {gallery.artworks.map(({ item, position }, idx) => (
                                            <GridItem key={idx} item={item} position={position} />
                                          ))}
                                        </Grid>
                                      </div>
                                    )}
                                  </div>
                                  <div css={tw`flex flex-col text-center px-4 pb-4 pt-5`}>
                                    <p css={tw`leading-none font-serif text-2xl`}>{gallery.name}</p>
                                    <p css={tw`text-sm`}>Est. {dayjs(gallery.createdAt).year()}</p>
                                  </div>
                                </div>
                              </ThemeProvider>
                            </div>
                          </a>
                        </Link>
                      </div>
                    );
                  })}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

MuseumMapView.getLayout = getMuseumHomeLayout;

export default MuseumMapView;

export const getServerSideProps: GetServerSideProps<
  MuseumMapViewProps,
  { museumId: string }
> = async ctx => {
  const museumIdStr = ctx.params?.museumId;
  if (!museumIdStr) {
    return {
      notFound: true,
    };
  }

  const museumId = Number.parseInt(museumIdStr);
  if (!Number.isFinite(museumId)) {
    return {
      notFound: true,
    };
  }

  try {
    const museum = getMuseum(museumId);
    return {
      props: {
        museum: JSON.parse(JSON.stringify(museum)),
      },
    };
  } catch {
    return {
      notFound: true,
    };
  }
};
