import { Fragment, useRef, useState } from 'react';
import { GalleryColor } from '@prisma/client';
import { Slot } from '@radix-ui/react-slot';
import cx from 'classnames';
import useSWR from 'swr';
import { Artwork, ArtworkProps } from '@src/components/Artwork';
import FloatingActionButton from '@src/components/FloatingActionButton';
import GallerySettings from '@src/components/GallerySettings';
import { Popover } from '@src/components/Popover';
import AddArtworkRoot from '@src/features/add-artwork/AddArtworkRoot';
import { GridArtworkItem } from '@src/features/gallery/GridArtwork';
import Close from '@src/svgs/Close';
import Cog from '@src/svgs/Cog';
import styles from './galleryEditActions.module.scss';

interface GalleryEditActionsProps {
  isSubmitting: boolean;
  minHeight: number;
  wallHeight: number;
  onHeightChange(nextWallHeight: number): void;
  wallColor: GalleryColor;
  onColorChange(nextWallColor: GalleryColor): void;
  artworkItems: GridArtworkItem[];
  onAddArtwork(artwork: ArtworkProps['data']): void;
}

export const GalleryEditActions = ({
  isSubmitting,
  minHeight,
  wallHeight,
  onHeightChange,
  wallColor,
  onColorChange,
  artworkItems,
  onAddArtwork,
}: GalleryEditActionsProps) => {
  const [isSettingsPopoverOpen, setIsSettingsPopoverOpen] = useState(false);

  const addArtworkButtonRef = useRef<HTMLButtonElement>(null);
  const [isAddingArtwork, setIsAddingArtwork] = useState(false);
  const [isArtworkPopoverOpen, setIsArtworkPopoverOpen] = useState(false);

  const [shouldLoadArtworks, setShouldLoadArtworks] = useState(false);
  const artworksSwr = useSWR<ArtworkProps['data'][]>(shouldLoadArtworks ? `/api/artworks` : null);
  const areArtworksLoading = !artworksSwr.error && !artworksSwr.data;

  // Filter the artworks data to exclude any artworks currently on the gallery wall
  const existingArtworkIdSet = new Set(artworkItems.map(item => item.artwork.id));
  const artworks = (artworksSwr.data ?? []).filter(
    artwork => !existingArtworkIdSet.has(artwork.id),
  );

  return (
    <Fragment>
      <Popover.Root onOpenChange={open => setIsSettingsPopoverOpen(open)}>
        <Popover.Trigger as={Slot}>
          <FloatingActionButton
            className={styles.fab}
            disabled={isSubmitting}
            title="Open gallery settings">
            <span className={styles.settingsIcon}>
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
              disabled={isSubmitting}
              wallHeight={{
                minValue: minHeight,
                value: wallHeight,
                onChange: height => onHeightChange(height),
              }}
              wallColor={wallColor}
              onWallColorChange={color => onColorChange(color)}
            />
          </Popover.Body>
        </Popover.Content>
      </Popover.Root>

      <Popover.Root
        open={isArtworkPopoverOpen}
        onOpenChange={open => {
          setIsArtworkPopoverOpen(open);
          if (open) {
            setShouldLoadArtworks(true);
          }
        }}>
        <Popover.Trigger as={Slot}>
          <FloatingActionButton
            ref={addArtworkButtonRef}
            className={styles.fab}
            disabled={isSubmitting || isSettingsPopoverOpen}
            title="Add new artwork">
            <span className={cx(styles.closeIcon, !isArtworkPopoverOpen && styles.addIcon)}>
              <Close />
            </span>
          </FloatingActionButton>
        </Popover.Trigger>

        <Popover.Content side="top" align="end" aria-label="Add artwork">
          <Popover.Body className={styles.collectionSection}>
            <h2 className={styles.collectionTitle}>Choose artwork</h2>

            <div className={styles.collectionScrollable}>
              {areArtworksLoading && (
                <div className={styles.collectionLoading}>
                  {new Array(4).fill(null).map((_, idx) => (
                    <div key={idx} aria-hidden="true" />
                  ))}
                  <span className="sr-only">Loading</span>
                </div>
              )}

              {!areArtworksLoading && !artworks.length ? (
                <p className={styles.collectionEmpty}>You've added every artwork!</p>
              ) : (
                <ul className={styles.collection} aria-busy={areArtworksLoading}>
                  {artworks.map(item => (
                    <li key={item.id} className={styles.collectionItem}>
                      <Artwork data={item} disabled />
                      <button
                        className={styles.addArtworkButton}
                        onClick={() => {
                          // Add the artwork to the gallery
                          onAddArtwork(item);
                          // Then close the popover
                          setIsArtworkPopoverOpen(false);
                        }}
                        title={`Add artwork "${item.title}"`}
                        aria-label={`Add artwork "${item.title}"`}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Popover.Body>

          <Popover.Body className={styles.uploadSection}>
            <button
              className={styles.uploadButton}
              onClick={() => {
                // Close the popover (TODO: fix modal so we don't need to do this!!)
                setIsArtworkPopoverOpen(false);
                // Then open the add artwork modal
                setIsAddingArtwork(true);
              }}>
              Upload new artwork
            </button>
          </Popover.Body>
        </Popover.Content>
      </Popover.Root>

      {isAddingArtwork && (
        <AddArtworkRoot
          onClose={() => {
            // Update the modal state
            setIsAddingArtwork(false);
            // Then focus the add artwork button (TODO: fix modal so we don't need to do this!!)
            addArtworkButtonRef.current?.focus();
          }}
        />
      )}
    </Fragment>
  );
};
