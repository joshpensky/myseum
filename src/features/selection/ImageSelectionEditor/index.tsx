import { KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { SelectionEditorState } from '@src/features/selection';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { Dimensions, Position } from '@src/types';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { CommonUtils } from '@src/utils/CommonUtils';
import styles from './imageSelectionEditor.module.scss';

export interface ImageSelectionEditorProps {
  activeLayer?: number;
  className?: string;
  editor: SelectionEditorState;
  onChange(editor: SelectionEditorState): void;
  image: HTMLImageElement;
}

const ImageSelectionEditor = ({
  activeLayer = 0,
  className,
  editor,
  onChange,
  image,
}: ImageSelectionEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [canvasDimensions, setCanvasDimensions] = useState<Dimensions>({ width: 0, height: 0 });

  // const [hoveringIndex, setHoveringIndex] = useState(-1);
  // const [focusIndex, setFocusIndex] = useState(-1);

  const [movingIndex, setMovingIndex] = useState(-1);
  const [isPointerDragging, setIsPointerDragging] = useState(false); // Tracks whether moving by mouse drag or keyboard
  const keyboardMovingTimeoutRef = useRef<NodeJS.Timeout>(); // Timeout for unsetting keyboard moving state

  // Key handler for undo and redo actions
  const onGlobalKeyDown = (evt: KeyboardEvent) => {
    // Normalizes the Cmd/Ctrl key across platforms
    const isOSX = /(Mac OS X)/gi.test(navigator.userAgent);
    const withCmdModifier = (isOSX ? evt.metaKey : evt.ctrlKey) && !evt.altKey;
    if (withCmdModifier && evt.key === 'z') {
      evt.preventDefault();
      if (evt.shiftKey) {
        // Cmd+Shift+Z
        onChange(SelectionEditorState.redo(editor));
      } else {
        // Cmd+Z
        onChange(SelectionEditorState.undo(editor));
      }
    }
  };

  const clearKeyboardMovingTimeoutRef = () => {
    if (keyboardMovingTimeoutRef.current) {
      clearTimeout(keyboardMovingTimeoutRef.current);
      keyboardMovingTimeoutRef.current = undefined;
    }
  };

  /**
   * Key handler for the accessible button targets. Handles moving the points using
   * arrow keys.
   *
   * @param evt the keyboard event
   * @param pointIndex the index of points to move
   */
  const onPointKeyDown = (evt: ReactKeyboardEvent<HTMLButtonElement>, pointIndex: number) => {
    // If user is actively dragging handle, don't update state
    if (isPointerDragging) {
      return;
    }

    // Helper function to update the point at the focused index using the given callback function
    const updatePoint = (updateCallback: (point: Position) => Position) => {
      // Show the magnifying animation, and stop after 500ms
      clearKeyboardMovingTimeoutRef();
      setMovingIndex(pointIndex);
      keyboardMovingTimeoutRef.current = setTimeout(() => {
        setMovingIndex(-1);
      }, 500);

      onChange(
        SelectionEditorState.commit(editor, {
          type: 'MOVE_POINT',
          payload: {
            path: activeLayer === 0 ? 'outline' : 'inner',
            pointIndex,
            move: updateCallback,
          },
        }),
      );
    };

    // Position should change 10x faster when shift key is held
    let delta = 0.005;
    if (evt.shiftKey) {
      delta *= 10;
    }

    switch (evt.key) {
      case 'ArrowUp':
      case 'Up': {
        return updatePoint(point => ({
          x: point.x,
          y: point.y - delta,
        }));
      }
      case 'ArrowDown':
      case 'Down': {
        return updatePoint(point => ({
          x: point.x,
          y: point.y + delta,
        }));
      }
      case 'ArrowLeft':
      case 'Left': {
        return updatePoint(point => ({
          x: point.x - delta,
          y: point.y,
        }));
      }
      case 'ArrowRight':
      case 'Right': {
        return updatePoint(point => ({
          x: point.x + delta,
          y: point.y,
        }));
      }
    }
  };

  // Attach the undo/redo key listener
  useEffect(() => {
    window.addEventListener('keydown', onGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', onGlobalKeyDown);
    };
  }, [onGlobalKeyDown]);

  // Update the canvas dimensions on resize
  useIsomorphicLayoutEffect(() => {
    if (canvasRef.current) {
      const observer = new ResizeObserver(entries => {
        entries.forEach(entry => {
          setCanvasDimensions({
            height: entry.contentRect.height,
            width: entry.contentRect.width,
          });
        });
      });
      observer.observe(canvasRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  // _DEV_
  // Reset focus/hover/moving index on Fast Refresh
  useEffect(
    () => () => {
      setMovingIndex(-1);
    },
    [activeLayer],
  );

  /**
   * Reorders the button points to be left->right, top->bottom.
   *
   * ```
   * Points state           Points tab order
   *  (1)------(2)          (1)------(2)
   *   |        |     ->     |        |
   *   |        |            |        |
   *  (4)------(3)          (3)------(4)
   * ```
   */
  const pointsTabOrder = [
    {
      index: 0,
      name: 'A',
    },
    {
      index: 1,
      name: 'B',
    },
    {
      index: 3,
      name: 'C',
    },
    {
      index: 2,
      name: 'D',
    },
  ];

  useEffect(() => {
    if (movingIndex >= 0) {
      const onPointerMove = (evt: PointerEvent) => {
        if (!(document.activeElement?.id === `editor-point-${movingIndex}` && canvasRef.current)) {
          return;
        }

        // Calculates the mouseX and mouseY within the canvas
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = evt.clientX - rect.left;
        const mouseY = evt.clientY - rect.top;

        const { width, height, x, y } = CanvasUtils.objectContain(
          canvasDimensions,
          CommonUtils.getImageDimensions(image),
        );

        onChange(
          SelectionEditorState.commit(editor, {
            type: 'MOVE_POINT',
            payload: {
              path: activeLayer === 0 ? 'outline' : 'inner',
              pointIndex: movingIndex,
              move: () => {
                // We calculate canvas position as..... cx = corner.x * width + x;
                // So we inverse for corner position... corner.x = (cx - x) / width
                const fx = (mouseX - x) / width;
                const fy = (mouseY - y) / height;
                return {
                  x: fx,
                  y: fy,
                };
              },
            },
          }),
        );
      };

      const onPointerUp = () => {
        if (isPointerDragging && movingIndex >= 0) {
          setMovingIndex(-1);
          setIsPointerDragging(false);
        }
      };

      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      return () => {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
      };
    }
  }, [movingIndex]);

  return (
    <div
      ref={containerRef}
      className={cx(styles.container, className)}
      style={{
        '--width': `${canvasDimensions.width}px`,
        '--height': `${canvasDimensions.height}px`,
        '--aspect-ratio': canvasDimensions.width / canvasDimensions.height,
        '--image-src': `url(${image.src})`,
      }}>
      <div ref={canvasRef} className={styles.canvas}>
        <svg className={styles.svg} viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
          <mask id="outline-path">
            <rect x="0" y="0" width="1" height="1" fill="white" />
            <path d={CanvasUtils.getLineCommands(editor.current.outline)} fill="black" />
          </mask>

          <mask id="outline-path-inverse">
            <rect x="0" y="0" width="1" height="1" fill="black" />
            <path d={CanvasUtils.getLineCommands(editor.current.outline)} fill="white" />
          </mask>

          <rect
            className={styles.overlay}
            x="0"
            y="0"
            width="1"
            height="1"
            mask="url(#outline-path)"
          />

          <path
            className={styles.path}
            d={CanvasUtils.getLineCommands(editor.current.outline)}
            vectorEffect="non-scaling-stroke"
            mask="url(#outline-path-inverse)"
          />
        </svg>

        <img src={image.src} alt="" />

        {pointsTabOrder.map(({ index, name }) => (
          <button
            key={index}
            id={`editor-point-${index}`}
            className={styles.buttonPoint}
            style={{
              '--x': editor.current.outline[index].x,
              '--y': editor.current.outline[index].y,
            }}
            type="button"
            onKeyDown={evt => onPointKeyDown(evt, index)}
            onPointerDown={evt => {
              evt.preventDefault();
              // Create new slice in history
              onChange(SelectionEditorState.save(editor));
              // Update the moving index
              setMovingIndex(index);
              setIsPointerDragging(true);
              // Focus the button
              evt.currentTarget.focus();
            }}
            onBlur={() => {
              // Stop moving the point if unfocused
              if (movingIndex === index) {
                clearKeyboardMovingTimeoutRef();
                setMovingIndex(-1);
              }
            }}
            aria-label={`Point ${name}`}>
            <span className={styles.crosshair} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageSelectionEditor;
