import { Fragment, useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import tw, { css, theme } from 'twin.macro';
import { Gallery, Museum, User } from '@prisma/client';
import { rgba } from 'polished';
import toast from 'react-hot-toast';
import * as z from 'zod';
import FloatingActionButton from '@src/components/FloatingActionButton';
import GallerySettings from '@src/components/GallerySettings';
// import Grid from '@src/components/Grid';
// import GridItem from '@src/components/GridItem';
import IconButton from '@src/components/IconButton';
import Popover, { usePopover } from '@src/components/Popover';
import Portal from '@src/components/Portal';
import { GalleryRepository } from '@src/data/GalleryRepository';
// import { MuseumRepository } from '@src/data/MuseumRepository';
// import { getGallery } from '@src/data/static';
import AddArtworkRoot from '@src/features/add-artwork/AddArtworkRoot';
import { MuseumGalleryLayout } from '@src/layouts/museum';
import { useMuseum } from '@src/providers/MuseumProvider';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import Close from '@src/svgs/Close';
import Cog from '@src/svgs/Cog';
import Edit from '@src/svgs/Edit';
// import { Gallery as StaticGallery } from '@src/types';

export interface GalleryViewProps {
  basePath: string;
  gallery: Gallery;
  museum: Museum & {
    galleries: Gallery[];
    curator: User;
  };
}

const GalleryView = ({ gallery: data }: GalleryViewProps) => {
  const { museum } = useMuseum();

  const [gallery, setGallery] = useState(data);

  const settingsPopover = usePopover('settings-modal');

  const [isAddingArtwork, setIsAddingArtwork] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(gallery.name);
  const [wallColor, setWallColor] = useState(gallery.color);
  const [wallHeight, setWallHeight] = useState(gallery.height);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Exits the editing mode, closing any popovers.
   */
  const exitEditingMode = () => {
    settingsPopover.close();
    setIsEditing(false);
  };

  const onEdit = () => {
    // Update state
    setName(gallery.name);
    setWallColor(gallery.color);
    setWallHeight(gallery.height);
    // Update editing mode
    setIsEditing(true);
  };

  /**
   * Handler for saving updates made in edit mode.
   */
  const onSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/museum/${museum.id}/gallery/${gallery.id}`, {
        method: 'PATCH',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          name,
          color: wallColor,
          height: wallHeight,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw error;
      }

      const data = await res.json();
      setGallery(gallery => ({
        ...gallery,
        ...data.gallery,
      }));
      exitEditingMode();
      toast.success('Gallery updated!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // const { artworks } = gallery;

  // // Generates min height based on the lowest-positioned frame
  // const minHeight = artworks.reduce((acc, { item, position }) => {
  //   const y2 = position.y + Math.ceil(item.frame.dimensions.height);
  //   return Math.max(acc, y2);
  // }, 1);

  // // Generates min columns based on the frame positioned furthest to the right
  // const minColumns = artworks.reduce((acc, { item, position }) => {
  //   const x2 = position.x + Math.ceil(item.frame.dimensions.width);
  //   return Math.max(acc, x2);
  // }, 1);

  return (
    <ThemeProvider color={wallColor}>
      <Head>
        <title>
          {gallery.name} | {museum.name} | Myseum
        </title>
      </Head>

      <div
        css={[
          tw`flex flex-col flex-1`,
          {
            mint: tw`bg-mint-200`,
            pink: tw`bg-pink-200`,
            navy: tw`bg-navy-200`,
            paper: tw`bg-paper-200`,
          }[wallColor],
        ]}>
        {isEditing && (
          <Portal to="nav" prepend>
            <div css={tw`bg-black py-2 px-4 text-white flex flex-col`}>
              <p css={tw`uppercase text-xs tracking-widest font-bold text-center my-1`}>Editing</p>
              <div css={tw`flex flex-1`}>
                <div css={tw`flex flex-1 items-center justify-start`}>
                  <button disabled={isSubmitting} onClick={() => exitEditingMode()}>
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
                      disabled={isSubmitting}
                      value={name}
                      onChange={evt => setName(evt.target.value)}
                    />
                  </div>
                </div>
                <div css={tw`flex flex-1 items-center justify-end`}>
                  <button disabled={isSubmitting} onClick={onSave}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </Portal>
        )}

        {!isEditing && (
          <header css={tw`flex justify-center px-4 pt-4 -mb-1.5`}>
            <h2
              css={[
                tw`font-serif leading-none text-3xl`,
                {
                  mint: tw`text-black`,
                  pink: tw`text-black`,
                  navy: tw`text-white`,
                  paper: tw`text-black`,
                }[wallColor],
              ]}>
              {gallery.name}
            </h2>
          </header>
        )}

        <div css={tw`fixed bottom-6 right-6 flex flex-col z-fab`}>
          {isEditing ? (
            <Fragment>
              <Popover {...settingsPopover.wrapperProps} css={tw`mb-4`} origin="top right">
                <FloatingActionButton
                  {...settingsPopover.anchorProps}
                  title="Open gallery settings">
                  <span css={tw`block transform scale-110`}>
                    <Cog />
                  </span>
                </FloatingActionButton>
                <Popover.Body>
                  <header
                    css={tw`py-2 px-5 bg-white rounded-t-lg mb-px flex items-center justify-between`}>
                    <h1 css={tw`font-serif leading-none text-xl mt-1 mr-3`}>Settings</h1>
                    <IconButton title="Close settings" onClick={() => settingsPopover.close(true)}>
                      <Close />
                    </IconButton>
                  </header>
                  <section css={tw`px-5 pt-4 pb-5 bg-white rounded-b-lg`}>
                    <GallerySettings
                      disabled={isSubmitting}
                      minWallHeight={/*minHeight*/ 0}
                      wallHeight={wallHeight}
                      onWallHeightChange={setWallHeight}
                      wallColor={wallColor}
                      onWallColorChange={setWallColor}
                    />
                  </section>
                </Popover.Body>
              </Popover>
              <FloatingActionButton
                css={[settingsPopover.isExpanded && tw`transition-opacity opacity-50`]}
                onClick={() => setIsAddingArtwork(true)}
                disabled={isSubmitting}
                title="Add new artwork">
                <span css={tw`block transform rotate-45`}>
                  <Close />
                </span>
              </FloatingActionButton>
              {isAddingArtwork && <AddArtworkRoot onClose={() => setIsAddingArtwork(false)} />}
            </Fragment>
          ) : (
            <FloatingActionButton title="Edit gallery" onClick={() => onEdit()}>
              <Edit />
            </FloatingActionButton>
          )}
        </div>

        {/* <Grid showLines={isEditing} rows={wallHeight} minColumns={minColumns}>
          {artworks.map(({ item, position }, idx) => (
            <GridItem key={idx} item={item} position={position} />
          ))}
        </Grid> */}
      </div>
    </ThemeProvider>
  );
};

GalleryView.Layout = MuseumGalleryLayout;

export default GalleryView;

export const getServerSideProps: GetServerSideProps<
  GalleryViewProps,
  { museumId: string; galleryId: string }
> = async ctx => {
  const museumId = z.number().int().safeParse(Number(ctx.params?.museumId));
  const galleryId = z.number().int().safeParse(Number(ctx.params?.galleryId));
  if (!museumId.success || !galleryId.success) {
    return {
      notFound: true,
    };
  }

  try {
    const gallery = await GalleryRepository.findOneByMuseum(museumId.data, galleryId.data);
    if (!gallery) {
      throw new Error('Gallery not found.');
    }

    return {
      props: {
        basePath: `/museum/${gallery.museum.id}`,
        museum: gallery.museum,
        gallery,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};