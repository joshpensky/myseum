import { Fragment, useState } from 'react';
import cx from 'classnames';
import { Artwork } from '@src/components/Artwork';
import { PlacedArtworkDto } from '@src/data/serializers/gallery.serializer';
import { useGrid } from '@src/features/grid';
import { GridRenderItemProps } from '@src/features/grid/GridRoot';
import DragHandle from '@src/svgs/DragHandle';
import { TrashIcon } from '@src/svgs/TrashIcon';
import styles from './gridArtwork.module.scss';

const REMOVE_ANIM_DURATION = Number.parseInt(styles.varRemoveAnimDuration, 10);

export interface GridArtworkItem extends PlacedArtworkDto {
  new?: boolean;
}

interface GridArtworkProps extends GridRenderItemProps {
  item: GridArtworkItem;
  isEditing?: boolean;
  onDetailsOpenChange?(open: boolean): void;
  onRemove?(): void;
}

export const GridArtwork = ({
  item,
  isEditing,
  disabled,
  moveType,
  error,
  dragHandleProps,
  onDetailsOpenChange,
  onRemove,
}: GridArtworkProps) => {
  const grid = useGrid();

  const isDragging = !!moveType;

  const [isLoaded, setIsLoaded] = useState(false);

  const [isRemoving, setIsRemoving] = useState(false);
  const handleRemove = () => {
    // Show the removing animation
    setIsRemoving(true);
    // Then handle actually removing the item after the animation has finished
    setTimeout(() => {
      onRemove?.();
    }, REMOVE_ANIM_DURATION);
  };

  /**
   * Gets the pixel value for a shadow, scaled to the grid item size.
   *
   * @param value the value to scale
   */
  const px = (value: number) => `${value * ((grid?.unitPx ?? 0) / 25)}px`;

  // When dragging, increase the x/y offset of shadows by 150%
  const shadowOffsetMultiplier = isDragging ? 1.5 : 1;
  const { height, depth } = item.artwork.size; // item.artwork.fullSize
  // Cast small shadow (bottom right)
  const shadowSm = [
    px(height * 0.25 * shadowOffsetMultiplier),
    px(height * 0.25 * shadowOffsetMultiplier),
    px(depth * 5),
    px(-2),
    styles.varColorShadowSm,
  ].join(' ');
  // Cast larger shadow (bottom right)
  const shadowLg = [
    px(height * 0.75 * shadowOffsetMultiplier),
    px(height * 0.75 * shadowOffsetMultiplier),
    px(depth * 10),
    px(depth * 2),
    styles.varColorShadowLg,
  ].join(' ');
  // Cast highlight (top left)
  const highlight = [
    px(height * -0.5 * shadowOffsetMultiplier),
    px(height * -0.5 * shadowOffsetMultiplier),
    px(depth * 15),
    px(depth),
    styles.varColorHighlight,
  ].join(' ');

  return (
    <div
      className={cx(
        styles.wrapper,
        item.new && styles.wrapperAdding,
        isRemoving && styles.wrapperRemoving,
      )}>
      <div
        className={cx(
          styles.artwork,
          isDragging && styles.artworkDragging,
          disabled && styles.artworkDisabled,
          error && [styles.artworkError, styles[`error--${error}`]],
        )}
        style={{
          // When dragging, scale the artwork up by 1/4 of a grid unit
          '--drag-scale': 1 + 1 / (height * 4),
        }}>
        <div className={styles.artworkInner}>
          {isLoaded && (
            <Fragment>
              <div className={cx(styles.artworkShadow)} style={{ '--shadow': shadowSm }} />
              <div className={cx(styles.artworkShadow)} style={{ '--shadow': shadowLg }} />
              <div className={cx(styles.artworkShadow)} style={{ '--shadow': highlight }} />
            </Fragment>
          )}

          <Artwork
            artwork={item.artwork}
            frame={item.frame}
            disabled={grid.preview || isEditing}
            onDetailsOpenChange={onDetailsOpenChange}
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      </div>

      {isEditing && (
        <div className={styles.actions}>
          <button
            {...dragHandleProps}
            className={styles.actionsItem}
            disabled={disabled}
            title="Move"
            aria-label="Move">
            <span>
              <DragHandle />
            </span>
          </button>

          {onRemove && (
            <button
              className={styles.actionsItem}
              disabled={disabled}
              onClick={() => handleRemove()}
              title="Remove"
              aria-label="Remove from gallery">
              <span>
                <TrashIcon />
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
