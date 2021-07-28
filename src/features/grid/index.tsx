import { ReactNode, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { Grid } from './Grid';
import { GridItem, GridItemChildProps } from './GridItem';
import { isInBounds } from './bounds';
import styles from './styles.module.scss';
import { ItemError, MoveControllerType, Position, Size } from './types';

const cx = classNames.bind(styles);

export interface GridItem {
  position: Position;
  size: Size;
}

interface GridFeatureProps<Item extends GridItem> {
  className?: string;
  items: Item[];
  getItemId(item: Item): string;
  size: Size;
  unitPx: number;
  onItemChange(index: number, value: Item): void;
  onSizeChange?(value: Size): void;
  renderItem(item: Item, props: GridItemChildProps & { disabled: boolean }): ReactNode;
}

function GridFeature<Item extends GridItem>({
  className,
  items,
  size,
  unitPx,
  getItemId,
  renderItem,
  onItemChange,
  onSizeChange,
}: GridFeatureProps<Item>) {
  const [gridMoveType, setGridMoveType] = useState<MoveControllerType | null>(null);

  const shouldAutoExpand = !!onSizeChange;

  const isItemInBounds = (item: Item) =>
    isInBounds(item, {
      top: 0,
      bottom: size.height,
      left: 0,
      right: size.width,
    });

  const doItemsOverlap = (itemA: Item, itemB: Item) => {
    let doesXOverlap: boolean;
    if (itemA.position.x <= itemB.position.x) {
      // If item A is before item B, check that item A width doesn't extend into B
      doesXOverlap = itemA.position.x + itemA.size.width > itemB.position.x;
    } else {
      // If item B is before item A, check that item B width doesn't extend into A
      doesXOverlap = itemB.position.x + itemB.size.width > itemA.position.x;
    }

    let doesYOverlap: boolean;
    if (itemA.position.y <= itemB.position.y) {
      // If item A is before item B, check that item A height doesn't extend into B
      doesYOverlap = itemA.position.y + itemA.size.height > itemB.position.y;
    } else {
      // If item B is before item A, check that item B height doesn't extend into A
      doesYOverlap = itemB.position.y + itemB.size.height > itemA.position.y;
    }

    // Confirm X & Y overlap doesn't occur!
    return doesXOverlap && doesYOverlap;
  };

  // Declare projection states
  const [itemErrorMap, setItemErrorMap] = useState(new Map<string, ItemError>());
  const [projectedItem, setProjectedItem] = useState<GridItem | null>(null);

  const onPositionProjectionChange = (index: number, position: Position) => {
    const referredItem = items[index];
    const projectedItem = {
      ...referredItem,
      position,
    };

    const newItemErrorMap = new Map(itemErrorMap);

    // Check if any of the other items are overlapping with moving item
    const overlapStates = items.map(item => {
      // Skip over the moving item
      if (getItemId(item) === getItemId(projectedItem)) {
        return false;
      }

      const doesOverlap = doItemsOverlap(item, projectedItem);
      if (doesOverlap) {
        newItemErrorMap.set(getItemId(item), 'overlapping');
        return true;
      } else {
        newItemErrorMap.delete(getItemId(item));
        return false;
      }
    });

    if (overlapStates.some(Boolean)) {
      // If there are any overlapping items, update moving item's state!
      newItemErrorMap.set(getItemId(projectedItem), 'overlapping');
      setProjectedItem(null);
    } else if (!shouldAutoExpand && !isItemInBounds(projectedItem)) {
      // If moving item is out of bounds (and the grid doesn't auto-expand), update state!
      newItemErrorMap.set(getItemId(projectedItem), 'out-of-bounds');
      setProjectedItem(null);
    } else {
      // Otherwise, clear state
      newItemErrorMap.delete(getItemId(projectedItem));
      setProjectedItem({
        position: projectedItem.position,
        size: projectedItem.size,
      });
    }

    setItemErrorMap(newItemErrorMap);
  };

  /**
   * Event handler for when an item's position has changed. Checks if the
   * item can move to the projected position and, if so, updates the item.
   *
   * @param index the index of the item
   * @param position the item's new projected position
   * @returns the final position of the item, which could be the same if the change is rejected
   */
  const onPositionChange = (index: number, position: Position): Position => {
    const currentItem = items[index];
    const projectedItem = {
      ...currentItem,
      position,
    };

    // Remove all projection state
    setProjectedItem(null);
    setItemErrorMap(new Map());

    // If item is out of bounds, don't update position
    if (!isItemInBounds(projectedItem)) {
      return currentItem.position;
    }

    const itemsBefore = items.slice(0, index);
    const doItemsBeforeOverlap = itemsBefore.some(item => doItemsOverlap(item, projectedItem));
    const itemsAfter = items.slice(index + 1);
    const doItemsAfterOverlap = itemsAfter.some(item => doItemsOverlap(item, projectedItem));

    // If any items are overlapping, don't update position
    if (doItemsBeforeOverlap || doItemsAfterOverlap) {
      return currentItem.position;
    }

    // Otherwise, good to update position!
    onItemChange(index, projectedItem);
    // And return the changed position
    return projectedItem.position;
  };

  // Auto-expand the grid when the projected item moves toward an edge
  useIsomorphicLayoutEffect(() => {
    if (shouldAutoExpand && projectedItem) {
      const nextSize = { ...size };
      const projectedItemRightX = projectedItem.position.x + projectedItem.size.width;
      const projectedItemBottomY = projectedItem.position.y + projectedItem.size.height;

      onSizeChange?.({
        width: Math.max(nextSize.width, projectedItemRightX + 1),
        height: Math.max(nextSize.height, projectedItemBottomY + 1),
      });
    }
  }, [projectedItem?.position, projectedItem?.size]);

  // When a mouse item is moving, use the grabbing cursor
  useEffect(() => {
    document.body.classList.toggle(cx('grabbing'), gridMoveType === 'mouse');
  }, [gridMoveType]);

  return (
    <Grid className={className} size={size} unitPx={unitPx}>
      {items.map((item, idx) => (
        <GridItem
          key={getItemId(item)}
          id={getItemId(item)}
          position={item.position}
          size={item.size}
          error={itemErrorMap.get(getItemId(item))}
          onMoveTypeChange={moveType => setGridMoveType(moveType)}
          onPositionChange={action => onPositionChange(idx, action)}
          onPositionProjectionChange={action => onPositionProjectionChange(idx, action)}>
          {itemProps => {
            // Disabled if an item is moving and it's NOT this one
            const disabled = !!gridMoveType && !itemProps.moveType;

            return renderItem(item, { ...itemProps, disabled });
          }}
        </GridItem>
      ))}
    </Grid>
  );
}

export default GridFeature;
