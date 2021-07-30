import { Fragment, useState } from 'react';
import tw from 'twin.macro';
import { GalleryColor } from '@prisma/client';
import cx from 'classnames';
import FloatingActionButton from '@src/components/FloatingActionButton';
import GallerySettings from '@src/components/GallerySettings';
import IconButton from '@src/components/IconButton';
import Popover, { usePopover } from '@src/components/Popover';
import AddArtworkRoot from '@src/features/add-artwork/AddArtworkRoot';
import Close from '@src/svgs/Close';
import Cog from '@src/svgs/Cog';
import styles from './gallerySettingsPopover.module.scss';

interface GallerySettingsPopoverProps {
  isSubmitting: boolean;
  minHeight: number;
  wallHeight: number;
  setWallHeight(nextWallHeight: number): void;
  wallColor: GalleryColor;
  setWallColor(nextWallColor: GalleryColor): void;
}

export const GallerySettingsPopover = ({
  isSubmitting,
  minHeight,
  wallHeight,
  setWallHeight,
  wallColor,
  setWallColor,
}: GallerySettingsPopoverProps) => {
  const settingsPopover = usePopover('settings-modal');

  const [isAddingArtwork, setIsAddingArtwork] = useState(false);

  return (
    <Fragment>
      <Popover {...settingsPopover.wrapperProps} css={tw`mb-4`} origin="top right">
        <FloatingActionButton {...settingsPopover.anchorProps} title="Open gallery settings">
          <span css={tw`block transform scale-110`}>
            <Cog />
          </span>
        </FloatingActionButton>
        <Popover.Body>
          <header css={tw`py-2 px-5 bg-white rounded-t-lg mb-px flex items-center justify-between`}>
            <h1 css={tw`font-serif leading-none text-xl mt-1 mr-3`}>Settings</h1>
            <IconButton title="Close settings" onClick={() => settingsPopover.close(true)}>
              <Close />
            </IconButton>
          </header>
          <section css={tw`px-5 pt-4 pb-5 bg-white rounded-b-lg`}>
            <GallerySettings
              id="gallery"
              disabled={isSubmitting}
              wallHeight={{
                minValue: minHeight,
                value: wallHeight,
                onChange: setWallHeight,
              }}
              wallColor={wallColor}
              onWallColorChange={setWallColor}
            />
          </section>
        </Popover.Body>
      </Popover>

      <FloatingActionButton
        className={cx(styles.fab, settingsPopover.isExpanded && styles.fabExpanded)}
        onClick={() => setIsAddingArtwork(true)}
        disabled={isSubmitting}
        title="Add new artwork">
        <span className={styles.fabIcon}>
          <Close />
        </span>
      </FloatingActionButton>

      {isAddingArtwork && <AddArtworkRoot onClose={() => setIsAddingArtwork(false)} />}
    </Fragment>
  );
};
