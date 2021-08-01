import { Fragment, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import cx from 'classnames';
import toast from 'react-hot-toast';
import AutofitTextField from '@src/components/AutofitTextField';
import Button from '@src/components/Button';
import FloatingActionButton from '@src/components/FloatingActionButton';
import IconButton from '@src/components/IconButton';
import { useLayout } from '@src/components/Layout';
import { ArtworkDto } from '@src/data/ArtworkSerializer';
import { UpdateGalleryDto } from '@src/data/GalleryRepository';
import { GalleryArtworkDto, GalleryDto } from '@src/data/GallerySerializer';
import { MuseumDto } from '@src/data/MuseumSerializer';
import { Grid } from '@src/features/grid';
import { useMuseum } from '@src/providers/MuseumProvider';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import Close from '@src/svgs/Close';
import Edit from '@src/svgs/Edit';
import { GalleryEditActions } from './GalleryEditActions';
import { GridArtwork, GridArtworkItem } from './GridArtwork';
import styles from './gallery.module.scss';

export interface GalleryViewProps {
  gallery: GalleryDto;
  museum: MuseumDto;
}

export const GalleryView = ({ gallery: data }: GalleryViewProps) => {
  const { museum } = useMuseum();
  const layout = useLayout();

  const editButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const [gallery, setGallery] = useState(data);

  const getGalleryArtworks = (gallery: GalleryDto): GridArtworkItem[] =>
    [...gallery.artworks].sort((a, b) => {
      // Sort from left-to-right, top-to-bottom for a logical focus order
      const xDiff = a.position.x - b.position.x;
      return xDiff || a.position.y - b.position.y;
    });

  const getWallWidth = (galleryArtworks: GalleryArtworkDto[]) => {
    // Generates min columns based on the frame positioned furthest to the right
    const minWidth = galleryArtworks.reduce(
      (acc, item) => Math.max(acc, item.position.x + item.artwork.fullSize.width),
      1,
    );
    return minWidth;
  };

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(gallery.name);
  const [wallColor, setWallColor] = useState(gallery.color);
  const [wallHeight, setWallHeight] = useState(gallery.height);
  const [galleryArtworks, setGalleryArtworks] = useState(() => getGalleryArtworks(gallery));
  const [wallWidth, setWallWidth] = useState(() => getWallWidth(galleryArtworks) + 5);

  // Generates min height based on the lowest-positioned frame
  const minHeight = galleryArtworks.reduce(
    (acc, item) => Math.max(acc, item.position.y + item.artwork.fullSize.height),
    1,
  );

  /**
   * Adds a new artwork to the current editing state.
   *
   * @param artwork the artwork to add
   */
  const onAddArtwork = (artwork: ArtworkDto) => {
    // Expand the wall width to accomodate the new artwork
    setWallWidth(getWallWidth(galleryArtworks) + 1 + artwork.fullSize.width + 5);
    // Expand the wall height to accomodate the new artwork
    setWallHeight(Math.max(wallHeight, artwork.fullSize.height));
    // Add the artwork to the wall, 1 unit to the right of the currently rightmost artwork
    setGalleryArtworks([
      ...galleryArtworks,
      {
        artwork,
        position: {
          x: getWallWidth(galleryArtworks) + 1,
          y: 0,
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
    setGalleryArtworks([...galleryArtworks.slice(0, index), ...galleryArtworks.slice(index + 1)]);
    // Spawn a success toast!
    const deletedItem = galleryArtworks[index];
    toast.success(`"${deletedItem.artwork.title}" was removed from the gallery.`);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const exitEditMode = () => {
    setIsEditing(false);
    setWallWidth(getWallWidth(galleryArtworks) + 5);
    layout.updateNavVisibility(true);
    // Focus the edit button when edit mode has been exited
    window.requestAnimationFrame(() => {
      editButtonRef.current?.focus();
    });
  };

  const openExitMode = () => {
    setIsEditing(true);
    layout.updateNavVisibility(false);
    // Focus the cancel button when edit mode has been started
    window.requestAnimationFrame(() => {
      cancelButtonRef.current?.focus();
    });
  };

  const onCancel = () => {
    // Reset state
    setName(gallery.name);
    setWallColor(gallery.color);
    setWallHeight(gallery.height);
    setGalleryArtworks(getGalleryArtworks(gallery));
    // Exit editing mode
    exitEditMode();
  };

  /**
   * Handler for saving updates made in edit mode.
   */
  const onSave = async () => {
    setIsSubmitting(true);
    try {
      const updateData: UpdateGalleryDto = {
        name,
        color: wallColor,
        height: wallHeight,
        artworks: galleryArtworks.map(item => ({
          artworkId: item.artwork.id,
          position: item.position,
        })),
      };

      const res = await fetch(`/api/museum/${museum.id}/gallery/${gallery.id}`, {
        method: 'PATCH',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(updateData),
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

      const newGalleryArtworks = getGalleryArtworks(data);
      setWallWidth(getWallWidth(newGalleryArtworks) + 5);
      setGalleryArtworks(newGalleryArtworks);

      exitEditMode();
      toast.success('Gallery updated!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Allow saving via cmd+S
  useEffect(() => {
    if (isEditing && !isSubmitting) {
      const onKeyDown = (evt: KeyboardEvent) => {
        const isOSX = /(Mac OS X)/gi.test(navigator.userAgent);
        const withCmdModifier = (isOSX ? evt.metaKey : evt.ctrlKey) && !evt.altKey;
        if (withCmdModifier && evt.key === 's') {
          evt.preventDefault();
          onSave();
          return;
        }
      };

      window.addEventListener('keydown', onKeyDown);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [isEditing, isSubmitting]);

  return (
    <ThemeProvider theme={{ color: wallColor }}>
      <Head>
        <title>
          {gallery.name} | {museum.name} | Myseum
        </title>
      </Head>

      <div className={cx(`theme--${wallColor}`, styles.page)}>
        <ThemeProvider theme={{ color: isEditing ? 'ink' : wallColor }}>
          <header className={cx(styles.header, isEditing && [`theme--ink`, styles.headerEditing])}>
            {!isEditing ? (
              <h2 className={styles.title}>{gallery.name}</h2>
            ) : (
              <Fragment>
                <div className={styles.headerSection}>
                  <IconButton
                    ref={cancelButtonRef}
                    disabled={isSubmitting}
                    onClick={() => onCancel()}
                    title="Cancel">
                    <Close />
                  </IconButton>
                  <h1 className={styles.editTitle}>Editing gallery</h1>
                </div>

                <div className={styles.headerSection}>
                  <AutofitTextField
                    id="gallery-name"
                    className={styles.titleInput}
                    inputClassName={cx(styles.title)}
                    label="Gallery name"
                    placeholder="Name"
                    disabled={isSubmitting}
                    value={name}
                    onChange={name => setName(name)}
                  />
                </div>

                <div className={styles.headerSection}>
                  <Button disabled={isSubmitting} onClick={() => onSave()}>
                    Save
                  </Button>
                </div>
              </Fragment>
            )}
          </header>
        </ThemeProvider>

        <div className={styles.fab}>
          {!isEditing ? (
            <FloatingActionButton
              ref={editButtonRef}
              title="Edit gallery"
              onClick={() => openExitMode()}>
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
              galleryArtworks={galleryArtworks}
              onAddArtwork={artwork => onAddArtwork(artwork)}
            />
          )}
        </div>

        <div className={styles.gridWrapper}>
          <Grid
            className={cx(styles.grid, isEditing && styles.gridEditing)}
            size={{ width: wallWidth, height: wallHeight }}
            items={galleryArtworks.map(item => ({
              artwork: item.artwork,
              position: item.position,
              size: item.artwork.fullSize,
            }))}
            step={1}
            getItemId={item => String(item.artwork.id)}
            onSizeChange={size => setWallWidth(size.width)}
            onItemChange={
              isEditing &&
              ((index, item) => {
                setGalleryArtworks([
                  ...galleryArtworks.slice(0, index),
                  { ...galleryArtworks[index], position: item.position },
                  ...galleryArtworks.slice(index + 1),
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
