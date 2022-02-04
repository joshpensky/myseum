import { Fragment, useState } from 'react';
import { GalleryColor } from '@prisma/client';
import cx from 'classnames';
import useSWR from 'swr';
import { Artwork } from '@src/components/Artwork';
import { Popover } from '@src/components/Popover';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import * as CreateArtwork from '@src/features/create-artwork';
import FloatingActionButton from '@src/features/gallery/FloatingActionButton';
import GallerySettings from '@src/features/gallery/GallerySettings';
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
  galleryArtworks: GridArtworkItem[];
  onAddArtwork(artwork: ArtworkDto): void;
}

export const GalleryEditActions = ({
  isSubmitting,
  minHeight,
  wallHeight,
  onHeightChange,
  wallColor,
  onColorChange,
  galleryArtworks,
  onAddArtwork,
}: GalleryEditActionsProps) => {
  const [isSettingsPopoverOpen, setIsSettingsPopoverOpen] = useState(false);

  const [isAddingArtwork, setIsAddingArtwork] = useState(false);
  const [isArtworkPopoverOpen, setIsArtworkPopoverOpen] = useState(false);

  const [shouldLoadArtworks, setShouldLoadArtworks] = useState(false);
  const artworksSwr = useSWR<ArtworkDto[]>(shouldLoadArtworks ? '/api/artworks' : null);
  const areArtworksLoading = !artworksSwr.error && !artworksSwr.data;

  // Filter the artworks data to exclude any artworks currently on the gallery wall
  const existingArtworkIdSet = new Set(galleryArtworks.map(item => item.artwork.id));
  const artworks = (artworksSwr.data ?? []).filter(
    artwork => !existingArtworkIdSet.has(artwork.id),
  );

  return (
    <Fragment>
      {/* Settings */}
      <div className={styles.fabWrapper}>
        <Popover.Root onOpenChange={open => setIsSettingsPopoverOpen(open)}>
          <Popover.Trigger asChild>
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
      </div>

      {/* Artwork */}
      <div className={styles.fabWrapper}>
        <Popover.Root
          open={isArtworkPopoverOpen}
          onOpenChange={open => {
            setIsArtworkPopoverOpen(open);
            if (open) {
              setShouldLoadArtworks(true);
            }
          }}>
          <Popover.Trigger asChild>
            <FloatingActionButton
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
                        <Artwork artwork={item} disabled />
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
              <CreateArtwork.Root
                open={isAddingArtwork}
                onOpenChange={setIsAddingArtwork}
                onComplete={data => {
                  onAddArtwork(data);
                  setIsAddingArtwork(false);
                  setIsArtworkPopoverOpen(false);
                }}>
                <CreateArtwork.Trigger>
                  <button className={styles.uploadButton}>Upload new artwork</button>
                </CreateArtwork.Trigger>
              </CreateArtwork.Root>
            </Popover.Body>
          </Popover.Content>
        </Popover.Root>
      </div>
    </Fragment>
  );
};
