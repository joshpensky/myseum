import { Fragment, useState } from 'react';
import cx from 'classnames';
import { Artwork, ArtworkProps } from '@src/components/Artwork';
import { useGrid } from '@src/features/grid';
import { GridRenderItemProps } from '@src/features/grid/Grid';
import DragHandle from '@src/svgs/DragHandle';
import styles from './gridArtwork.module.scss';

interface GridArtworkItem {
  artwork: ArtworkProps['data'];
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}

interface GridArtworkProps extends GridRenderItemProps {
  item: GridArtworkItem;
  isEditing?: boolean;
}

export const GridArtwork = ({
  item,
  isEditing,
  disabled,
  moveType,
  error,
  dragHandleProps,
}: GridArtworkProps) => {
  const gridCtx = useGrid();

  const [isLoaded, setIsLoaded] = useState(false);

  const isDragging = !!moveType;
  const frameHeight = item.artwork.frame?.height ?? item.artwork.height;
  const frameDepth = item.artwork.frame?.depth ?? 0;

  /**
   * Gets the pixel value for a shadow, scaled to the grid item size.
   *
   * @param value the value to scale
   */
  const px = (value: number) => `${value * ((gridCtx?.unitPx ?? 0) / 25)}px`;

  // When dragging, increase the x/y offset of shadows by 150%
  const shadowOffsetMultiplier = isDragging ? 1.5 : 1;
  // Cast small shadow (bottom right)
  const shadowSm = [
    px(frameHeight * 0.25 * shadowOffsetMultiplier),
    px(frameHeight * 0.25 * shadowOffsetMultiplier),
    px(frameDepth * 5),
    px(-2),
    styles.varColorShadowSm,
  ].join(' ');
  // Cast larger shadow (bottom right)
  const shadowLg = [
    px(frameHeight * 0.75 * shadowOffsetMultiplier),
    px(frameHeight * 0.75 * shadowOffsetMultiplier),
    px(frameDepth * 10),
    px(frameDepth * 2),
    styles.varColorShadowLg,
  ].join(' ');
  // Cast highlight (top left)
  const highlight = [
    px(frameHeight * -0.5 * shadowOffsetMultiplier),
    px(frameHeight * -0.5 * shadowOffsetMultiplier),
    px(frameDepth * 15),
    px(frameDepth),
    styles.varColorHighlight,
  ].join(' ');

  return (
    <div className={cx(styles.wrapper)}>
      <div
        className={cx(
          styles.artwork,
          isDragging && styles.artworkDragging,
          disabled && styles.artworkDisabled,
          error && [styles.artworkError, styles[`error--${error}`]],
        )}
        style={{
          // When dragging, scale the artwork up by 1/4 of a grid unit
          '--drag-scale': 1 + 1 / (frameHeight * 4),
        }}>
        {isLoaded && (
          <Fragment>
            <div className={cx(styles.artworkShadow)} style={{ '--shadow': shadowSm }} />
            <div className={cx(styles.artworkShadow)} style={{ '--shadow': shadowLg }} />
            <div className={cx(styles.artworkShadow)} style={{ '--shadow': highlight }} />
          </Fragment>
        )}

        <Artwork
          data={item.artwork}
          disabled={disabled || isEditing}
          onLoad={() => setIsLoaded(true)}
        />
      </div>

      {isEditing && (
        <button className={cx(styles.dragHandle)} {...dragHandleProps} aria-label="Drag">
          <span>
            <DragHandle />
          </span>
        </button>
      )}
    </div>
  );
};
