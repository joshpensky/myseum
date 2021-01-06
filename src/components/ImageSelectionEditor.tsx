import {
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import anime from 'animejs';
import { createGlobalStyle } from 'styled-components';
import tw, { theme } from 'twin.macro';
import { SelectionEditor, SelectionEditorPoints } from '@src/hooks/useSelectionEditor';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { GeometryUtils } from '@src/utils/GeometryUtils';
import { BaseProps, Dimensions, Position } from '@src/types';

const STROKE_WIDTH = 3;
const POINT_RADIUS = 5;
const MAGNIFIED_POINT_RADIUS = 20;
const INNER_CANVAS_PADDING = MAGNIFIED_POINT_RADIUS + STROKE_WIDTH / 2;

// Disable cursor when moving point
const GlobalDisableCursor = createGlobalStyle`
  * {
    ${tw`cursor-none!`}
  }
`;

export type ImageSelectionEditorProps = BaseProps & {
  actualDimensions: Dimensions;
  editor: SelectionEditor;
  image: HTMLImageElement;
};

const ImageSelectionEditor = ({
  actualDimensions,
  className,
  css: customCss,
  editor,
  image,
}: ImageSelectionEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [canvasDimensions, setCanvasDimensions] = useState<Dimensions>();

  const [hoveringIndex, setHoveringIndex] = useState(-1);
  const [focusIndex, setFocusIndex] = useState(-1);

  const [movingIndex, setMovingIndex] = useState(-1);
  const [isDragging, setIsDragging] = useState(false); // Tracks whether moving by mouse drag or keyboard
  const keyboardMovingTimeoutRef = useRef<NodeJS.Timeout>(); // Timeout for unsetting keyboard moving state

  const [magnifyAnimationProgress, setMagnifyAnimationProgress] = useState([0, 0, 0, 0]);

  // Tracks mouse movements on the canvas
  // If the user is currently hovering a target, the hovering state will accordingly update
  // If the user is currently moving a target, the editor points state will accordingly update
  const onMouseMove = (evt: MouseEvent) => {
    if (!(canvasRef.current && canvasDimensions)) {
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    // Calculates the mouseX and mouseY within the canvas
    const mouseX = evt.clientX - rect.left;
    const mouseY = evt.clientY - rect.top;

    // If mouse is outside the canvas, ignore the event
    if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) {
      return;
    }

    const { width, height, x, y } = CanvasUtils.objectContain(
      canvasDimensions,
      {
        width: image.naturalWidth,
        height: image.naturalHeight,
      },
      INNER_CANVAS_PADDING,
    );

    // If there's a moving index, update corner position
    if (isDragging && movingIndex >= 0) {
      evt.preventDefault();
      editor.setPoints(points => {
        // We calculate canvas position as..... cx = corner.x * width + x;
        // So we inverse for corner position... corner.x = (cx - x) / width
        const fx = (mouseX - x) / width;
        const fy = (mouseY - y) / height;
        return [
          ...points.slice(0, movingIndex),
          {
            x: Math.min(1, Math.max(0, fx)),
            y: Math.min(1, Math.max(0, fy)),
          },
          ...points.slice(movingIndex + 1),
        ] as SelectionEditorPoints;
      });
      return;
    }

    // Otherwise, update hovering state
    const strokeOffset = STROKE_WIDTH / 2;
    const hoveringIndex = editor.points.findIndex(point =>
      GeometryUtils.isPointWithinCircle(
        {
          x: mouseX,
          y: mouseY,
        },
        {
          x: point.x * width + x,
          y: point.y * height + y,
          radius: POINT_RADIUS + strokeOffset,
        },
      ),
    );
    setHoveringIndex(hoveringIndex);
  };

  // Creates a new entry in history and updates moving state, if possible
  const onMouseDown = (evt: MouseEvent) => {
    if (hoveringIndex >= 0) {
      evt.preventDefault();
      // Create new slice in history
      editor.history.lap();
      // Update the moving index
      setMovingIndex(hoveringIndex);
      setIsDragging(true);
      // Focus the button
      const buttonElement = canvasRef.current?.querySelector(`#editor-point-${hoveringIndex}`);
      if (buttonElement && buttonElement instanceof HTMLElement) {
        buttonElement.focus();
      }
    }
  };

  // Resets moving state, if possible
  const onMouseUp = () => {
    if (isDragging && movingIndex >= 0) {
      setMovingIndex(-1);
      setIsDragging(false);
    }
  };

  // Key handler for undo and redo actions
  const onGlobalKeyDown = (evt: KeyboardEvent) => {
    // Normalizes the Cmd/Ctrl key across platforms
    const isOSX = /(Mac OS X)/gi.test(navigator.userAgent);
    const withCmdModifier = (isOSX ? evt.metaKey : evt.ctrlKey) && !evt.altKey;
    if (withCmdModifier && evt.key === 'z') {
      evt.preventDefault();
      if (evt.shiftKey) {
        // Cmd+Shift+Z
        editor.history.redo();
      } else {
        // Cmd+Z
        editor.history.undo();
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
    if (isDragging) {
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

      editor.setPoints(points => {
        const newPoint = updateCallback(points[pointIndex]);
        return [
          ...points.slice(0, pointIndex),
          {
            x: Math.min(1, Math.max(0, newPoint.x)),
            y: Math.min(1, Math.max(0, newPoint.y)),
          },
          ...points.slice(pointIndex + 1),
        ] as SelectionEditorPoints;
      }, !evt.repeat); // Create a new entry in history, if key is being held down repeatedly
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

  /**
   * Renders the interactive canvas, including image, path, overlay, and points (with focus).
   */
  const render = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!(ctx && canvasDimensions)) {
      return;
    }

    // Reset canvas
    CanvasUtils.clear(ctx);

    // Get inner canvas dimensions/position
    const { width, height, x, y } = CanvasUtils.objectContain(
      canvasDimensions,
      {
        width: image.naturalWidth,
        height: image.naturalHeight,
      },
      INNER_CANVAS_PADDING,
    );

    const pointsPath = new Path2D();
    editor.points.forEach((point, idx) => {
      if (idx === 0) {
        pointsPath.moveTo(point.x * width + x, point.y * height + y);
      } else {
        pointsPath.lineTo(point.x * width + x, point.y * height + y);
      }
    });
    pointsPath.closePath();

    const setPointsStyle = () => {
      ctx.fillStyle = theme`colors.white`;
      ctx.lineJoin = 'bevel';
      ctx.lineWidth = STROKE_WIDTH;
      ctx.strokeStyle = editor.isValid ? theme`colors.blue.500` : theme`colors.red.500`;
      ctx.globalAlpha = 1;
    };

    const renderImageAndOverlay = () => {
      // Draw semi-transparent black overlay
      ctx.fillStyle = theme`colors.black`;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);
      ctx.globalAlpha = 1;

      // Draw overlay window and clip from overlay
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fill(pointsPath);

      // Draw the image under the overlay
      ctx.globalCompositeOperation = 'destination-over';
      ctx.drawImage(image, x, y, width, height); // Draw image
      ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height); // Draw black background to clip magnifying glass

      // Revert back to regular composition type (drawing atop)
      ctx.globalCompositeOperation = 'source-over';
    };

    // Outline points path
    const renderPointsPath = () => {
      setPointsStyle();
      ctx.stroke(pointsPath);
    };

    // Draw a single point
    const renderPoint = (point: Position, index: number) => {
      // Reset styles
      setPointsStyle();

      // Draw target
      const px = point.x * width + x;
      const py = point.y * height + y;
      ctx.beginPath();
      ctx.arc(px, py, POINT_RADIUS, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const showMagnifiedVersion = magnifyAnimationProgress[index] > 0;
      const magnifiedRadius =
        POINT_RADIUS + (MAGNIFIED_POINT_RADIUS - POINT_RADIUS) * magnifyAnimationProgress[index]; // https://www.d3indepth.com/scales/

      // If moving, render magnifying glass with crosshairs
      if (showMagnifiedVersion) {
        // Clip out a circle for the magnified area
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = theme`colors.black`;
        ctx.beginPath();
        ctx.arc(px, py, magnifiedRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        // Draw the magnified image area
        ctx.globalCompositeOperation = 'destination-over';
        ctx.drawImage(
          image,
          point.x * image.naturalWidth - magnifiedRadius / 2,
          point.y * image.naturalHeight - magnifiedRadius / 2,
          magnifiedRadius,
          magnifiedRadius,
          px - magnifiedRadius,
          py - magnifiedRadius,
          magnifiedRadius * 2,
          magnifiedRadius * 2,
        );

        // Draw white overlay
        ctx.globalCompositeOperation = 'source-over';
        const alphaMultiplier = magnifyAnimationProgress[index];
        ctx.globalAlpha = 1 - alphaMultiplier;
        ctx.fillStyle = theme`colors.white`;
        ctx.beginPath();
        ctx.arc(px, py, magnifiedRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        // Draw crosshairs over magnified image
        const crosshair = new Path2D();
        crosshair.moveTo(px - magnifiedRadius, py);
        crosshair.lineTo(px + magnifiedRadius, py);
        crosshair.moveTo(px, py - magnifiedRadius);
        crosshair.lineTo(px, py + magnifiedRadius);
        crosshair.closePath();
        // Stroke a transparent white version (for dark backgrounds)
        ctx.globalAlpha = 0.5 * alphaMultiplier;
        ctx.strokeStyle = theme`colors.white`;
        ctx.lineWidth = 3;
        ctx.stroke(crosshair);
        // Stroke the actual crosshairs
        ctx.globalAlpha = alphaMultiplier;
        ctx.strokeStyle = theme`colors.black`;
        ctx.lineWidth = 1;
        ctx.stroke(crosshair);

        // Reset styles
        setPointsStyle();
      }

      // Draw focus ring, if point is focused
      if (focusIndex === index || showMagnifiedVersion) {
        let focusRingRadius: number;
        if (showMagnifiedVersion) {
          ctx.globalAlpha = 1;
          focusRingRadius = magnifiedRadius;
        } else {
          ctx.globalAlpha = 0.5;
          ctx.lineWidth = 5;
          focusRingRadius = POINT_RADIUS + STROKE_WIDTH;
        }

        ctx.beginPath();
        ctx.arc(px, py, focusRingRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
      }
    };

    renderImageAndOverlay();
    renderPointsPath();

    // Sort editor points by their magnification (magnified = higher z-index)
    const sortedPointsByZIndex = [0, 1, 2, 3].sort(
      (aIndex, bIndex) => magnifyAnimationProgress[aIndex] - magnifyAnimationProgress[bIndex],
    );
    // Then, render each point
    sortedPointsByZIndex.forEach(pointIndex => {
      renderPoint(editor.points[pointIndex], pointIndex);
    });
  };

  // Animates the magnifying glass zoom for moving points
  useEffect(() => {
    if (movingIndex >= 0) {
      // Animate the magnifying glass zooming in
      const zoomInAnim = anime({
        size: [POINT_RADIUS, MAGNIFIED_POINT_RADIUS],
        duration: 100,
        easing: 'easeOutSine',
        update(anim) {
          setMagnifyAnimationProgress(prog => [
            ...prog.slice(0, movingIndex),
            anim.progress / 100,
            ...prog.slice(movingIndex + 1),
          ]);
        },
      });

      return () => {
        // Reverse to animate the magnifying glass zooming out
        zoomInAnim.pause();
        zoomInAnim.reverse();
        zoomInAnim.play();
      };
    }
  }, [movingIndex]);

  // Re-render the canvas when points (and their validity) change
  useEffect(() => {
    render();
  }, [
    actualDimensions,
    editor.isValid,
    movingIndex,
    magnifyAnimationProgress,
    focusIndex,
    editor.points,
  ]);

  // Resize the canvas when dimensions change
  useEffect(() => {
    if (canvasRef.current && canvasDimensions) {
      CanvasUtils.resize(canvasRef.current, canvasDimensions);
      render();
    }
  }, [canvasDimensions]);

  // Attach event listeners
  useEffect(() => {
    if (canvasDimensions) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mouseup', onMouseUp);
      return () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [canvasDimensions, editor, hoveringIndex, isDragging, movingIndex]);

  // Attach the undo/redo key listener
  useEffect(() => {
    window.addEventListener('keydown', onGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', onGlobalKeyDown);
    };
  }, [onGlobalKeyDown]);

  // Update the canvas dimensions on resize
  useLayoutEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver(entries => {
        entries.forEach(entry => {
          setCanvasDimensions({
            height: entry.contentRect.height,
            width: entry.contentRect.width,
          });
        });
      });
      observer.observe(containerRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  // _DEV_
  // Reset focus/hover/moving index on Fast Refresh
  useEffect(
    () => () => {
      setFocusIndex(-1);
      setHoveringIndex(-1);
      setMovingIndex(-1);
    },
    [],
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

  return (
    <div ref={containerRef} className={className} css={[tw`size-full relative`, customCss]}>
      {canvasDimensions && (
        <canvas
          ref={canvasRef}
          aria-label="Editor"
          css={[tw`absolute inset-0 size-full`, hoveringIndex >= 0 && tw`cursor-grab`]}>
          {/* Adds tabbable button controls for each of the point targets */}
          {pointsTabOrder.map(({ index, name }) => (
            <button
              key={index}
              id={`editor-point-${index}`}
              type="button"
              onKeyDown={evt => onPointKeyDown(evt, index)}
              onFocus={() => setFocusIndex(index)}
              onBlur={() => {
                // Unfocus the point
                setFocusIndex(-1);
                // Stop moving the point if unfocused
                if (movingIndex === index) {
                  clearKeyboardMovingTimeoutRef();
                  setMovingIndex(-1);
                }
              }}>
              Point {name}
            </button>
          ))}
        </canvas>
      )}
      <p
        css={[
          tw`absolute bottom-0 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-black bg-opacity-90 text-red-500`,
          tw`before:(content absolute inset-0 rounded-full bg-red-500 bg-opacity-20 pointer-events-none)`,
          [
            tw`transition-all ease-out`,
            editor.isValid && tw`opacity-0 translate-y-1 pointer-events-none`,
          ],
        ]}
        role="region"
        aria-live="assertive"
        aria-hidden={editor.isValid}>
        Invalid shape
      </p>
      {movingIndex >= 0 && isDragging && <GlobalDisableCursor />}
    </div>
  );
};

export default ImageSelectionEditor;
