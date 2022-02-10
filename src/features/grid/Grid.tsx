import { useEffect, useState } from 'react';
import cx from 'classnames';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { Position } from '@src/types';
import { GridItem, GridItemError } from './GridItem';
import { GridItemDto } from './GridRoot';
import { isInBounds } from './bounds';
import styles from './styles.module.scss';
import { useGrid } from './useGrid';
import { MoveControllerType } from './useMoveController';

interface GridProps {
  className?: string;
}

export function Grid({ className }: GridProps) {
  const grid = useGrid();

  const [gridMoveType, setGridMoveType] = useState<MoveControllerType | null>(null);

  const isItemInBounds = (item: GridItemDto) =>
    isInBounds(item, {
      top: 0,
      bottom: grid.size.height,
      left: 0,
      right: Infinity, // size.width,
    });

  const doItemsOverlap = (itemA: GridItemDto, itemB: GridItemDto) => {
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
  const [itemErrorMap, setItemErrorMap] = useState(new Map<string, GridItemError>());

  const onPositionProjectionChange = (index: number, position: Position) => {
    const referredItem = grid.items[index];
    const projectedItem = {
      ...referredItem,
      position,
    };

    const newItemErrorMap = new Map(itemErrorMap);

    // Check if any of the other items are overlapping with moving item
    const overlapStates = grid.items.map(item => {
      // Skip over the moving item
      if (grid.getItemId(item) === grid.getItemId(projectedItem)) {
        return false;
      }

      const doesOverlap = doItemsOverlap(item, projectedItem);
      if (doesOverlap) {
        newItemErrorMap.set(grid.getItemId(item), 'overlapping');
        return true;
      } else {
        newItemErrorMap.delete(grid.getItemId(item));
        return false;
      }
    });

    if (overlapStates.some(Boolean)) {
      // If there are any overlapping items, update moving item's state!
      newItemErrorMap.set(grid.getItemId(projectedItem), 'overlapping');
    } else if (!isItemInBounds(projectedItem)) {
      // If moving item is out of bounds (and the grid doesn't auto-expand), update state!
      newItemErrorMap.set(grid.getItemId(projectedItem), 'out-of-bounds');
    } else {
      // Otherwise, clear state
      newItemErrorMap.delete(grid.getItemId(projectedItem));
    }

    grid.setProjectedItem(projectedItem);
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
    if (!grid.onItemChange) {
      throw new Error('Cannot change position in read-only mode.');
    }

    const currentItem = grid.items[index];
    const projectedItem = {
      ...currentItem,
      position,
    };

    // Remove all projection state
    grid.setProjectedItem(null);
    setItemErrorMap(new Map());

    // If item is out of bounds, don't update position
    if (!isItemInBounds(projectedItem)) {
      return currentItem.position;
    }

    const itemsBefore = grid.items.slice(0, index);
    const doItemsBeforeOverlap = itemsBefore.some(item => doItemsOverlap(item, projectedItem));
    const itemsAfter = grid.items.slice(index + 1);
    const doItemsAfterOverlap = itemsAfter.some(item => doItemsOverlap(item, projectedItem));

    // If any items are overlapping, don't update position
    if (doItemsBeforeOverlap || doItemsAfterOverlap) {
      return currentItem.position;
    }

    // Otherwise, good to update position!
    grid.onItemChange(index, projectedItem);
    // And return the changed position
    return projectedItem.position;
  };

  // Auto-expand the grid when the projected item moves toward an edge
  useIsomorphicLayoutEffect(() => {
    if (grid.projectedItem && grid.onSizeChange) {
      const nextSize = { ...grid.size };
      const projectedItemRightX = grid.projectedItem.position.x + grid.projectedItem.size.width;
      const projectedItemBottomY = grid.projectedItem.position.y + grid.projectedItem.size.height;

      grid.onSizeChange({
        width: Math.max(nextSize.width, projectedItemRightX + 1),
        height: Math.max(nextSize.height, projectedItemBottomY + 1),
      });
    }
  }, [grid.projectedItem?.position, grid.projectedItem?.size]);

  // When a mouse item is moving, use the grabbing cursor
  useEffect(() => {
    document.body.classList.toggle(styles.grabbing, gridMoveType === 'mouse');
  }, [gridMoveType]);

  const evenUnitPx = Math.round(grid.unitPx);

  return (
    <div ref={grid.rootElRef} className={className}>
      <div
        ref={grid.gridRef}
        className={cx(styles.grid, grid.step >= 1 && styles.gridLarge)}
        style={{
          '--grid-step': grid.step,
          '--unit-px': `${grid.unitPx}px`,
          '--even-unit-px': `${evenUnitPx}px`,
          // Calculate a scale from the even unit size to the reguluar unit size
          // This will allow us to render crisp lines, and then scale them to the size we need it
          '--scale': grid.unitPx / evenUnitPx,
          '--grid-width': grid.size.width,
          '--grid-height': grid.size.height,
        }}>
        {grid.items.map((item, idx) => (
          <GridItem
            key={grid.getItemId(item)}
            id={grid.getItemId(item)}
            position={item.position}
            size={item.size}
            error={itemErrorMap.get(grid.getItemId(item))}
            onMoveTypeChange={moveType => setGridMoveType(moveType)}
            onPositionChange={action => onPositionChange(idx, action)}
            onPositionProjectionChange={action => onPositionProjectionChange(idx, action)}>
            {itemProps => {
              // Disabled if an item is moving and it's NOT this one
              const disabled = !!gridMoveType && !itemProps.moveType;

              return grid.renderItem(item, { ...itemProps, disabled }, idx);
            }}
          </GridItem>
        ))}
      </div>
    </div>
  );
}
