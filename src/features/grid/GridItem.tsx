import React, { ReactNode, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import {
  DragHandleProps,
  useKeyboardMove,
  useMouseMove,
  useMoveController,
  useTouchMove,
} from './GridItem.helpers';
import styles from './styles.module.scss';
import { ItemError, MoveControllerType, Position, Size } from './types';

const cx = classNames.bind(styles);

export interface GridItemChildProps {
  moveType: MoveControllerType | null;
  error: ItemError | undefined;
  dragHandleProps: DragHandleProps;
}

interface GridItemProps {
  children(props: GridItemChildProps): ReactNode;
  id: string | number;
  error: ItemError | undefined;
  position: Position;
  size: Size;
  onMoveTypeChange(moveType: MoveControllerType | null): void;
  onPositionChange(position: Position): Position;
  onPositionProjectionChange(position: Position): void;
}

export function GridItem({
  children,
  error,
  id,
  position,
  size,
  onMoveTypeChange,
  onPositionChange,
  onPositionProjectionChange,
}: GridItemProps) {
  const dragHandleRef = useRef<HTMLButtonElement>(null);

  const controller = useMoveController({
    position,
    onPositionChange,
    onPositionProjectionChange,
  });

  const mouseDragHandleProps = useMouseMove(controller);
  const touchDragHandleProps = useTouchMove(controller);
  const keyboardDragHandleProps = useKeyboardMove(controller);

  // Update the move controller
  useEffect(() => {
    onMoveTypeChange(controller.move.type);
  }, [controller.move.type]);

  const instructionsId = `grid-item-${id}-instructions`;
  const dragHandleProps: DragHandleProps = {
    ref: dragHandleRef,
    'aria-describedby': instructionsId,
    // Adds the drag handle props for mouse move
    ...mouseDragHandleProps,
    // Adds the drag handle props for touch move
    ...touchDragHandleProps,
    // Adds the drag handle props for keyboard move
    ...keyboardDragHandleProps,
    // Handles cancelling move when focus is lost on the drag handle
    onBlur: evt => {
      mouseDragHandleProps.onBlur(evt);
      touchDragHandleProps.onBlur(evt);
      controller.move.end({ cancelled: true });
    },
  };

  const { ref, animatedRef, move, isAnimating, translateOffsetPx, translatePx } = controller;

  return (
    <div ref={ref}>
      <div
        ref={animatedRef}
        className={cx('item', 'movable', (isAnimating || !!move.type) && 'movable--active')}
        style={{
          '--item-grid-x': position.x,
          '--item-grid-y': position.y,
          '--item-grid-width': size.width,
          '--item-grid-height': size.height,
          '--item-delta-x': translateOffsetPx.x + translatePx.x,
          '--item-delta-y': translateOffsetPx.y + translatePx.y,
        }}
        // Offset may differ from server to client, so we must suppress hydration warning!
        suppressHydrationWarning>
        {children({ moveType: move.type, error, dragHandleProps })}

        <div id={instructionsId} className={cx('drag-handle-instructions')}>
          Press space bar to start a drag. When dragging you can use the arrow keys to move the item
          around and escape to cancel. Ensure your screen reader is in focus mode or forms mode.
        </div>
      </div>
    </div>
  );
}
