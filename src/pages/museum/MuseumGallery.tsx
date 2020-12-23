import { useState, useLayoutEffect, Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import useSWR from 'swr';
import tw, { css, theme } from 'twin.macro';
import FloatingActionButton from '@src/components/FloatingActionButton';
import GallerySettings from '@src/components/GallerySettings';
import Grid from '@src/components/Grid';
import GridItem from '@src/components/GridItem';
import IconButton from '@src/components/IconButton';
import Popover from '@src/components/Popover';
import Portal from '@src/components/Portal';
import NotFound from '@src/pages/NotFound';
import { ThemeProvider } from '@src/providers/ThemeProvider';
import Edit from '@src/svgs/Edit';
import Close from '@src/svgs/Close';
import Cog from '@src/svgs/Cog';
import { Gallery } from '@src/types';

const MuseumGallery = () => {
  const { museumId, galleryId } = useParams<{ museumId: string; galleryId: string }>();

  const { data: gallery, error, mutate } = useSWR<Gallery>(() => `/api/galleries/${galleryId}`);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(gallery?.name ?? '');
  const [wallColor, setWallColor] = useState(gallery?.color ?? 'mint');
  const [wallHeight, setWallHeight] = useState(gallery?.height ?? 0);

  // When gallery updates, update state!
  useLayoutEffect(() => {
    if (gallery) {
      setName(gallery.name);
      setWallColor(gallery.color);
      setWallHeight(gallery.height);
    }
  }, [gallery]);

  if (error) {
    return <NotFound />;
  } else if (!gallery) {
    return <p>Loading...</p>;
  }

  /**
   * Handler for cancelling updates made in edit mode.
   */
  const onCancel = () => {
    // Reset state
    setName(gallery.name);
    setWallColor(gallery.color);
    setWallHeight(gallery.height);
    // Exit editing mode
    setIsEditing(false);
  };

  /**
   * Handler for saving updates made in edit mode.
   */
  const onSave = async () => {
    // TODO: validation
    // Update cached data to reflect updates
    await mutate(
      {
        ...gallery,
        name,
        color: wallColor,
        height: wallHeight,
      },
      false,
    );
    // Exit editing mode
    setIsEditing(false);
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
        {isEditing ? (
          <Portal to="nav" prepend>
            <div css={tw`bg-black py-2 px-4 text-white flex flex-col`}>
              <p css={tw`uppercase text-xs tracking-widest font-bold text-center mb-0.5`}>
                Editing
              </p>
              <div css={tw`flex flex-1`}>
                <div css={tw`flex flex-1 items-center justify-start`}>
                  <button onClick={onCancel}>Cancel</button>
                </div>
                <div css={tw`flex flex-1 items-center justify-center`}>
                  <div
                    css={[
                      tw`px-2 pt-1 pb-0.5 relative bg-white bg-opacity-0 rounded-sm`,
                      tw`transition-all hover:bg-opacity-20 focus-within:bg-opacity-20`,
                      !name && tw`w-0 overflow-x-hidden`,
                    ]}>
                    <span css={tw`invisible font-serif leading-none text-2xl`} aria-hidden="true">
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
                        tw`absolute left-2 top-1 w-full bg-transparent focus:outline-none font-serif leading-none text-2xl`,
                        css`
                          &::selection {
                            background: ${theme`colors.white`};
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
        ) : (
          <Fragment>
            <Portal to="nav-left" prepend>
              <Link to={`/museum/${museumId}`}>Back</Link>
            </Portal>
            <Portal to="nav-center" prepend>
              <Link to={`/museum/${museumId}/gallery/${galleryId}`}>
                <h1 css={tw`font-serif leading-none text-2xl -mb-1`}>{name}</h1>
              </Link>
            </Portal>
          </Fragment>
        )}

        <div css={tw`fixed bottom-6 right-6 flex flex-col z-fab`}>
          {isEditing ? (
            <Fragment>
              <Popover
                id="settings-modal"
                css={tw`mb-4`}
                position="top"
                align="right"
                renderHeader={({ closePopover }) => (
                  <div css={tw`flex justify-between`}>
                    <h1 css={tw`font-serif leading-none text-xl mt-1 mr-3`}>Settings</h1>
                    <IconButton title="Close settings" onClick={closePopover}>
                      <Close />
                    </IconButton>
                  </div>
                )}
                renderBody={() => (
                  <GallerySettings
                    minWallHeight={minHeight}
                    wallHeight={wallHeight}
                    onWallHeightChange={setWallHeight}
                    wallColor={wallColor}
                    onWallColorChange={setWallColor}
                  />
                )}>
                {({ openPopover, triggerProps }) => (
                  <FloatingActionButton
                    {...triggerProps}
                    title="Open gallery settings"
                    onClick={openPopover}>
                    <span css={tw`block transform scale-110`}>
                      <Cog />
                    </span>
                  </FloatingActionButton>
                )}
              </Popover>
              <FloatingActionButton title="Add new artwork">
                <span css={tw`block transform rotate-45`}>
                  <Close />
                </span>
              </FloatingActionButton>
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

export default MuseumGallery;
