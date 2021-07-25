import { useEffect, useLayoutEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { Grid } from './Grid';
import { GridItem } from './GridItem';
import { isInBounds } from './bounds';
import styles from './styles.module.scss';
import { ItemError, MoveControllerType, Position, Size } from './types';

const cx = classNames.bind(styles);

// TODO: drag to trash icon! (maybe delete key for keyboard-users?)
// TODO: touch support!
// TODO: a11y: announcements!
// TODO: finding a place to add new items

interface BaseItem {
  position: Position;
  size: Size;
}

interface Item extends BaseItem {
  id: number;
  color: string;
}

export default function App() {
  const [gridSize, setGridSize] = useState({ width: 10, height: 20 });

  const [items, setItems] = useState<Item[]>([
    {
      id: 1,
      color: 'rebeccapurple',
      position: { x: 0, y: 0 },
      size: { width: 1, height: 1 },
    },
    {
      id: 2,
      color: 'pink',
      position: { x: 5, y: 6 },
      size: { width: 2, height: 3 },
    },
    {
      id: 3,
      color: 'MediumSeaGreen',
      position: { x: 2, y: 14 },
      size: { width: 5, height: 2 },
    },
  ]);

  const [gridMoveType, setGridMoveType] = useState<MoveControllerType | null>(null);

  const isItemInBounds = (item: Item) =>
    isInBounds(item, {
      top: 0,
      bottom: gridSize.height,
      left: 0,
      right: gridSize.width,
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
  const [itemErrorMap, setItemErrorMap] = useState(new Map<number, ItemError>());
  const [projectedItem, setProjectedItem] = useState<BaseItem | null>(null);

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
      if (item.id === projectedItem.id) {
        return false;
      }

      const doesOverlap = doItemsOverlap(item, projectedItem);
      if (doesOverlap) {
        newItemErrorMap.set(item.id, 'overlapping');
        return true;
      } else {
        newItemErrorMap.delete(item.id);
        return false;
      }
    });

    if (overlapStates.some(Boolean)) {
      // If there are any overlapping items, update moving item's state!
      newItemErrorMap.set(projectedItem.id, 'overlapping');
      setProjectedItem(null);
    } else if (!isItemInBounds(projectedItem)) {
      // If moving item is out of bounds, update state!
      newItemErrorMap.set(projectedItem.id, 'out-of-bounds');
      setProjectedItem(null);
    } else {
      // Otherwise, clear state
      newItemErrorMap.delete(projectedItem.id);
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
    const referredItem = items[index];
    const projectedItem = {
      ...referredItem,
      position,
    };

    // Remove all projection state
    setProjectedItem(null);
    setItemErrorMap(new Map());

    // If item is out of bounds, don't update position
    if (!isItemInBounds(projectedItem)) {
      return referredItem.position;
    }

    const itemsBefore = items.slice(0, index);
    const doItemsBeforeOverlap = itemsBefore.some(item => doItemsOverlap(item, projectedItem));
    const itemsAfter = items.slice(index + 1);
    const doItemsAfterOverlap = itemsAfter.some(item => doItemsOverlap(item, projectedItem));

    // If any items are overlapping, don't update position
    if (doItemsBeforeOverlap || doItemsAfterOverlap) {
      return referredItem.position;
    }

    // Otherwise, good to update position!
    setItems([...itemsBefore, projectedItem, ...itemsAfter]);
    return projectedItem.position;
  };

  // Auto-expand the grid when the projected item moves toward an edge
  useLayoutEffect(() => {
    if (projectedItem) {
      const nextGridSize = { ...gridSize };
      const projectedItemRightX = projectedItem.position.x + projectedItem.size.width;
      if (nextGridSize.width <= projectedItemRightX) {
        nextGridSize.width += 1;
      }
      const projectedItemBottomY = projectedItem.position.y + projectedItem.size.height;
      if (nextGridSize.height <= projectedItemBottomY) {
        nextGridSize.height += 1;
      }
      setGridSize(nextGridSize);
    }
  }, [projectedItem?.position, projectedItem?.size]);

  // When a mouse item is moving, use the grabbing cursor
  useEffect(() => {
    document.body.classList.toggle(cx('grabbing'), gridMoveType === 'mouse');
  }, [gridMoveType]);

  return (
    <div className={cx('scroll-container')}>
      <Grid size={gridSize}>
        {items.map((item, idx) => (
          <GridItem<HTMLButtonElement>
            key={item.id}
            id={item.id}
            position={item.position}
            size={item.size}
            error={itemErrorMap.get(item.id)}
            onMoveTypeChange={moveType => setGridMoveType(moveType)}
            onPositionChange={action => onPositionChange(idx, action)}
            onPositionProjectionChange={action => onPositionProjectionChange(idx, action)}>
            {({ moveType, error, dragHandleProps }) => {
              // Disabled if an item is moving and it's NOT this one
              const disabled = !!gridMoveType && !moveType;

              return (
                <div
                  className={cx('wrapper', error)}
                  aria-disabled={disabled}
                  style={{ color: item.color }}>
                  <div className={cx('artwork', !!moveType && 'artwork--moving')} />

                  <button {...dragHandleProps} className={cx('drag-handle')} aria-label="Drag">
                    <span className="material-icons" aria-hidden="true">
                      drag_indicator
                    </span>
                  </button>
                </div>
              );
            }}
          </GridItem>
        ))}
      </Grid>
    </div>
  );
}
