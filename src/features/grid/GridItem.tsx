import React, { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import anime from 'animejs';
import classNames from 'classnames/bind';
import { isInBounds } from './bounds';
import { getScrollBounds, getScrollDelta, getScrollParent } from './scroll';
import styles from './styles.module.scss';
import { ItemError, MoveControllerType, Position, Size } from './types';
import { useGrid } from './useGrid';

const cx = classNames.bind(styles);

interface DragHandleProps<E extends HTMLElement = HTMLElement> {
  ref: React.RefObject<E>;
  onMouseDown(evt: React.MouseEvent<E>): void;
  onBlur(evt: React.FocusEvent<E>): void;
  onKeyDown(evt: React.KeyboardEvent<E>): void;
  'aria-describedby': string;
}

interface GridItemChildProps<DragHandleElement extends HTMLElement> {
  moveController: MoveControllerType | null;
  error: ItemError | undefined;
  dragHandleProps: DragHandleProps<DragHandleElement>;
}

interface GridItemProps<DragHandleElement extends HTMLElement> {
  children(props: GridItemChildProps<DragHandleElement>): ReactNode;
  id: string | number;
  error: ItemError | undefined;
  position: Position;
  size: Size;
  onMoveControllerChange(moveController: MoveControllerType | null): void;
  onPositionChange(position: Position): Position | null;
  onPositionProjectionChange(position: Position): void;
}

export function GridItem<DragHandleElement extends HTMLElement>({
  children,
  error,
  id,
  position,
  size,
  onMoveControllerChange,
  onPositionChange,
  onPositionProjectionChange,
}: GridItemProps<DragHandleElement>) {
  const grid = useGrid();

  const itemRef = useRef<HTMLDivElement>(null);
  const itemAnimateRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<DragHandleElement>(null);

  const [isAnimating, setIsAnimating] = useState(false);
  const [moveController, setMoveController] = useState<MoveControllerType | null>(null);
  useEffect(() => {
    onMoveControllerChange(moveController);
  }, [moveController]);

  const [moveDeltaPx, setMoveDeltaPx] = useState<Position>({ x: 0, y: 0 });

  // Offset from the parent container
  const [parentOffsetPx, setParentOffsetPx] = useState<Position>({
    x: 0,
    y: 0,
  });

  // Parent offset combined with scroll offset
  const scrollParent = getScrollParent(itemRef.current);
  const moveOffsetPx: Position = {
    x: parentOffsetPx.x - scrollParent.scrollLeft,
    y: parentOffsetPx.y - scrollParent.scrollTop,
  };

  /**
   * Animates the item resetting the user's move delta, back to its current position
   * on the grid.
   *
   * @param translateFromOverride an override for the translateFrom state (defaults to the current `moveDeltaPx` value)
   */
  const snapIntoPlace = (translateFromOverride?: Position) => {
    const translateFrom = translateFromOverride ?? moveDeltaPx;

    let scrollDelta: Position = { x: 0, y: 0 };
    if (itemAnimateRef.current) {
      // Get the projected actual (px) position of the item on the screen
      // after the move would be applied
      const rect = itemAnimateRef.current.getBoundingClientRect();
      const item = {
        // Rect position is set at moveDeltaPx.{x,y}
        // If translateFrom is overridden, calculate to find the transformation
        position: {
          x: rect.x - (translateFrom.x - moveDeltaPx.x),
          y: rect.y - (translateFrom.y - moveDeltaPx.y),
        },
        size: {
          width: rect.width,
          height: rect.height,
        },
      };

      // If item is not in bounds of scrolling viewport...
      const scrollBounds = getScrollBounds(scrollParent);
      if (!isInBounds(item, scrollBounds)) {
        // -> Get the distance needed to scroll
        scrollDelta = getScrollDelta(item, scrollParent, {
          scrollByDistance: true,
        });
      }
    }

    const initialScrollPosition: Position = {
      x: scrollParent.scrollLeft,
      y: scrollParent.scrollTop,
    };

    // Animate the item snapping into place
    setIsAnimating(true);
    const tl = anime.timeline({
      complete() {
        if (itemAnimateRef.current) {
          itemAnimateRef.current.style.transform = '';
        }
        setIsAnimating(false);
      },
    });
    tl.add({
      targets: itemAnimateRef.current,
      // Translate from offset+delta to offset (resolved by removing position:fixed)
      translateX: [
        parentOffsetPx.x - initialScrollPosition.x + translateFrom.x,
        parentOffsetPx.x - (initialScrollPosition.x + scrollDelta.x),
      ],
      translateY: [
        parentOffsetPx.y - initialScrollPosition.y + translateFrom.y,
        parentOffsetPx.y - (initialScrollPosition.y + scrollDelta.y),
      ],
      easing: 'easeOutExpo',
      duration: 300,
    });
    if (scrollDelta.x || scrollDelta.y) {
      tl.add(
        {
          targets: scrollParent,
          // Translate from offset+delta to offset (resolved by removing position:fixed)
          scrollLeft: [initialScrollPosition.x, initialScrollPosition.x + scrollDelta.x],
          scrollTop: [initialScrollPosition.y, initialScrollPosition.y + scrollDelta.y],
          easing: 'easeOutExpo',
          duration: 300,
        },
        0,
      );
    }

    // And reset delta state immediately
    setMoveDeltaPx({ x: 0, y: 0 });
  };

  // Add an offset from the grid for when the item is position:fixed and moving
  useLayoutEffect(() => {
    if (moveController && itemRef.current) {
      const offsetParent = itemRef.current.offsetParent;
      if (offsetParent instanceof HTMLElement) {
        // If there's an offset parent, use their left + top!
        setParentOffsetPx({
          x: offsetParent.offsetLeft,
          y: offsetParent.offsetTop,
        });
      } else {
        // If no offset parent, just reset to 0
        setParentOffsetPx({
          x: 0,
          y: 0,
        });
      }
    }
  }, [moveController]);

  interface ScrollOpts {
    viewport: Element;
    mouse: Position;
  }
  const [scrollOpts, setScrollOpts] = useState<ScrollOpts | null>(null);
  const scrollRafIdRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  // Auto-scroll for mouse navigation
  useLayoutEffect(() => {
    // Cancel any old RAF
    if (scrollRafIdRef.current) {
      window.cancelAnimationFrame(scrollRafIdRef.current);
      scrollRafIdRef.current = null;
    }

    if (scrollOpts) {
      const updateScrollPosition = () => {
        // Get scroll delta
        const scrollDelta = getScrollDelta({ position: scrollOpts.mouse }, scrollOpts.viewport);

        // If there is scroll space to move...
        if (scrollDelta.x || scrollDelta.y) {
          // -> Update the viewport scroll
          scrollOpts.viewport.scrollTop += scrollDelta.y;
          scrollOpts.viewport.scrollLeft += scrollDelta.x;
          // -> Update the delta state to account for scroll
          setMoveDeltaPx(posDelta => ({
            x: posDelta.x + scrollDelta.x,
            y: posDelta.y + scrollDelta.y,
          }));
        }

        // Then loop with RAF
        scrollRafIdRef.current = window.requestAnimationFrame(() => {
          updateScrollPosition();
        });
      };

      // Begin RAF loop
      scrollRafIdRef.current = window.requestAnimationFrame(() => {
        updateScrollPosition();
      });
    }
  }, [scrollOpts]);

  function scrollIntoView(offsetPx?: Position): Position | null {
    // If the ref isn't available, early return!
    if (!itemAnimateRef.current) {
      return null;
    }

    // Get the projected actual (px) position of the item on the screen
    // after the move would be applied
    const rect = itemAnimateRef.current.getBoundingClientRect();
    const item = {
      position: {
        x: rect.x + (offsetPx?.x ?? 0),
        y: rect.y + (offsetPx?.y ?? 0),
      },
      size: {
        width: rect.width,
        height: rect.height,
      },
    };

    const scrollBounds = getScrollBounds(scrollParent);
    // If it is in bounds, early return!
    if (isInBounds(item, scrollBounds)) {
      return null;
    }

    // If item is not in bounds of scrolling viewport...
    // -> Get the distance needed to scroll
    const scrollDelta = getScrollDelta(item, scrollParent, {
      scrollByDistance: true,
    });
    // -> Update viewport scroll
    scrollParent.scrollLeft += scrollDelta.x;
    scrollParent.scrollTop += scrollDelta.y;
    // -> Return the amount scrolled
    return scrollDelta;
  }

  /**
   * Moves the grid item for keyboard navigation. This handles
   * auto-scrolling the viewport and updating the `moveDeltaPx` state.
   *
   * @param positionDelta the change in position, by grid units (not px!)
   */
  function moveByKeyboard(positionDelta: Position) {
    // If the ref isn't available, early return!
    if (!itemAnimateRef.current) {
      return;
    }

    // Scroll the item into view
    scrollIntoView({
      x: positionDelta.x * grid.unitPx,
      y: positionDelta.y * grid.unitPx,
    });

    // Then update move delta px state
    // Note: it's important that we scroll _before_ updating state to prevent jankiness
    setMoveDeltaPx({
      x: moveDeltaPx.x + positionDelta.x * grid.unitPx,
      y: moveDeltaPx.y + positionDelta.y * grid.unitPx,
    });
  }

  // When the item is moving via mouse navigation, track mouse move+up via document
  useEffect(() => {
    if (moveController === 'mouse') {
      const onMouseMove = (evt: MouseEvent) => {
        // Prevent browser from auto-scrolling on drag
        evt.preventDefault();

        // Update move delta on mouse move
        setMoveDeltaPx(posDelta => ({
          x: posDelta.x + evt.movementX,
          y: posDelta.y + evt.movementY,
        }));

        // Initialize auto-scrolling (so it continues to scroll without movement)
        const scrollParent = getScrollParent(itemRef.current);
        const scrollBounds = getScrollBounds(scrollParent);
        const mousePosition: Position = { x: evt.clientX, y: evt.clientY };
        if (!isInBounds({ position: mousePosition }, scrollBounds)) {
          setScrollOpts({ viewport: scrollParent, mouse: mousePosition });
        } else {
          setScrollOpts(null);
        }
      };

      // Cancel moving when mouse is released
      const onMouseUp = () => {
        setMoveController(null);
        setScrollOpts(null);
      };

      // Toggle event listeners
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      return () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [moveController]);

  // Get the position the element would snap to given the current delta
  function getProjectedPosition(position: Position, deltaPx: Position) {
    const deltaX = Math.round(deltaPx.x / grid.unitPx);
    const deltaY = Math.round(deltaPx.y / grid.unitPx);

    return {
      x: position.x + deltaX,
      y: position.y + deltaY,
    };
  }

  // Update projected position when delta changes
  useEffect(() => {
    if (moveController) {
      const projectedPosition = getProjectedPosition(position, moveDeltaPx);
      onPositionProjectionChange(projectedPosition);
    }
  }, [moveController, moveDeltaPx.x, moveDeltaPx.y, grid.unitPx]);

  // Update the new actual position when no longer moving
  useLayoutEffect(() => {
    if (!moveController) {
      // Update position state
      const projectedPosition = getProjectedPosition(position, moveDeltaPx);
      const newPosition = onPositionChange(projectedPosition);

      // If element position did not change, don't animate
      if (moveDeltaPx.x === 0 && moveDeltaPx.y === 0) {
        return;
      }

      // If position did change, update delta to account for new position
      let translateFrom: Position | undefined;
      if (newPosition) {
        translateFrom = {
          x: moveDeltaPx.x - (newPosition.x - position.x) * grid.unitPx,
          y: moveDeltaPx.y - (newPosition.y - position.y) * grid.unitPx,
        };
      }
      // Then animate the item snapping into place
      snapIntoPlace(translateFrom);
    }
  }, [moveController]);

  const instructionsId = `grid-item-${id}-instructions`;
  const dragHandleProps: DragHandleProps<DragHandleElement> = {
    ref: dragHandleRef,
    'aria-describedby': instructionsId,
    // Handles mouse navigation on the drag handle
    onMouseDown: evt => {
      if (!isAnimating && !moveController && evt.button === 0) {
        setMoveController('mouse');
      }
    },
    // Handles cancelling keyboard navigation on the drag handle
    onBlur: () => {
      // If focus is lost during keyboard navigation, cancel the move
      if (moveController === 'keyboard') {
        snapIntoPlace();
        setMoveController(null);
      }
    },
    // Handles keyboard navigation on the drag handle
    // inspired by: https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/sensors/keyboard.md
    onKeyDown: evt => {
      // Activate keyboard navigation with spacebar
      if (!moveController && evt.key === ' ') {
        evt.preventDefault();
        setMoveController('keyboard');
        scrollIntoView();
        return;
      }
      // If keyboard is moving, allow keyboard nav as follows:
      if (moveController === 'keyboard') {
        switch (evt.key) {
          case 'Tab':
          case 'Enter': {
            // Prevent submission or tabbing
            evt.preventDefault();
            break;
          }
          case 'Escape': {
            // On escape, cancel the move
            evt.preventDefault();
            snapIntoPlace();
            setMoveController(null);
            break;
          }
          case ' ': {
            // On spacebar, release the item
            evt.preventDefault();
            // TODO: account for user manually scrolling viewport (not just auto-scrolling)
            setMoveController(null);
            break;
          }
          case 'ArrowUp': {
            evt.preventDefault();
            moveByKeyboard({ x: 0, y: -1 });
            break;
          }
          case 'ArrowDown': {
            evt.preventDefault();
            moveByKeyboard({ x: 0, y: 1 });
            break;
          }
          case 'ArrowLeft': {
            evt.preventDefault();
            moveByKeyboard({ x: -1, y: 0 });
            break;
          }
          case 'ArrowRight': {
            evt.preventDefault();
            moveByKeyboard({ x: 1, y: 0 });
            break;
          }
        }
      }
    },
  };

  return (
    <div ref={itemRef}>
      <div
        ref={itemAnimateRef}
        className={cx('item', 'movable', (isAnimating || !!moveController) && 'movable--active')}
        style={{
          '--item-grid-x': position.x,
          '--item-grid-y': position.y,
          '--item-grid-width': size.width,
          '--item-grid-height': size.height,
          '--item-delta-x': moveOffsetPx.x + moveDeltaPx.x,
          '--item-delta-y': moveOffsetPx.y + moveDeltaPx.y,
        }}>
        {children({ moveController, error, dragHandleProps })}

        <div id={instructionsId} className={cx('drag-handle-instructions')}>
          Press space bar to start a drag. When dragging you can use the arrow keys to move the item
          around and escape to cancel. Ensure your screen reader is in focus mode or forms mode.
        </div>
      </div>
    </div>
  );
}
