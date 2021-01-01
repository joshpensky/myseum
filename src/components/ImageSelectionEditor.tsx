import {
  KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createGlobalStyle } from 'styled-components';
import tw, { theme } from 'twin.macro';
import { SelectionEditor, SelectionEditorPoints } from '@src/hooks/useSelectionEditor';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { GeometryUtils } from '@src/utils/GeometryUtils';
import { BaseProps, Dimensions, Position } from '@src/types';

const POINT_RADIUS = 5;
const STROKE_WIDTH = 3;
const INNER_CANVAS_PADDING = POINT_RADIUS + STROKE_WIDTH * 1.5;

const GlobalGrabbingCursor = createGlobalStyle`
  * {
    ${tw`cursor-grabbing!`}
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
  css,
  editor,
  image,
}: ImageSelectionEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [canvasDimensions, setCanvasDimensions] = useState<Dimensions>();

  const [hoveringIndex, setHoveringIndex] = useState(-1);
  const [movingIndex, setMovingIndex] = useState(-1);
  const [focusIndex, setFocusIndex] = useState(-1);

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

    const { width, height, x, y } = CanvasUtils.containObject(
      canvasDimensions,
      {
        width: image.naturalWidth,
        height: image.naturalHeight,
      },
      INNER_CANVAS_PADDING,
    );

    // If there's a moving index, update corner position
    if (movingIndex >= 0) {
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
      editor.history.lap();
      setMovingIndex(hoveringIndex);
      canvasRef.current?.querySelectorAll('button')[hoveringIndex].focus();
    }
  };

  // Resets moving state, if possible
  const onMouseUp = () => {
    if (movingIndex >= 0) {
      setMovingIndex(-1);
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

  /**
   * Key handler for the accessible button targets. Handles moving the points using
   * arrow keys.
   *
   * @param evt the keyboard event
   * @param pointIndex the index of points to move
   */
  const onPointKeyDown = (evt: ReactKeyboardEvent<HTMLButtonElement>, pointIndex: number) => {
    // If user is actively dragging handle, don't update state
    if (movingIndex >= 0) {
      return;
    }

    // Helper function to update the point at the focused index using the given callback function
    const updatePoint = (updateCallback: (point: Position) => Position) => {
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
    const { width, height, x, y } = CanvasUtils.containObject(
      canvasDimensions,
      {
        width: image.naturalWidth,
        height: image.naturalHeight,
      },
      INNER_CANVAS_PADDING,
    );

    // Draw semi-transparent black overlay
    ctx.fillStyle = theme`colors.black`;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);
    ctx.globalAlpha = 1;

    // Draw overlay window and clip from overlay
    ctx.globalCompositeOperation = 'destination-out';
    const path = new Path2D();
    editor.points.forEach((point, idx) => {
      if (idx === 0) {
        path.moveTo(point.x * width + x, point.y * height + y);
      } else {
        path.lineTo(point.x * width + x, point.y * height + y);
      }
    });
    path.closePath();
    ctx.fill(path);

    // Draw the image under the overlay
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(image, x, y, width, height);

    // Revert back to regular composition type (drawing atop)
    ctx.globalCompositeOperation = 'source-over';

    // Outline frame path
    ctx.fillStyle = theme`colors.white`;
    ctx.lineWidth = STROKE_WIDTH;
    ctx.lineJoin = 'bevel';
    ctx.strokeStyle = editor.isValid ? '#0989FF' : theme`colors.red.500`;
    ctx.stroke(path);

    // Draws the average rectangle formed by the selection points
    // This will later be used to download/upload the straightened image at the highest quality
    if (editor.isValid) {
      const [a, b, c, d] = GeometryUtils.sortConvexQuadrilateralPoints(editor.points);

      const avgX = (a.x + d.x) / 2; // X avg of leftmost two points
      const avgY = (a.y + b.y) / 2; // Y avg of topmost two points

      const avgWidth = (b.x + c.x) / 2 - avgX; // X avg of rightmost two points, minus avg of leftmost
      const avgHeight = (c.y + d.y) / 2 - avgY; // X avg of bottommost two points, minus avg of topmost

      const avgRect = {
        x: avgX * width + x,
        y: avgY * height + y,
        width: avgWidth * width,
        height: avgHeight * height,
      };

      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = theme`colors.green.400`;
      ctx.strokeRect(avgRect.x, avgRect.y, avgRect.width, avgRect.height);

      // Draws the biggest rectangle within the average that shares the same dimensions as the actual artwork
      // This is the size to download/upload the straightened image at the highest quality possible
      const scaledRect = CanvasUtils.containObject(avgRect, actualDimensions);
      ctx.strokeStyle = theme`colors.yellow.400`;
      ctx.strokeRect(
        scaledRect.x + avgRect.x,
        scaledRect.y + avgRect.y,
        scaledRect.width,
        scaledRect.height,
      );

      ctx.globalAlpha = 1;
    }

    // Draw point targets
    ctx.strokeStyle = editor.isValid ? '#0989FF' : theme`colors.red.500`;
    editor.points.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x * width + x, point.y * height + y, POINT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      // Draw focus ring, if any are focused
      if (focusIndex === index) {
        ctx.beginPath();
        ctx.arc(
          point.x * width + x,
          point.y * height + y,
          POINT_RADIUS + STROKE_WIDTH * 0.8,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
        ctx.closePath();
      }
    });
  };

  // Re-render the canvas when points (and their validity) change
  useEffect(() => {
    render();
  }, [actualDimensions, editor.isValid, focusIndex, editor.points]);

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
  }, [canvasDimensions, editor, hoveringIndex, movingIndex]);

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

  return (
    <div ref={containerRef} className={className} css={[tw`size-full relative`, css]}>
      {canvasDimensions && (
        <canvas
          ref={canvasRef}
          css={[tw`absolute inset-0 size-full`, hoveringIndex >= 0 && tw`cursor-grab`]}>
          {/* Adds tabbable button controls for each of the point targets */}
          {editor.points.map((point, index) => (
            <button
              key={index}
              onKeyDown={evt => onPointKeyDown(evt, index)}
              onFocus={() => setFocusIndex(index)}
              onBlur={() => setFocusIndex(-1)}>
              Point {['A', 'B', 'C', 'D'][index]}
            </button>
          ))}
        </canvas>
      )}
      {movingIndex >= 0 && <GlobalGrabbingCursor />}
    </div>
  );
};

export default ImageSelectionEditor;
