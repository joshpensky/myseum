import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import tw, { theme } from 'twin.macro';
import { Gallery, Museum, User } from '@prisma/client';
import dayjs from 'dayjs';
import { rgba } from 'polished';
import toast from 'react-hot-toast';
import { css } from 'styled-components';
import * as z from 'zod';
// import Grid from '@src/components/Grid';
// import GridItem from '@src/components/GridItem';
import FloatingActionButton from '@src/components/FloatingActionButton';
import Portal from '@src/components/Portal';
import { MuseumRepository } from '@src/data/MuseumRepository';
import { MuseumHomeLayout } from '@src/layouts/museum';
import { useAuth } from '@src/providers/AuthProvider';
import { useMuseum } from '@src/providers/MuseumProvider';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import Arrow from '@src/svgs/Arrow';
import Edit from '@src/svgs/Edit';
// import { Artwork, Gallery, Museum } from '@src/types';

export interface MuseumMapViewProps {
  basePath: string;
  museum: Museum & {
    curator: User;
    galleries: Gallery[];
  };
}

const MuseumMapView = ({ basePath }: MuseumMapViewProps) => {
  const auth = useAuth();

  const { museum, setMuseum } = useMuseum();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');

  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const onEdit = () => {
    setName(museum.name);
    setIsEditing(true);
  };

  const onSave = async () => {
    setIsFormSubmitting(true);
    try {
      const res = await fetch(`/api/museum/${museum.id}`, {
        method: 'PATCH',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          name,
          // galleries: [
          //   {
          //     name: 'Awesome Gallery',
          //     color: 'pink',
          //     xPosition: 0,
          //     yPosition: 0,
          //   },
          //   {
          //     name: 'Good One',
          //     color: 'navy',
          //     xPosition: 1,
          //     yPosition: 0,
          //   },
          // ],
        }),
      });

      // Throw error, if any
      if (!res.ok) {
        const error = await res.json();
        throw error;
      }

      // Update state
      const data = await res.json();
      setMuseum(data.museum);
      setIsEditing(false);
      // Send success toast
      toast.success('Museum updated!');
    } catch (error) {
      // If error, send error toast
      toast.error(error.message);
    } finally {
      // Regardless, update form state
      setIsFormSubmitting(false);
    }
  };

  let minX = 0;
  let maxX = 0;
  let maxY = 0;

  // A map of coordinates to galleries
  // { [xPos]: { [yPos]: Gallery } }
  const galleryMap: Record<number, Record<number, Gallery>> = {};
  museum.galleries.forEach(gallery => {
    const { xPosition, yPosition } = gallery;
    // Update the min and max X/Y coords for grid positioning
    minX = Math.min(minX, xPosition);
    maxX = Math.max(maxX, xPosition);
    maxY = Math.max(maxY, yPosition);

    // Add the gallery to the map
    if (!galleryMap[xPosition]) {
      galleryMap[xPosition] = {};
    }
    galleryMap[xPosition][yPosition] = gallery;
  });

  // Grid width = longest side from the center * 2, plus 1 (to account for x=0 column)
  const gridWidth = Math.max(Math.abs(maxX), Math.abs(minX)) * 2 + 1;
  // Grid height = max y + 1 (y will ALWAYS be greater than 0)
  const gridHeight = maxY + 1;

  return (
    <ThemeProvider color="paper">
      <Head>
        <title>{museum.name} | Myseum</title>
      </Head>

      {!isEditing && auth.user && auth.user.id === museum.curatorId && (
        <div css={tw`fixed bottom-6 right-6 flex flex-col z-fab`}>
          <FloatingActionButton title="Edit museum" onClick={() => onEdit()}>
            <Edit />
          </FloatingActionButton>
        </div>
      )}

      {isEditing && (
        <Portal to="nav" prepend>
          <div css={tw`bg-black py-2 px-4 text-white flex flex-col`}>
            <p css={tw`uppercase text-xs tracking-widest font-bold text-center my-1`}>Editing</p>
            <div css={tw`flex flex-1`}>
              <div css={tw`flex flex-1 items-center justify-start`}>
                <button onClick={() => setIsEditing(false)} disabled={isFormSubmitting}>
                  Cancel
                </button>
              </div>
              <div css={tw`flex flex-1 items-center justify-center`}>
                <div
                  css={[
                    tw`px-2 pt-2 pb-0.5 relative bg-white bg-opacity-0 rounded`,
                    tw`transition-all hover:bg-opacity-20 focus-within:bg-opacity-20`,
                    !name && tw`w-0 overflow-x-hidden`,
                  ]}>
                  <span css={tw`invisible font-serif leading-none text-3xl`} aria-hidden="true">
                    {Array(name.length - name.trimStart().length)
                      .fill(null)
                      .map((_, index) => (
                        <span key={index}>&nbsp;</span>
                      ))}
                    {name ? name.trim() : <span>&nbsp;</span>}
                    {name.trim().length > 0 &&
                      Array(name.length - name.trimEnd().length)
                        .fill(null)
                        .map((_, index) => <span key={index}>&nbsp;</span>)}
                  </span>
                  <input
                    css={[
                      tw`absolute left-2 top-2 w-full bg-transparent focus:outline-none font-serif leading-none text-3xl`,
                      css`
                        &::selection {
                          background: ${rgba(theme`colors.white`, 0.35)};
                        }
                      `,
                    ]}
                    type="text"
                    aria-label="Gallery name"
                    value={name}
                    disabled={isFormSubmitting}
                    onChange={evt => setName(evt.target.value)}
                  />
                </div>
              </div>
              <div css={tw`flex flex-1 items-center justify-end`}>
                <button onClick={onSave} disabled={isFormSubmitting}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

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
                            <div css={tw`block w-96 ratio-4-3 m-2.5 bg-red-100`} />
                          </div>
                        );
                      }
                      // Otherwise, render gallery block
                      const gallery = galleryMap[x][y];
                      return (
                        <div key={`${x}-${y}`} css={tw`flex flex-shrink-0`}>
                          <Link
                            passHref
                            href={{
                              pathname: `${basePath}/gallery/[galleryId]`,
                              query: { galleryId: gallery.id },
                            }}>
                            <a
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
                                    {/* {gallery.artworks.length > 0 && (
                                      <div
                                        css={tw`absolute inset-0 size-full flex flex-col origin-bottom-left transform scale-125`}>
                                        <Grid asPreview rows={gallery.height}>
                                          {gallery.artworks.map(({ item, position }, idx) => (
                                            <GridItem key={idx} item={item} position={position} />
                                          ))}
                                        </Grid>
                                      </div>
                                    )} */}
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
                    })}
                </div>
              ))}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

MuseumMapView.Layout = MuseumHomeLayout;

export default MuseumMapView;

export const getServerSideProps: GetServerSideProps<
  MuseumMapViewProps,
  { museumId: string }
> = async ctx => {
  const museumId = z.number().int().safeParse(Number(ctx.params?.museumId));
  if (!museumId.success) {
    return {
      notFound: true,
    };
  }

  try {
    const museum = await MuseumRepository.findOne(museumId.data);
    if (!museum) {
      throw new Error('Museum not found.');
    }

    return {
      props: {
        basePath: `/museum/${museum.id}`,
        museum,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
