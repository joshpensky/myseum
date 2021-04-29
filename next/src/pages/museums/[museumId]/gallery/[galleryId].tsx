import { GetServerSideProps } from 'next';
import { getMuseumGalleryLayout } from '@src/layouts/MuseumLayout';
import { getGallery, getMuseum } from '@src/data';
import { Gallery, Museum } from '@src/types';
import Popover, { usePopover } from '@src/components/Popover';
import { Fragment, useState } from 'react';
import tw, { css, theme } from 'twin.macro';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import Portal from '@src/components/Portal';
import { rgba } from 'polished';
import FloatingActionButton from '@src/components/FloatingActionButton';
import Cog from '@src/svgs/Cog';
import IconButton from '@src/components/IconButton';
import Close from '@src/svgs/Close';
import GallerySettings from '@src/components/GallerySettings';
import AddArtworkRoot from '@src/features/add-artwork/AddArtworkRoot';
import Edit from '@src/svgs/Edit';
import Grid from '@src/components/Grid';
import GridItem from '@src/components/GridItem';

export interface GalleryViewProps {
  gallery: Gallery;
  museum: Museum;
}

const GalleryView = ({ gallery }: GalleryViewProps) => {
  const settingsPopover = usePopover('settings-modal');

  const [isAddingArtwork, setIsAddingArtwork] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(gallery.name);
  const [wallColor, setWallColor] = useState(gallery.color);
  const [wallHeight, setWallHeight] = useState(gallery.height);

  /**
   * Exits the editing mode, closing any popovers.
   */
  const exitEditingMode = () => {
    settingsPopover.close();
    setIsEditing(false);
  };

  /**
   * Handler for cancelling updates made in edit mode.
   */
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
    // TODO: validation and saving data to db
    // Exit editing mode
    exitEditingMode();
  };

  const { artworks } = gallery;

  // Generates min height based on the lowest-positioned frame
  const minHeight = artworks.reduce((acc, { item, position }) => {
    const y2 = position.y + Math.ceil(item.frame.dimensions.height);
    return Math.max(acc, y2);
  }, 1);

  // Generates min columns based on the frame positioned furthest to the right
  const minColumns = artworks.reduce((acc, { item, position }) => {
    const x2 = position.x + Math.ceil(item.frame.dimensions.width);
    return Math.max(acc, x2);
  }, 1);

  return (
    <ThemeProvider color={wallColor}>
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
                  <button onClick={onCancel}>Cancel</button>
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
                      onChange={evt => setName(evt.target.value)}
                    />
                  </div>
                </div>
                <div css={tw`flex flex-1 items-center justify-end`}>
                  <button onClick={onSave}>Save</button>
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
                      minWallHeight={minHeight}
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
                title="Add new artwork">
                <span css={tw`block transform rotate-45`}>
                  <Close />
                </span>
              </FloatingActionButton>
              {isAddingArtwork && <AddArtworkRoot onClose={() => setIsAddingArtwork(false)} />}
            </Fragment>
          ) : (
            <FloatingActionButton title="Edit gallery" onClick={() => setIsEditing(true)}>
              <Edit />
            </FloatingActionButton>
          )}
        </div>

        <Grid showLines={isEditing} rows={wallHeight} minColumns={minColumns}>
          {artworks.map(({ item, position }, idx) => (
            <GridItem key={idx} item={item} position={position} />
          ))}
        </Grid>
      </div>
    </ThemeProvider>
  );
};

GalleryView.getLayout = getMuseumGalleryLayout;

export default GalleryView;

export const getServerSideProps: GetServerSideProps<
  GalleryViewProps,
  { museumId: string; galleryId: string }
> = async ctx => {
  const museumIdStr = ctx.params?.museumId;
  const galleryIdStr = ctx.params?.galleryId;
  if (!museumIdStr || !galleryIdStr) {
    return {
      notFound: true,
    };
  }

  const museumId = Number.parseInt(museumIdStr);
  const galleryId = Number.parseInt(galleryIdStr);
  if (!Number.isFinite(museumId) || !Number.isFinite(galleryId)) {
    return {
      notFound: true,
    };
  }

  try {
    const museum = getMuseum(museumId);
    if (!museum.galleries.find(gallery => gallery.item.id === galleryId)) {
      throw new Error('Gallery not found');
    }
    const gallery = getGallery(galleryId);
    return {
      props: {
        gallery: JSON.parse(JSON.stringify(gallery)),
        museum: JSON.parse(JSON.stringify(museum)),
      },
    };
  } catch {
    return {
      notFound: true,
    };
  }
};
