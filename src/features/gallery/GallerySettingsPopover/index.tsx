import { Fragment, useState } from 'react';
import tw from 'twin.macro';
import { GalleryColor } from '@prisma/client';
import { Slot } from '@radix-ui/react-slot';
import cx from 'classnames';
import FloatingActionButton from '@src/components/FloatingActionButton';
import GallerySettings from '@src/components/GallerySettings';
import { Popover } from '@src/components/Popover';
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
  const [isAddingArtwork, setIsAddingArtwork] = useState(false);

  const [isSettingsPopoverOpen, setIsSettingsPopoverOpen] = useState(false);

  return (
    <Fragment>
      <Popover.Root onOpenChange={open => setIsSettingsPopoverOpen(open)}>
        <Popover.Trigger as={Slot}>
          <FloatingActionButton className={styles.fab} title="Open gallery settings">
            <span css={tw`block transform scale-110`}>
              <Cog />
            </span>
          </FloatingActionButton>
        </Popover.Trigger>

        <Popover.Content side="top" align="end" aria-label="Gallery settings">
          <Popover.Header>
            <h2>Settings</h2>
          </Popover.Header>

          <Popover.Body>
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
          </Popover.Body>
        </Popover.Content>
      </Popover.Root>

      <FloatingActionButton
        className={cx(styles.fab, isSettingsPopoverOpen && styles.fabExpanded)}
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
