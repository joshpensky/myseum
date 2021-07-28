import { useState } from 'react';
import Head from 'next/head';
import tw from 'twin.macro';
import { Museum, User } from '@prisma/client';
import toast from 'react-hot-toast';
import AutofitTextField from '@src/components/AutofitTextField';
import FloatingActionButton from '@src/components/FloatingActionButton';
import { GalleryBlockProps } from '@src/components/MuseumMap/GalleryBlock';
import Portal from '@src/components/Portal';
// import { MuseumRepository } from '@src/data/MuseumRepository';
// import { getGallery } from '@src/data/static';
import { useMuseum } from '@src/providers/MuseumProvider';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import Edit from '@src/svgs/Edit';
import { GallerySettingsPopover } from './GallerySettingsPopover';
// import { Gallery as StaticGallery } from '@src/types';

export interface GalleryViewProps {
  basePath: string;
  gallery: GalleryBlockProps['gallery'];
  museum: Museum & {
    galleries: GalleryBlockProps['gallery'][];
    curator: User;
  };
}

export const GalleryView = ({ gallery: data }: GalleryViewProps) => {
  const { museum } = useMuseum();

  const [gallery, setGallery] = useState(data);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(gallery.name);
  const [wallColor, setWallColor] = useState(gallery.color);
  const [wallHeight, setWallHeight] = useState(gallery.height);

  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Exits the editing mode, closing any popovers.
   */
  const exitEditingMode = () => {
    // settingsPopover.close();
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

  const onCancel = () => {
    // Reset state
    setName(gallery.name);
    setWallColor(gallery.color);
    setWallHeight(gallery.height);
    // Exit editing mode
    exitEditingMode();
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

  const { artworks } = gallery;

  // Generates min height based on the lowest-positioned frame
  const minHeight = artworks.reduce((acc, item) => {
    const y2 = item.yPosition + Math.ceil(item.artwork.frame?.height ?? item.artwork.height);
    return Math.max(acc, y2);
  }, 1);

  // Generates min columns based on the frame positioned furthest to the right
  const minColumns = artworks.reduce((acc, item) => {
    const x2 = item.xPosition + Math.ceil(item.artwork.frame?.width ?? item.artwork.width);
    return Math.max(acc, x2);
  }, 1);

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
                  <button disabled={isSubmitting} onClick={() => onCancel()}>
                    Cancel
                  </button>
                </div>
                <div css={tw`flex flex-1 items-center justify-center`}>
                  <AutofitTextField
                    id="gallery-name"
                    css={[tw`pb-0.5`]}
                    inputCss={[tw`font-serif leading-none text-3xl`]}
                    label="Gallery name"
                    disabled={isSubmitting}
                    value={name}
                    onChange={setName}
                  />
                </div>
                <div css={tw`flex flex-1 items-center justify-end`}>
                  <button disabled={isSubmitting} onClick={() => onSave()}>
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
          {!isEditing ? (
            <FloatingActionButton title="Edit gallery" onClick={() => onEdit()}>
              <Edit />
            </FloatingActionButton>
          ) : (
            <GallerySettingsPopover
              isSubmitting={isSubmitting}
              minHeight={minHeight}
              wallHeight={wallHeight}
              setWallHeight={setWallHeight}
              wallColor={wallColor}
              setWallColor={setWallColor}
            />
          )}
        </div>

        {/* <Grid showLines={isEditing} rows={wallHeight} minColumns={minColumns}>
          {artworks.map((item, idx) => (
            <GridItem
              key={idx}
              item={item.artwork}
              position={{ x: item.xPosition, y: item.yPosition }}
            />
          ))}
        </Grid> */}
      </div>
    </ThemeProvider>
  );
};
