import { useState } from 'react';
import Head from 'next/head';
import tw from 'twin.macro';
import { Museum, User } from '@prisma/client';
import cx from 'classnames';
import toast from 'react-hot-toast';
import { ArtworkProps } from '@src/components/Artwork';
import AutofitTextField from '@src/components/AutofitTextField';
import FloatingActionButton from '@src/components/FloatingActionButton';
import { GalleryBlockProps } from '@src/components/MuseumMap/GalleryBlock';
import Portal from '@src/components/Portal';
import { Grid } from '@src/features/grid';
import { useMuseum } from '@src/providers/MuseumProvider';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import Edit from '@src/svgs/Edit';
import { GalleryEditActions } from './GalleryEditActions';
import { GridArtwork, GridArtworkItem } from './GridArtwork';
import styles from './gallery.module.scss';

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

  const getArtworkItems = (gallery: GalleryBlockProps['gallery']): GridArtworkItem[] =>
    gallery.artworks
      .map(({ artwork, xPosition, yPosition }) => ({
        artwork: artwork,
        position: {
          x: xPosition,
          y: yPosition,
        },
        size: {
          width: Math.ceil(artwork.frame?.width ?? artwork.width),
          height: Math.ceil(artwork.frame?.height ?? artwork.height),
        },
      }))
      .sort((a, b) => {
        // Sort from left-to-right, top-to-bottom for a logical focus order
        const xDiff = a.position.x - b.position.x;
        return xDiff || a.position.y - b.position.y;
      });

  const getWallWidth = (artworkItems: GridArtworkItem[]) => {
    // Generates min columns based on the frame positioned furthest to the right
    const minWidth = artworkItems.reduce((acc, item) => {
      const x2 = item.position.x + Math.ceil(item.artwork.frame?.width ?? item.artwork.width);
      return Math.max(acc, x2);
    }, 1);
    return minWidth;
  };

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(gallery.name);
  const [wallColor, setWallColor] = useState(gallery.color);
  const [wallHeight, setWallHeight] = useState(gallery.height);
  const [artworkItems, setArtworkItems] = useState(() => getArtworkItems(gallery));
  const [wallWidth, setWallWidth] = useState(() => getWallWidth(artworkItems) + 5);

  // Generates min height based on the lowest-positioned frame
  const minHeight = artworkItems.reduce((acc, item) => {
    const y2 = item.position.y + Math.ceil(item.artwork.frame?.height ?? item.artwork.height);
    return Math.max(acc, y2);
  }, 1);

  /**
   * Adds a new artwork to the current editing state.
   *
   * @param artwork the artwork to add
   */
  const onAddArtwork = (artwork: ArtworkProps['data']) => {
    // Expand the wall width to accomodate the new artwork
    setWallWidth(getWallWidth(artworkItems) + 1 + (artwork.frame?.width ?? artwork.width) + 5);
    // Expand the wall height to accomodate the new artwork
    setWallHeight(Math.max(wallHeight, Math.ceil(artwork.frame?.height ?? artwork.height)));
    // Add the artwork to the wall, 1 unit to the right of the currently rightmost artwork
    setArtworkItems([
      ...artworkItems,
      {
        artwork,
        position: {
          x: getWallWidth(artworkItems) + 1,
          y: 0,
        },
        size: {
          width: Math.ceil(artwork.frame?.width ?? artwork.width),
          height: Math.ceil(artwork.frame?.height ?? artwork.height),
        },
        new: true,
      },
    ]);
    // Spawn a success toast!
    toast.success(`"${artwork.title}" was added to the gallery.`);
  };

  /**
   * Removes an artwork from the current editing state.
   *
   * @param index the index of artwork to remove
   */
  const onRemoveArtwork = (index: number) => {
    // Update the toast to remove the item
    setArtworkItems([...artworkItems.slice(0, index), ...artworkItems.slice(index + 1)]);
    // Spawn a success toast!
    const deletedItem = artworkItems[index];
    toast.success(`"${deletedItem.artwork.title}" was removed from the gallery.`);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onEdit = () => {
    // Update editing mode
    setIsEditing(true);
  };

  const onCancel = () => {
    // Reset state
    setName(gallery.name);
    setWallColor(gallery.color);
    setWallHeight(gallery.height);
    setArtworkItems(getArtworkItems(gallery));
    // Exit editing mode
    setIsEditing(false);
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
          artworks: artworkItems.map(item => ({
            artworkId: item.artwork.id,
            xPosition: item.position.x,
            yPosition: item.position.y,
          })),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw error;
      }

      const data = await res.json();

      // Update state
      setGallery(gallery => ({
        ...gallery,
        ...data,
      }));

      const newArtworkItems = getArtworkItems(data);
      setWallWidth(getWallWidth(newArtworkItems) + 5);
      setArtworkItems(newArtworkItems);

      setIsEditing(false);
      toast.success('Gallery updated!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={{ color: wallColor }}>
      <Head>
        <title>
          {gallery.name} | {museum.name} | Myseum
        </title>
      </Head>

      <div className={cx(`theme--${wallColor}`, styles.page)}>
        {isEditing && (
          <Portal to="nav" prepend>
            <div css={tw`bg-black py-2 px-4 text-white flex flex-col`}>
              <p css={tw`uppercase text-xs tracking-widest font-bold text-center my-1`}>Editing</p>
              <div css={tw`flex flex-1`}>
                <div css={tw`flex flex-1 items-center justify-start`}>
                  <button
                    css={[tw`disabled:opacity-50`]}
                    disabled={isSubmitting}
                    onClick={() => onCancel()}>
                    Cancel
                  </button>
                </div>
                <div css={tw`flex flex-1 items-center justify-center`}>
                  <AutofitTextField
                    id="gallery-name"
                    css={[tw`pb-0.5`]}
                    inputCss={[tw`font-serif leading-none text-3xl disabled:opacity-50`]}
                    label="Gallery name"
                    disabled={isSubmitting}
                    value={name}
                    onChange={setName}
                  />
                </div>
                <div css={tw`flex flex-1 items-center justify-end`}>
                  <button
                    css={[tw`disabled:opacity-50`]}
                    disabled={isSubmitting}
                    onClick={() => onSave()}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </Portal>
        )}

        {!isEditing && (
          <header className={styles.header}>
            <h2 className={styles.title}>{gallery.name}</h2>
          </header>
        )}

        <div className={styles.fab}>
          {!isEditing ? (
            <FloatingActionButton title="Edit gallery" onClick={() => onEdit()}>
              <Edit />
            </FloatingActionButton>
          ) : (
            <GalleryEditActions
              isSubmitting={isSubmitting}
              minHeight={minHeight}
              wallHeight={wallHeight}
              onHeightChange={height => setWallHeight(height)}
              wallColor={wallColor}
              onColorChange={color => setWallColor(color)}
              artworkItems={artworkItems}
              onAddArtwork={artwork => onAddArtwork(artwork)}
            />
          )}
        </div>

        <div className={styles.gridWrapper}>
          <Grid
            className={cx(styles.grid, isEditing && styles.gridEditing)}
            size={{ width: wallWidth, height: wallHeight }}
            items={artworkItems}
            step={1}
            getItemId={item => String(item.artwork.id)}
            onSizeChange={size => setWallWidth(size.width)}
            onItemChange={
              isEditing &&
              ((index, item) => {
                setArtworkItems([
                  ...artworkItems.slice(0, index),
                  item,
                  ...artworkItems.slice(index + 1),
                ]);
              })
            }
            renderItem={(item, props, index) => (
              <GridArtwork
                {...props}
                item={item}
                isEditing={isEditing}
                disabled={props.disabled || isSubmitting}
                onRemove={() => onRemoveArtwork(index)}
              />
            )}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};
