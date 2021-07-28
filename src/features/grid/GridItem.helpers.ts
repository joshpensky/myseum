import React, { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { Position } from '@src/types';
import { isInBounds } from './bounds';
import {
  getScrollBounds,
  getScrollDelta,
  getScrollParent,
  getScrollParentPosition,
} from './scroll';
import { MoveControllerType } from './types';
import { useGrid } from './useGrid';

export interface DragHandleProps {
  ref: React.RefObject<HTMLButtonElement>;
  'aria-describedby': string;
  onMouseDown(evt: React.MouseEvent<HTMLButtonElement>): void;
  onTouchStart(evt: React.TouchEvent<HTMLButtonElement>): void;
  onBlur(evt: React.FocusEvent<HTMLButtonElement>): void;
  onKeyDown(evt: React.KeyboardEvent<HTMLButtonElement>): void;
}

export interface UseMoveControllerOpts {
  position: Position;
  onPositionChange(position: Position): Position;
  onPositionProjectionChange(position: Position): void;
}

export interface MoveController {
  ref: RefObject<HTMLDivElement>;
  animatedRef: RefObject<HTMLDivElement>;
  move: {
    type: MoveControllerType | null;
    end(opts?: { cancelled?: boolean }): void;
    start(type: MoveControllerType): void;
  };
  isAnimating: boolean;
  translateOffsetPx: Position;
  translatePx: Position;
  translateTo: Dispatch<SetStateAction<Position>>;
  scrollParent: Element;
}

export function useMoveController({
  position,
  onPositionChange,
  onPositionProjectionChange,
}: UseMoveControllerOpts): MoveController {
  const grid = useGrid();

  const itemRef = useRef<HTMLDivElement>(null);
  const animatedItemRef = useRef<HTMLDivElement>(null);

  const [moveType, setMoveType] = useState<MoveControllerType | null>(null);
  const [itemTranslatePx, setItemTranslatePx] = useState<Position>({ x: 0, y: 0 });

  const [isAnimating, setIsAnimating] = useState(false);

  // Offset from the parent container
  const [parentOffsetPx, setParentOffsetPx] = useState<Position>({
    x: 0,
    y: 0,
  });
  // Add an offset from the grid for when the item is position:fixed and moving
  useIsomorphicLayoutEffect(() => {
    if (moveType && itemRef.current) {
      // The initial offset is 0
      const parentOffsetPx = {
        x: 0,
        y: 0,
      };

      // Loop through all positioned parents, and sum the offsets of each
      let offsetParent: Element | null = itemRef.current.offsetParent;
      while (offsetParent instanceof HTMLElement) {
        // Add the offset left + top to total
        parentOffsetPx.x += offsetParent.offsetLeft;
        parentOffsetPx.y += offsetParent.offsetTop;
        // Then loop to next offset parent
        offsetParent = offsetParent.offsetParent;
      }

      // Then set the total offset
      setParentOffsetPx(parentOffsetPx);
    }
  }, [moveType]);

  // Gets the parent of the itemRef that scrolls
  let scrollParent: Element;
  if (typeof document === 'undefined') {
    // When this hook is server-rendered, there is no document and thus this will be undefined
    // This should only affect the `itemTranslateOffsetPx` variable, as every other use is encapsulated
    // within a `useEffect` (which only runs client-side)
    scrollParent = (undefined as unknown) as Element;
  } else {
    // When this hook is then hydrated client-side, the scrollParent will get a real value
    // based on the document and fix any issues
    scrollParent = getScrollParent(itemRef.current);
  }
  const scrollParentPosition = getScrollParentPosition(scrollParent);

  // Parent offset combined with scroll offset
  const itemTranslateOffsetPx: Position = {
    x: parentOffsetPx.x - scrollParentPosition.x,
    y: parentOffsetPx.y - scrollParentPosition.y,
  };

  /**
   * Animates the item resetting the user's move delta, back to its current position
   * on the grid.
   *
   * @param translateFromPx the position to translate the item from (to it's current position)
   */
  const snapIntoPlace = (translateFromPx: Position) => {
    let scrollDelta: Position = { x: 0, y: 0 };
    if (animatedItemRef.current) {
      // Get the projected actual (px) position of the item on the screen
      // after the move would be applied
      const rect = animatedItemRef.current.getBoundingClientRect();
      const item = {
        // Rect position is set at itemTranslatePx.{x,y}
        // If translateFrom is overridden, calculate to find the transformation
        position: {
          x: rect.x - translateFromPx.x,
          y: rect.y - translateFromPx.y,
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

    // Get the initial scroll position of the parent, before animating to new position
    const initialScrollPositionPx = getScrollParentPosition(scrollParent);

    // Animate the item snapping into place
    setIsAnimating(true);
    const tl = anime.timeline({
      easing: 'easeOutExpo',
      duration: 300,
      complete() {
        if (animatedItemRef.current) {
          animatedItemRef.current.style.transform = '';
        }
        setIsAnimating(false);
      },
    });

    tl.add({
      targets: animatedItemRef.current,
      // Translate from offset+delta to offset (resolved by removing position:fixed)
      translateX: [
        parentOffsetPx.x - initialScrollPositionPx.x + translateFromPx.x,
        parentOffsetPx.x - (initialScrollPositionPx.x + scrollDelta.x),
      ],
      translateY: [
        parentOffsetPx.y - initialScrollPositionPx.y + translateFromPx.y,
        parentOffsetPx.y - (initialScrollPositionPx.y + scrollDelta.y),
      ],
    });

    if (scrollDelta.x || scrollDelta.y) {
      tl.add(
        {
          targets: scrollParent,
          // Translate from offset+delta to offset (resolved by removing position:fixed)
          scrollLeft: [initialScrollPositionPx.x, initialScrollPositionPx.x + scrollDelta.x],
          scrollTop: [initialScrollPositionPx.y, initialScrollPositionPx.y + scrollDelta.y],
        },
        0,
      );
    }

    // And reset translation immediately
    setItemTranslatePx({ x: 0, y: 0 });
  };

  // Get the position the element would snap to given the current delta
  function getProjectedPosition(position: Position, deltaPx: Position) {
    const deltaX = Math.round(deltaPx.x / grid.unitPx);
    const deltaY = Math.round(deltaPx.y / grid.unitPx);

    return {
      x: position.x + deltaX,
      y: position.y + deltaY,
    };
  }

  /**
   * Begins a new move, if not already moving.
   *
   * @param nextMoveType the type of move to start
   */
  const startMove = (nextMoveType: MoveControllerType) => {
    if (!isAnimating && !moveType) {
      setMoveType(nextMoveType);
    }
  };

  /**
   * Ends the current move. If the move was cancelled, the item will be
   * sent back to its original position.
   *
   * @param opts options for ending the move
   */
  const endMove = (opts?: { cancelled?: boolean }) => {
    // If there is no current move, early return!
    if (!moveType) {
      return;
    }

    // Remove the existing move type
    setMoveType(null);

    // Update position state
    const projectedPosition = getProjectedPosition(position, itemTranslatePx);
    const newPosition = onPositionChange(opts?.cancelled ? position : projectedPosition);

    // If element position did not change, don't animate
    if (itemTranslatePx.x === 0 && itemTranslatePx.y === 0) {
      return;
    }

    // Get the change in position
    const positionDelta = {
      x: newPosition.x - position.x,
      y: newPosition.y - position.y,
    };

    // Then get the transl
    const translateFrom = {
      x: itemTranslatePx.x - positionDelta.x * grid.unitPx,
      y: itemTranslatePx.y - positionDelta.y * grid.unitPx,
    };

    // Then animate the item snapping into place
    snapIntoPlace(translateFrom);
  };

  // Update projected position when delta changes
  useEffect(() => {
    if (moveType) {
      const projectedPosition = getProjectedPosition(position, itemTranslatePx);
      onPositionProjectionChange(projectedPosition);
    }
  }, [moveType, itemTranslatePx.x, itemTranslatePx.y, grid.unitPx]);

  return {
    ref: itemRef,
    animatedRef: animatedItemRef,
    scrollParent,
    move: {
      type: moveType,
      end: endMove,
      start: startMove,
    },
    isAnimating,
    translateOffsetPx: itemTranslateOffsetPx,
    translatePx: itemTranslatePx,
    translateTo: setItemTranslatePx,
  };
}

interface AutoScrollOpts {
  viewport: Element;
  cursor: Position;
}
interface AutoScroll {
  setOptions(options: AutoScrollOpts): void;
  cancel(): void;
}
function useAutoScroll(controller: MoveController): AutoScroll {
  const [options, setOptions] = useState<AutoScrollOpts | null>(null);
  const scrollRafIdRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  // Auto-scroll for mouse navigation
  useIsomorphicLayoutEffect(() => {
    // Cancel any old RAF
    if (scrollRafIdRef.current) {
      window.cancelAnimationFrame(scrollRafIdRef.current);
      scrollRafIdRef.current = null;
    }

    if (options) {
      const updateScrollPosition = () => {
        // Get scroll delta
        const scrollDelta = getScrollDelta({ position: options.cursor }, options.viewport);

        // If there is scroll space to move...
        if (scrollDelta.x || scrollDelta.y) {
          // -> Update the viewport scroll
          options.viewport.scrollTop += scrollDelta.y;
          options.viewport.scrollLeft += scrollDelta.x;
          // -> Update the delta state to account for scroll
          controller.translateTo(posDelta => ({
            x: posDelta.x + scrollDelta.x,
            y: posDelta.y + scrollDelta.y,
          }));
        }

        // Then loop with RAF
        scrollRafIdRef.current = window.requestAnimationFrame(() => {
          updateScrollPosition();
        });
      };

      updateScrollPosition();
    }
  }, [options]);

  return {
    setOptions: options => setOptions(options),
    cancel: () => setOptions(null),
  };
}

export function useMouseMove(
  controller: MoveController,
): Pick<DragHandleProps, 'onBlur' | 'onMouseDown'> {
  const { move, scrollParent, translateTo } = controller;

  const autoScroll = useAutoScroll(controller);

  // When the item is moving via mouse navigation, track mouse move+up via document
  useEffect(() => {
    if (move.type === 'mouse') {
      const onMouseMove = (evt: MouseEvent) => {
        // Prevent browser from auto-scrolling on drag
        evt.preventDefault();

        // Update move delta on mouse move
        translateTo(posDelta => ({
          x: posDelta.x + evt.movementX,
          y: posDelta.y + evt.movementY,
        }));

        // Initialize auto-scrolling (so it continues to scroll without movement)
        const scrollBounds = getScrollBounds(scrollParent);
        const mousePosition: Position = { x: evt.clientX, y: evt.clientY };
        if (!isInBounds({ position: mousePosition }, scrollBounds)) {
          autoScroll.setOptions({ viewport: scrollParent, cursor: mousePosition });
        } else {
          autoScroll.cancel();
        }
      };

      // Cancel moving when mouse is released
      const onMouseUp = () => {
        move.end();
        autoScroll.cancel();
      };

      // Toggle event listeners
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      return () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [move.type, scrollParent, move.end]);

  return {
    // Cancel auto-scrolling when the target is unfocused
    onBlur: () => {
      autoScroll.cancel();
    },
    // Start moving if the target is clicked on in an idle state
    onMouseDown: evt => {
      if (evt.button === 0) {
        move.start('mouse');
      }
    },
  };
}

export function useTouchMove(
  controller: MoveController,
): Pick<DragHandleProps, 'onBlur' | 'onTouchStart'> {
  const { move, scrollParent, translateTo } = controller;

  const lastTouchPositionRef = useRef({ x: 0, y: 0 });

  const autoScroll = useAutoScroll(controller);

  // When the item is moving via mouse navigation, track mouse move+up via document
  useEffect(() => {
    if (move.type === 'touch') {
      const onTouchMove = (evt: TouchEvent) => {
        evt.preventDefault();
        evt.stopPropagation();

        const touch = evt.touches[0];
        const touchPosition: Position = { x: touch.clientX, y: touch.clientY };

        // Update move delta on mouse move
        translateTo(translatePx => ({
          x: translatePx.x + (touchPosition.x - lastTouchPositionRef.current.x),
          y: translatePx.y + (touchPosition.y - lastTouchPositionRef.current.y),
        }));
        lastTouchPositionRef.current = touchPosition;

        // Initialize auto-scrolling (so it continues to scroll without movement)
        const scrollBounds = getScrollBounds(scrollParent);
        if (!isInBounds({ position: touchPosition }, scrollBounds)) {
          autoScroll.setOptions({ viewport: scrollParent, cursor: touchPosition });
        } else {
          autoScroll.cancel();
        }
      };

      const onTouchEnd = (evt: TouchEvent) => {
        evt.preventDefault();
        evt.stopPropagation();
        move.end();
        autoScroll.cancel();
      };

      const onTouchCancel = (evt: TouchEvent) => {
        evt.preventDefault();
        evt.stopPropagation();
        move.end({ cancelled: true });
        autoScroll.cancel();
      };

      const onOrientationChange = () => {
        move.end({ cancelled: true });
        autoScroll.cancel();
      };

      const onContextMenu = (evt: MouseEvent) => {
        evt.preventDefault();
      };

      // Toggle event listeners for touch
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd, { passive: false });
      document.addEventListener('touchcancel', onTouchCancel, { passive: false });
      // TODO: cancel for forcepress

      // Cancel any touches when the screen orientation changes
      window.addEventListener('orientationchange', onOrientationChange);
      window.addEventListener('resize', onOrientationChange); // resize can be triggered by orienttion change

      // Opt out of behavior where long-press brings up context menu
      window.addEventListener('contextmenu', onContextMenu);

      // TODO: cancel on page visibility change

      return () => {
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
        document.removeEventListener('touchcancel', onTouchCancel);

        window.removeEventListener('orientationchange', onOrientationChange);
        window.removeEventListener('resize', onOrientationChange);

        window.removeEventListener('contextmenu', onContextMenu);
      };
    }
  }, [move.type, scrollParent, move.end]);

  return {
    // Cancel auto-scrolling when the target is unfocused
    onBlur: () => {
      autoScroll.cancel();
    },
    // Start moving if the target is touched in an idle state
    onTouchStart: evt => {
      if (evt.touches.length === 1) {
        // Record the latest touch position
        const touch = evt.touches[0];
        const touchPosition: Position = { x: touch.clientX, y: touch.clientY };
        lastTouchPositionRef.current = touchPosition;
        // And start moving
        move.start('touch');
      }
    },
  };
}

export function useKeyboardMove(controller: MoveController): Pick<DragHandleProps, 'onKeyDown'> {
  const grid = useGrid();

  const { animatedRef, move, scrollParent, translateTo, translatePx } = controller;

  // Track the position that was last auto-scrolled to
  const lastAutoscrollPositionRef = useRef<Position>({ x: 0, y: 0 });

  /**
   * Auto-scrolls the item into view as the keyboard moves.
   *
   * @param offsetPx any additional offset to properly calculate the position of the item on screen
   */
  function scrollIntoView(offsetPx?: Position): void {
    // If the ref isn't available, early return!
    if (!animatedRef.current) {
      return;
    }

    // Get the projected actual (px) position of the item on the screen
    // after the move would be applied
    const rect = animatedRef.current.getBoundingClientRect();
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
      return;
    }

    // If item is not in bounds of scrolling viewport...
    // -> Get the distance needed to scroll
    const scrollDelta = getScrollDelta(item, scrollParent, {
      scrollByDistance: true,
    });
    // -> Record the new scroll position
    lastAutoscrollPositionRef.current = {
      x: scrollParent.scrollLeft + scrollDelta.x,
      y: scrollParent.scrollTop + scrollDelta.y,
    };
    // -> Update actual viewport scroll
    scrollParent.scrollLeft = lastAutoscrollPositionRef.current.x;
    scrollParent.scrollTop = lastAutoscrollPositionRef.current.y;
  }

  useIsomorphicLayoutEffect(() => {
    if (move.type === 'keyboard') {
      // Event handler for the scroll parent scroll. If the user has manually scrolled
      // the element during keyboard navigation, cancel the move
      const onScroll = () => {
        // We know user has scrolled if scroll parent's scroll position doesn't
        // match the last recorded auto-scroll position
        const hasUserManuallyScrolled =
          scrollParent.scrollLeft !== lastAutoscrollPositionRef.current.x ||
          scrollParent.scrollTop !== lastAutoscrollPositionRef.current.y;
        if (hasUserManuallyScrolled) {
          move.end({ cancelled: true });
        }
      };

      // Attach and detach event listeners in effect
      scrollParent.addEventListener('scroll', onScroll);
      return () => {
        scrollParent.removeEventListener('scroll', onScroll);
      };
    }
  }, [move.type, scrollParent, move.end]);

  /**
   * Moves the grid item for keyboard navigation. This handles
   * auto-scrolling the viewport and updating the `translatePx` state.
   *
   * @param positionDelta the change in position, by grid units (not px!)
   */
  function moveByKeyboard(positionDelta: Position) {
    // If the ref isn't available, early return!
    if (!animatedRef.current) {
      return;
    }

    // Scroll the item into view
    scrollIntoView({
      x: positionDelta.x * grid.unitPx,
      y: positionDelta.y * grid.unitPx,
    });

    // Then update the item translation
    // Note: it's important that we scroll _before_ updating translate to prevent jankiness
    translateTo({
      x: translatePx.x + positionDelta.x * grid.unitPx,
      y: translatePx.y + positionDelta.y * grid.unitPx,
    });
  }

  return {
    // Handles keyboard navigation on the drag handle
    // inspired by: https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/sensors/keyboard.md
    onKeyDown: evt => {
      // Activate keyboard navigation with spacebar
      if (!move.type && evt.key === ' ') {
        evt.preventDefault();
        move.start('keyboard');
        scrollIntoView();
        return;
      }

      // If keyboard is moving, allow keyboard nav as follows:
      if (move.type === 'keyboard') {
        // Double the move speed when holding shift key
        const delta = evt.shiftKey ? 2 : 1;

        switch (evt.key) {
          // Prevent submission or tabbing
          case 'Tab':
          case 'Enter': {
            evt.preventDefault();
            break;
          }

          // On escape, cancel the move
          case 'Escape': {
            evt.preventDefault();
            move.end({ cancelled: true });
            break;
          }

          // On spacebar, release the item
          case ' ': {
            evt.preventDefault();
            move.end();
            break;
          }

          // Otherwise, move using arrow keys
          case 'ArrowUp': {
            evt.preventDefault();
            moveByKeyboard({ x: 0, y: -delta });
            break;
          }
          case 'ArrowDown': {
            evt.preventDefault();
            moveByKeyboard({ x: 0, y: delta });
            break;
          }
          case 'ArrowLeft': {
            evt.preventDefault();
            moveByKeyboard({ x: -delta, y: 0 });
            break;
          }
          case 'ArrowRight': {
            evt.preventDefault();
            moveByKeyboard({ x: delta, y: 0 });
            break;
          }
        }
      }
    },
  };
}
