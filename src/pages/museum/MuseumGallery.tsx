import { useState, useLayoutEffect, ChangeEvent, Fragment, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import useSWR from 'swr';
import tw, { css, theme } from 'twin.macro';
import FloatingActionButton from '@src/components/FloatingActionButton';
import Grid from '@src/components/Grid';
import GridItem from '@src/components/GridItem';
import Portal from '@src/components/Portal';
import NotFound from '@src/pages/NotFound';
import Edit from '@src/svgs/Edit';
import { Gallery } from '@src/types';

const MuseumGallery = () => {
  const { museumId, galleryId } = useParams<{ museumId: string; galleryId: string }>();

  const { data: gallery, error } = useSWR<Gallery>(() => `/api/galleries/${galleryId}`);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState<string>(gallery?.name ?? '');

  const [wallHeight, setWallHeight] = useState(0);
  const onHeightChange = (evt: ChangeEvent<HTMLInputElement>) => {
    let value = evt.target.valueAsNumber;
    if (Number.isNaN(value)) {
      value = 0;
    }
    setWallHeight(value);
  };

  useEffect(() => {
    if (gallery) {
      setName(gallery.name);
    }
  }, [gallery]);

  useLayoutEffect(() => {
    if (gallery) {
      setWallHeight(gallery.height);
    }
  }, [gallery]);

  if (error) {
    return <NotFound />;
  } else if (!gallery) {
    return <p>Loading...</p>;
  }

  const { artworks } = gallery;

  const minHeight = artworks.reduce((acc, { item, position }) => {
    const y2 = position.y + Math.ceil(item.frame.dimensions.height);
    return Math.max(acc, y2);
  }, 1);

  const minColumns = artworks.reduce((acc, { item, position }) => {
    const x2 = position.x + Math.ceil(item.frame.dimensions.width);
    return Math.max(acc, x2);
  }, 1);

  return (
    <div css={tw`bg-mint-400 flex flex-col flex-1`}>
      {isEditing ? (
        <Portal to="nav" prepend>
          <div css={tw`bg-black py-2 px-4 text-white flex flex-col`}>
            <p css={tw`uppercase text-xs tracking-wider font-bold text-center mb-1`}>Editing</p>
            <div css={tw`flex flex-1`}>
              <div css={tw`flex flex-1 items-center justify-start`}>
                <button onClick={() => setIsEditing(false)}>Cancel</button>
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
                <button onClick={() => setIsEditing(false)}>Save</button>
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
              <h1 css={tw`font-serif leading-none text-2xl`}>{gallery.name}</h1>
            </Link>
          </Portal>
        </Fragment>
      )}

      <div css={tw`fixed bottom-6 right-6 flex flex-col`}>
        {!isEditing && (
          <FloatingActionButton title="Edit" onClick={() => setIsEditing(true)}>
            <Edit />
          </FloatingActionButton>
        )}
      </div>

      <div>
        <label htmlFor="wallHeight">Wall Height</label>
        <input
          id="wallHeight"
          type="number"
          step={1}
          min={minHeight}
          value={wallHeight === 0 ? '' : wallHeight}
          onChange={onHeightChange}
        />
        in
      </div>

      <Grid rows={wallHeight} minColumns={minColumns}>
        {artworks.map(({ item, position }, idx) => (
          <GridItem key={idx} item={item} position={position} />
        ))}
      </Grid>
    </div>
  );
};

export default MuseumGallery;
