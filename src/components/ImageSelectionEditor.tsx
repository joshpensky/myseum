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
import { GeometryUtils, Line } from '@src/utils/GeometryUtils';
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
const GlobalGrabbingCursor = createGlobalStyle`
  * {
    ${tw`cursor-grabbing!`}
  }
`;

export type ImageSelectionEditorProps = BaseProps & {
  activeLayer?: number;
  actualDimensions: Dimensions;
  editor: SelectionEditor;
  image: HTMLImageElement;
};

const ImageSelectionEditor = ({
  activeLayer = 0,
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
  const [isDraggingOutside, setIsDraggingOutside] = useState(false); // Tracks whether mouse is dragging outside valid bounds
  const keyboardMovingTimeoutRef = useRef<NodeJS.Timeout>(); // Timeout for unsetting keyboard moving state

  const [magnifyAnimationProgress, setMagnifyAnimationProgress] = useState([0, 0, 0, 0]);

  const updateLayerPoint = (
    activeLayer: number,
    activePointIndex: number,
    updateCallback: (point: Position) => Position,
    options: { isDragging?: boolean; lap?: boolean },
  ) => {
    editor.setLayers(layers => {
      const activePoints = layers[activeLayer].points;
      const unboundedPoint = updateCallback(activePoints[activePointIndex]);
      const newActivePoints = [
        ...activePoints.slice(0, activePointIndex),
        {
          x: Math.min(1, Math.max(0, unboundedPoint.x)),
          y: Math.min(1, Math.max(0, unboundedPoint.y)),
        },
        ...activePoints.slice(activePointIndex + 1),
      ] as SelectionEditorPoints;

      let isDraggingOutside = false;

      const isPathValid = GeometryUtils.isConvexQuadrilateral(newActivePoints);
      if (options.isDragging) {
        // Show cursor if user is dragging in invalid area
        isDraggingOutside = !isPathValid;
      }

      if (!isPathValid) {
        /**
         * We have point E which represents the moving quadrilateral vertex. We want to find
         * the point closest to the polygon that still forms a valid convex quadrilateral.
         *
         * ```
         *           . . . A
         *       . .       |
         *    . .          |
         *  D      C  NC---N--X   E
         *    . .          |
         *       . .       |
         *           . . . B
         * ```
         */

        // 1) Disregard point E and form triangle ABD.
        const numPoints = newActivePoints.length;
        const triangle = [
          newActivePoints[(numPoints + (activePointIndex - 1)) % numPoints], // A
          newActivePoints[(activePointIndex + 1) % numPoints], // B
          newActivePoints[(activePointIndex + 2) % numPoints], // D
        ];
        // 2) Form a line between the surrounding points of E (line AB)
        const lineAB: Line = [triangle[0], triangle[1]];
        // 3) Find the nearest projection of point E on line AB (point N)
        const nearestPointOnLine = GeometryUtils.findNearestPointOnLine(
          newActivePoints[activePointIndex],
          lineAB,
        );

        // 4) Find the slope of the line perpendicular to AB. This will serve as our vector
        const { slope } = GeometryUtils.getSlopeIntercept(triangle[0], triangle[1]);
        const perpSlope = GeometryUtils.getPerpendicularSlope(slope) ?? 0;
        const perpIntercept = nearestPointOnLine.y - perpSlope * nearestPointOnLine.x;
        const perpVector: Line = [
          { x: 0, y: perpIntercept },
          { x: 1, y: perpSlope + perpIntercept },
        ];

        // 5) Find the center point of triangle ABD (point C)
        const centerPoint = {
          x: (triangle[0].x + triangle[1].x + triangle[2].x) / 3,
          y: (triangle[0].y + triangle[1].y + triangle[2].y) / 3,
        };
        // 6) Find the projection of the center onto the perpendicular vector (point NC)
        const nearestCenterPointOnPerpLine = GeometryUtils.findNearestPointOnLine(
          centerPoint,
          perpVector,
        );

        // 7) Invert the direction of vector N->NC by the magnitude of 0.0025 to find the offset point (point X)
        const offsetPoint = GeometryUtils.findPointOnVector(
          nearestPointOnLine,
          nearestCenterPointOnPerpLine,
          -0.0025,
        );

        // 8) Set the new point
        newActivePoints[activePointIndex] = offsetPoint;
      }

      // Show cursor is user is dragging in invalid area
      if (activeLayer === 0) {
        if (options.isDragging && !isDraggingOutside) {
          isDraggingOutside =
            unboundedPoint.x < 0 ||
            unboundedPoint.x > 1 ||
            unboundedPoint.y < 0 ||
            unboundedPoint.y > 1;
        }
        // TODO: if frame point is moved within window, shrink window to fit inside frame again
        // layers.slice(1).forEach(points => points.forEach(point => { if (point is outside frame) { point = nearestPointOnPolygon } }))
      }

      // Limit the size of other layers to fit within the shape of the first
      if (activeLayer > 0) {
        const activePoint = newActivePoints[activePointIndex];
        const basePath = editor.layers[0].points;
        const isPointInsideBaseShape = GeometryUtils.isPointInPolygon(activePoint, basePath);

        if (options.isDragging && !isDraggingOutside) {
          // Update the cursor if the user is dragging outside shape
          isDraggingOutside = !isPointInsideBaseShape;
        }

        if (!isPointInsideBaseShape) {
          // If dragging and point is outside, find closest point to map to
          const intersectionPt = GeometryUtils.findNearestPointOnPolygon(activePoint, basePath);
          newActivePoints[activePointIndex] = intersectionPt;
        }
      }

      setIsDraggingOutside(isDraggingOutside);

      return [
        ...layers.slice(0, activeLayer),
        {
          ...layers[activeLayer],
          points: newActivePoints,
        },
        ...layers.slice(activeLayer + 1),
      ];
    });
  };

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
      updateLayerPoint(
        activeLayer,
        movingIndex,
        () => {
          // We calculate canvas position as..... cx = corner.x * width + x;
          // So we inverse for corner position... corner.x = (cx - x) / width
          const fx = (mouseX - x) / width;
          const fy = (mouseY - y) / height;
          return {
            x: fx,
            y: fy,
          };
        },
        {
          isDragging: true,
        },
      );
      return;
    }

    // Otherwise, update hovering state
    const strokeOffset = STROKE_WIDTH / 2;
    const hoveringIndex = editor.layers[activeLayer].points.findIndex(point =>
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
      setIsDraggingOutside(false);
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

      updateLayerPoint(activeLayer, pointIndex, updateCallback, {
        lap: true, // Create a new entry in history, if key is being held down repeatedly
      });
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

    const getPointsPath = (points: SelectionEditorPoints) => {
      const pointsPath = new Path2D();
      points.forEach((point, idx) => {
        if (idx === 0) {
          pointsPath.moveTo(point.x * width + x, point.y * height + y);
        } else {
          pointsPath.lineTo(point.x * width + x, point.y * height + y);
        }
      });
      pointsPath.closePath();
      return pointsPath;
    };

    // const activePointsPath = getPointsPath(editor.layers[activeLayer].points);

    const setPointsStyle = () => {
      ctx.fillStyle = theme`colors.white`;
      ctx.lineJoin = 'bevel';
      ctx.lineWidth = STROKE_WIDTH;
      ctx.strokeStyle = theme`colors.blue.500`;
      ctx.globalAlpha = 1;
    };

    const renderImageAndOverlays = () => {
      // Draw semi-transparent black overlay
      ctx.fillStyle = theme`colors.black`;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);
      ctx.globalAlpha = 1;

      // Draw overlay window and clip from overlay
      ctx.globalCompositeOperation = 'destination-out';
      const basePath = getPointsPath(editor.layers[0].points);
      ctx.fill(basePath);

      // Draw the image under the overlay
      ctx.globalCompositeOperation = 'destination-over';
      ctx.drawImage(image, x, y, width, height); // Draw image
      ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height); // Draw black background to clip magnifying glass

      // Revert back to regular composition type (drawing atop)
      ctx.globalCompositeOperation = 'source-over';

      if (activeLayer > 0) {
        ctx.fillStyle = theme`colors.black`;
        ctx.globalAlpha = 0.8;
        const layerPath = getPointsPath(editor.layers[activeLayer].points);
        ctx.fill(layerPath);
        ctx.globalAlpha = 1;
      }
    };

    // Outline points path
    const renderPointsPath = (pointsPath: Path2D) => {
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

      // if (movingIndex === index) {
      //   const newActivePoints = editor.layers[activeLayer].points;
      //   const numPoints = newActivePoints.length;
      //   const triangle = [
      //     newActivePoints[(numPoints + (movingIndex - 1)) % numPoints], // a
      //     newActivePoints[(movingIndex + 1) % numPoints], // b
      //     newActivePoints[(movingIndex + 2) % numPoints], // c
      //   ];
      //   const nearestPointOnLine = GeometryUtils.findNearestPointOnLine(
      //     newActivePoints[movingIndex],
      //     [triangle[0], triangle[1]],
      //   );

      //   const { slope } = GeometryUtils.getSlopeIntercept(triangle[0], triangle[1]);
      //   const perpSlope = GeometryUtils.getPerpendicularSlope(slope) ?? 0;
      //   const perpIntercept = nearestPointOnLine.y - perpSlope * nearestPointOnLine.x;
      //   const perpLine: Line = [
      //     { x: 0, y: perpIntercept },
      //     { x: 1, y: perpSlope + perpIntercept },
      //   ];

      //   const centerPoint = {
      //     x: (triangle[0].x + triangle[1].x + triangle[2].x) / 3,
      //     y: (triangle[0].y + triangle[1].y + triangle[2].y) / 3,
      //   };
      //   const nearestCenterPointOnPerpLine = GeometryUtils.findNearestPointOnLine(
      //     centerPoint,
      //     perpLine,
      //   );

      //   // Find point 0.0025 in the OPPOSITE direction of the vector from nearest point -> nearest center point
      //   const offsetPoint = GeometryUtils.findPointOnVector(
      //     nearestPointOnLine,
      //     nearestCenterPointOnPerpLine,
      //     -0.01,
      //   );

      //   [nearestPointOnLine, nearestCenterPointOnPerpLine, offsetPoint].forEach((point, i) => {
      //     const updatedPt = {
      //       x: x + point.x * width,
      //       y: y + point.y * height,
      //     };
      //     ctx.beginPath();
      //     ctx.arc(updatedPt.x, updatedPt.y, 5, 0, Math.PI * 2);
      //     ctx.closePath();
      //     ctx.fillStyle = i === 2 ? 'yellow' : 'green';
      //     ctx.fill();
      //   });
      // }
    };

    // Renders the image and layer overlays
    renderImageAndOverlays();

    // Renders the active path
    const activePoints = editor.layers[activeLayer].points;
    const activePath = getPointsPath(activePoints);
    renderPointsPath(activePath);

    // Sort editor points by their magnification (magnified = higher z-index)
    const sortedPointsByZIndex = [0, 1, 2, 3].sort(
      (aIndex, bIndex) => magnifyAnimationProgress[aIndex] - magnifyAnimationProgress[bIndex],
    );
    // Then, render each active point
    sortedPointsByZIndex.forEach(pointIndex => {
      renderPoint(activePoints[pointIndex], pointIndex);
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
    movingIndex,
    magnifyAnimationProgress,
    focusIndex,
    editor.layers,
    activeLayer,
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
  }, [canvasDimensions, editor, hoveringIndex, isDragging, movingIndex, activeLayer]);

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
      {movingIndex >= 0 &&
        isDragging &&
        (isDraggingOutside ? <GlobalGrabbingCursor /> : <GlobalDisableCursor />)}
    </div>
  );
};

export default ImageSelectionEditor;
