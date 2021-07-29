import { useState } from 'react';
import Head from 'next/head';
import tw, { css, theme } from 'twin.macro';
import { Museum, User } from '@prisma/client';
import { rgba } from 'polished';
import toast from 'react-hot-toast';
import ArtworkComponent from '@src/components/Artwork';
import AutofitTextField from '@src/components/AutofitTextField';
import FloatingActionButton from '@src/components/FloatingActionButton';
import { GalleryBlockProps } from '@src/components/MuseumMap/GalleryBlock';
import Portal from '@src/components/Portal';
import { Grid, useGrid } from '@src/features/grid';
import { useMuseum } from '@src/providers/MuseumProvider';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import DragHandle from '@src/svgs/DragHandle';
import Edit from '@src/svgs/Edit';
import { GallerySettingsPopover } from './GallerySettingsPopover';

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

  const getArtworkItems = (gallery: GalleryBlockProps['gallery']) =>
    gallery.artworks.map(({ artwork, xPosition, yPosition }) => ({
      artwork: artwork,
      position: {
        x: xPosition,
        y: yPosition,
      },
      size: {
        width: Math.ceil(artwork.frame?.width ?? artwork.width),
        height: Math.ceil(artwork.frame?.height ?? artwork.height),
      },
    }));

  const getWallWidth = (gallery: GalleryBlockProps['gallery']) => {
    // Generates min columns based on the frame positioned furthest to the right
    const minWidth = gallery.artworks.reduce((acc, item) => {
      const x2 = item.xPosition + Math.ceil(item.artwork.frame?.width ?? item.artwork.width);
      return Math.max(acc, x2);
    }, 1);
    // Then add buffer
    return minWidth + 5;
  };

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(gallery.name);
  const [wallColor, setWallColor] = useState(gallery.color);
  const [wallHeight, setWallHeight] = useState(gallery.height);
  const [wallWidth, setWallWidth] = useState(() => getWallWidth(gallery));
  const [artworkItems, setArtworkItems] = useState(() => getArtworkItems(gallery));

  // Generates min height based on the lowest-positioned frame
  const minHeight = artworkItems.reduce((acc, item) => {
    const y2 = item.position.y + Math.ceil(item.artwork.frame?.height ?? item.artwork.height);
    return Math.max(acc, y2);
  }, 1);

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
      setWallWidth(getWallWidth(data));
      setArtworkItems(getArtworkItems(data));
      setIsEditing(false);
      toast.success('Gallery updated!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <div css={[tw`relative flex flex-1 my-10`]}>
          <Grid
            css={[
              {
                mint: tw`text-mint-700`,
                pink: tw`text-mint-700`, // TODO: update
                navy: tw`text-navy-800`,
                paper: tw`text-mint-700`, // TODO: update
              }[wallColor],
              isEditing ? tw`text-opacity-20` : tw`text-opacity-0`,
            ]}
            size={{ width: wallWidth, height: wallHeight }}
            items={artworkItems}
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
            renderItem={(item, props) => {
              const gridCtx = useGrid();

              const frameHeight = item.artwork.frame?.height ?? item.artwork.height;
              const frameDepth = item.artwork.frame?.depth ?? 0;

              const isDragging = !!props.moveType;

              /**
               * Gets the pixel value for a shadow, scaled to the grid item size.
               *
               * @param value the value to scale
               */
              const px = (value: number) => `${value * ((gridCtx?.unitPx ?? 0) / 25)}px`;

              const shadowColor = {
                mint: theme`colors.mint.800`,
                pink: theme`colors.mint.800`, // TODO: update
                navy: theme`colors.navy.50`,
                paper: theme`colors.mint.800`, // TODO: update
              }[wallColor];

              const highlightColor = {
                mint: theme`colors.white`,
                pink: theme`colors.white`, // TODO: update
                navy: theme`colors.navy.800`,
                paper: theme`colors.white`, // TODO: update
              }[wallColor];

              // When dragging, increase the x/y offset of shadows by 150%
              const shadowOffsetMultiplier = isDragging ? 1.5 : 1;
              const boxShadow = [
                [
                  // Cast small shadow (bottom right)
                  px(frameHeight * 0.25 * shadowOffsetMultiplier),
                  px(frameHeight * 0.25 * shadowOffsetMultiplier),
                  px(frameDepth * 5),
                  px(-2),
                  rgba(shadowColor, 0.25),
                ],
                [
                  // Cast larger shadow (bottom right)
                  px(frameHeight * 0.75 * shadowOffsetMultiplier),
                  px(frameHeight * 0.75 * shadowOffsetMultiplier),
                  px(frameDepth * 10),
                  px(frameDepth * 2),
                  rgba(shadowColor, 0.15),
                ],
                [
                  // Cast highlight (top left)
                  px(frameHeight * -0.5 * shadowOffsetMultiplier),
                  px(frameHeight * -0.5 * shadowOffsetMultiplier),
                  px(frameDepth * 15),
                  px(frameDepth),
                  rgba(highlightColor, 0.15),
                ],
              ]
                .map(shadowValues => shadowValues.join(' '))
                .join(', ');

              // When dragging, scale the artwork up by 1/4 of a grid unit
              const draggingScale = 1 + 1 / (frameHeight * 4);

              return (
                <div className="group" css={[tw`absolute inset-0`]}>
                  <div
                    css={[
                      tw`flex items-center justify-center h-full w-full relative transition-all`,
                      isDragging && css({ transform: `scale(${draggingScale})` }),
                      props.error && tw`overflow-hidden rounded-sm`,
                      (props.error || props.disabled) && tw`opacity-75`,
                      css({ boxShadow }),
                    ]}>
                    <ArtworkComponent data={item.artwork} disabled={isEditing} />
                    <div
                      css={[
                        tw`absolute inset-0 rounded-sm opacity-0 pointer-events-none`,
                        props.error &&
                          tw`opacity-100 ring-2 ring-inset transition-opacity duration-75`,
                        props.error === 'overlapping' &&
                          tw`bg-yellow-500 bg-opacity-50 ring-yellow-500`,
                        props.error === 'out-of-bounds' &&
                          tw`bg-red-500 bg-opacity-50 ring-red-500`,
                      ]}
                    />
                  </div>
                  {isEditing && (
                    <button
                      css={[
                        tw`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`,
                        tw`w-8 h-8 rounded-full bg-white flex items-center justify-center`,
                        tw`opacity-0 transition-opacity group-hover:(opacity-100) focus:(opacity-100 outline-none ring)`,
                      ]}
                      {...props.dragHandleProps}
                      aria-label="Drag">
                      <span css={[tw`block w-4 text-black`]}>
                        <DragHandle />
                      </span>
                    </button>
                  )}
                </div>
              );
            }}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};
