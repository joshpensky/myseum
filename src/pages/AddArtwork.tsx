import { Dimensions, Position } from '@src/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import tw, { theme } from 'twin.macro';
import quickhull from 'quickhull';
import * as fx from 'glfx-es6';

const POINT_RADIUS = 5;
const STROKE_WIDTH = 3;
const INNER_CANVAS_PADDING = POINT_RADIUS + STROKE_WIDTH / 2;

type Measurement = 'inch' | 'cm' | 'mm';
type Preset = {
  type: 'custom' | 'a4' | 'poster';
  display: string;
  dimensions: Dimensions;
  measurement: Measurement;
};

const presets: Preset[] = [
  {
    type: 'a4',
    display: 'A4',
    dimensions: {
      width: 210,
      height: 297,
    },
    measurement: 'mm',
  },
  {
    type: 'poster',
    display: 'Poster',
    dimensions: {
      width: 11,
      height: 17,
    },
    measurement: 'inch',
  },
];

// https://cdn.tutors.com/assets/images/courses/math/geometry-help/convex-concave-quadrilateral.jpg
const isQuadrilateralComplex = (points: [Position, Position, Position, Position]) => {
  enum Orientation {
    COLINEAR = 0,
    CLOCKWISE = 1,
    COUNTER_CLOCKWISE = 2,
  }
  const getOrientation = (p1: Position, p2: Position, p3: Position) => {
    const value = (p2.y - p1.y) * (p3.x - p2.x) - (p2.x - p1.x) * (p3.y - p2.y);
    if (value === 0) {
      return Orientation.COLINEAR;
    } else if (value > 0) {
      return Orientation.CLOCKWISE;
    }
    return Orientation.COUNTER_CLOCKWISE;
  };

  const isPointOnLine = (point: Position, line: [Position, Position]) => {
    const [l1, l2] = line;
    const isPointWithinXRange = Math.min(l1.x, l2.x) <= point.x && point.x <= Math.max(l1.x, l2.x);
    const isPointWithinYRange = Math.min(l1.y, l2.y) <= point.y && point.y <= Math.max(l1.y, l2.y);
    return isPointWithinXRange && isPointWithinYRange;
  };

  // Check if line segments p1p2 and p3p4 intersect
  const doLinesIntersect = (lineAB: [Position, Position], lineXY: [Position, Position]) => {
    const [a, b] = lineAB;
    const [x, y] = lineXY;

    // Get the orientation of a and b on line xy
    const oA_XY = getOrientation(x, y, a);
    const oB_XY = getOrientation(x, y, b);
    // Get the orientation of x and y on line ab
    const oX_AB = getOrientation(a, b, x);
    const oY_AB = getOrientation(a, b, y);

    // INTERSECTION CHECK
    // https://algorithmtutor.com/Computational-Geometry/Check-if-two-line-segment-intersect/
    const abIntersectsXy =
      (oA_XY === Orientation.CLOCKWISE && oB_XY === Orientation.COUNTER_CLOCKWISE) ||
      (oA_XY === Orientation.COUNTER_CLOCKWISE && oB_XY === Orientation.CLOCKWISE);
    const xyIntersectsAb =
      (oX_AB === Orientation.CLOCKWISE && oY_AB === Orientation.COUNTER_CLOCKWISE) ||
      (oX_AB === Orientation.COUNTER_CLOCKWISE && oY_AB === Orientation.CLOCKWISE);
    if (abIntersectsXy && xyIntersectsAb) {
      return true;
    }

    // COLLINEAR CHECKS
    // If a is on line xy, then the lines intersect
    if (oA_XY === Orientation.COLINEAR && isPointOnLine(a, [x, y])) {
      return true;
    }
    // If b is on line xy, then the lines intersect
    if (oB_XY === Orientation.COLINEAR && isPointOnLine(b, [x, y])) {
      return true;
    }
    // If x is on line ab, then the lines intersect
    if (oX_AB === Orientation.COLINEAR && isPointOnLine(x, [a, b])) {
      return true;
    }
    // If y is on line ab, then the lines intersect
    if (oY_AB === Orientation.COLINEAR && isPointOnLine(y, [a, b])) {
      return true;
    }

    // Otherwise, the lines don't intersect
    return false;
  };

  const [a, b, x, y] = points;
  const abIntersectsXy = doLinesIntersect([a, b], [x, y]);
  const ayIntersectsBx = doLinesIntersect([a, y], [b, x]);

  return abIntersectsXy || ayIntersectsBx;
};

const AddArtwork = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [image, setImage] = useState<HTMLImageElement>();
  const [canvasDimensions, setCanvasDimensions] = useState<Dimensions>();

  const [corners, setCorners] = useState<[Position, Position, Position, Position]>([
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ]);

  const [hoveringIndex, setHoveringIndex] = useState<number>(-1);
  const [movingIndex, setMovingIndex] = useState<number>(-1);

  const [presetType, setPresetType] = useState<Preset['type']>('custom');
  const [finalDimensions, setFinalDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [measurement, setMeasurement] = useState<Measurement>('inch');

  // Checks whether the corners form a valid convex quadrilateral selection
  const isSelectionValid = useMemo(() => {
    // If the quadrilteral is complex (a.k.a, any of the lines intersect or are colinear), it's invalid!
    if (isQuadrilateralComplex(corners)) {
      return false;
    }

    // Checks the convex hull of the corner points
    // If the quadrilateral is concave (a.k.a, all points aren't accounted for in hull [1-4 and back again]), it's invalid!
    const hull = quickhull(corners);
    if (hull.length === corners.length) {
      return false;
    }

    // Otherwise, selection is valid!
    return true;
  }, [corners]);

  /**
   * Gets the dimensions and position of the inner canvas (where the image lies on the
   * canvas).
   */
  const getInnerCanvas = (
    imageDimensions: Dimensions,
    canvasDimensions: Dimensions,
    padding = 0,
  ) => {
    const imageRatio = imageDimensions.width / imageDimensions.height;
    const canvasRatio = canvasDimensions.width / canvasDimensions.height;

    let height: number;
    let width: number;

    if (canvasRatio < imageRatio) {
      // Scale by canvas width
      width = canvasDimensions.width;
      height = imageDimensions.height * (canvasDimensions.width / imageDimensions.width);
    } else {
      // Scale by canvas height
      height = canvasDimensions.height;
      width = imageDimensions.width * (canvasDimensions.height / imageDimensions.height);
    }

    const x = (canvasDimensions.width - width) / 2;
    const y = (canvasDimensions.height - height) / 2;

    return {
      x: x + padding,
      y: y + padding,
      width: width - padding * 2,
      height: height - padding * 2,
    };
  };

  // handler for preset updates
  const onPresetUpdate = (presetType: Preset['type']) => {
    if (presetType !== 'custom') {
      const preset = presets.find(preset => preset.type === presetType);
      if (preset) {
        setPresetType(preset.type);
        setFinalDimensions(preset.dimensions);
        setMeasurement(preset.measurement);
        return;
      }
    }
    setPresetType('custom');
  };

  const onMouseMove = (evt: MouseEvent) => {
    if (canvasRef.current && image && canvasDimensions) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = evt.clientX - rect.left;
      const mouseY = evt.clientY - rect.top;

      const { width, height, x, y } = getInnerCanvas(
        {
          width: image.naturalWidth,
          height: image.naturalHeight,
        },
        canvasDimensions,
        INNER_CANVAS_PADDING,
      );

      // If there's a moving index, update corner position
      if (movingIndex >= 0) {
        setCorners(corners => {
          // We calculate canvas position as..... cx = corner.x * width + x;
          // So we inverse for corner position... corner.x = (cx - x) / width
          const fx = (mouseX - x) / width;
          const fy = (mouseY - y) / height;
          return [
            ...corners.slice(0, movingIndex),
            {
              x: Math.min(1, Math.max(0, fx)),
              y: Math.min(1, Math.max(0, fy)),
            },
            ...corners.slice(movingIndex + 1),
          ] as [Position, Position, Position, Position];
        });
        return;
      }

      // Otherwise, update hovering state
      const strokeOffset = STROKE_WIDTH / 2;
      const hoveringIndex = corners.findIndex(corner => {
        const cx = corner.x * width + x;
        const cy = corner.y * height + y;
        const radius = POINT_RADIUS + strokeOffset;
        // Check if mouse is within circular corner target using Pythagorean theorem:
        // sqrt((x - center_x)^2 + (y - center_y)^2) <= radius
        // https://math.stackexchange.com/questions/198764/how-to-know-if-a-point-is-inside-a-circle
        const euclidianDistance = Math.sqrt(Math.pow(mouseX - cx, 2) + Math.pow(mouseY - cy, 2));
        return euclidianDistance <= radius;
      });
      setHoveringIndex(hoveringIndex);
    }
  };

  const onMouseDown = () => {
    if (hoveringIndex >= 0) {
      setMovingIndex(hoveringIndex);
    }
  };

  const onMouseUp = () => {
    if (movingIndex >= 0) {
      setMovingIndex(-1);
    }
  };

  // Renders the interactive canvas
  const render = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && image && canvasDimensions) {
      ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
      // ctx.translate(0.5, 0.5); // fix crisp
      ctx.imageSmoothingEnabled = false;

      const { width, height, x, y } = getInnerCanvas(
        {
          width: image.naturalWidth,
          height: image.naturalHeight,
        },
        canvasDimensions,
        INNER_CANVAS_PADDING,
      );

      // Draw black overlay
      ctx.fillStyle = theme`colors.black`;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);
      ctx.globalAlpha = 1;

      // Draw and clip overlay window
      ctx.globalCompositeOperation = 'destination-out';
      const path = new Path2D();
      corners.forEach((corner, idx) => {
        if (idx === 0) {
          path.moveTo(corner.x * width + x, corner.y * height + y);
        } else {
          path.lineTo(corner.x * width + x, corner.y * height + y);
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
      if (isSelectionValid) {
        // The corner forms a valid convex quadrilateral!
        ctx.strokeStyle = '#0989FF';
      } else {
        // The corner does not form a valid convex quadrilateral
        ctx.strokeStyle = theme`colors.red.500`;
      }
      ctx.stroke(path);

      // Draw å corners
      corners.forEach(corner => {
        ctx.beginPath();
        ctx.arc(corner.x * width + x, corner.y * height + y, POINT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
      });
    }
  };

  // Render the final artwork onto the preview canvas
  useEffect(() => {
    const ctx = previewCanvasRef.current?.getContext('2d');
    if (ctx && isSelectionValid && image && movingIndex < 0) {
      const { width, height, x, y } = getInnerCanvas(finalDimensions, { width: 500, height: 500 });

      const tempCanvas = fx.canvas();
      const texture = tempCanvas.texture(image);
      tempCanvas.draw(texture);

      const beforeMatrix = [corners[0], corners[1], corners[3], corners[2]].flatMap(c => [
        c.x * image.naturalWidth,
        c.y * image.naturalHeight,
      ]) as fx.Matrix;
      const afterMatrix = [
        ...[0, 0],
        ...[width, 0],
        ...[0, height],
        ...[width, height],
      ] as fx.Matrix;
      tempCanvas.perspective(beforeMatrix, afterMatrix);

      tempCanvas.update();

      ctx.clearRect(0, 0, 500, 500);
      ctx.drawImage(tempCanvas, 0, 0, width, height, x, y, width, height);
    }
  }, [image, corners, finalDimensions, movingIndex]);

  // Re-render the canvas when corners change
  useEffect(() => {
    render();
  }, [corners]);

  // Resize the canvas when dimensions change
  useEffect(() => {
    if (canvasRef.current && canvasDimensions) {
      canvasRef.current.width = canvasDimensions.width;
      canvasRef.current.height = canvasDimensions.height;
      render();
    }
  }, [canvasDimensions]);

  useEffect(() => {
    if (image && canvasDimensions) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mouseup', onMouseUp);
      return () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [image, canvasDimensions, hoveringIndex, movingIndex]);

  // Update the canvas dimensions on resize
  useEffect(() => {
    if (image && containerRef.current) {
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
  }, [image]);

  // Load the image
  useEffect(() => {
    if (!image) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        const getDimension = (value: number) => {
          const inches = value / 72; // px to in, at 72ppi
          return Math.round(inches * 100) / 100; // rounded to nearest 0.01
        };
        setFinalDimensions({
          width: getDimension(img.naturalWidth),
          height: getDimension(img.naturalHeight),
        });
      };
      img.src = '/img/test-add.jpeg';
    }
  }, []);

  return (
    <div css={tw`fixed inset-0 bg-black flex flex-1`}>
      <div css={tw`flex flex-col flex-1 items-center justify-center p-4`}>
        <div css={tw`flex flex-col pb-6`}>
          <label htmlFor="preset" css={tw`text-white`}>
            Preset
          </label>
          <select
            id="preset"
            value={presetType}
            onChange={evt => onPresetUpdate(evt.target.value as Preset['type'])}>
            <option value="custom">Custom</option>
            {presets.map(preset => (
              <option key={preset.type} value={preset.type}>
                {preset.display}
              </option>
            ))}
          </select>
          <div css={tw`flex pt-6`}>
            <div css={tw`flex flex-col mr-4`}>
              <label htmlFor="width" css={tw`text-white`}>
                Width
              </label>
              <input
                id="width"
                type="number"
                min="0"
                step="0.1"
                value={finalDimensions.width}
                onChange={evt => {
                  let width = evt.target.valueAsNumber;
                  if (Number.isNaN(width)) {
                    width = 0;
                  }
                  setPresetType('custom');
                  setFinalDimensions(dimensions => ({
                    ...dimensions,
                    width,
                  }));
                }}
              />
            </div>
            <div css={tw`flex flex-col mr-4`}>
              <label htmlFor="height" css={tw`text-white`}>
                Height
              </label>
              <input
                id="height"
                type="number"
                min="0"
                step="0.1"
                value={finalDimensions.height}
                onChange={evt => {
                  let height = evt.target.valueAsNumber;
                  if (Number.isNaN(height)) {
                    height = 0;
                  }
                  setPresetType('custom');
                  setFinalDimensions(dimensions => ({
                    ...dimensions,
                    height,
                  }));
                }}
              />
            </div>
            <div css={tw`flex flex-col`}>
              <label htmlFor="measurement" css={tw`text-white`}>
                Measurement
              </label>
              <select
                id="measurement"
                value={measurement}
                onChange={evt => {
                  setPresetType('custom');
                  setMeasurement(evt.target.value as Measurement);
                }}>
                <option value="inch">inches</option>
                <option value="cm">centimeters</option>
                <option value="mm">millimeters</option>
              </select>
            </div>
          </div>
        </div>

        <div ref={containerRef} css={tw`flex flex-col flex-1 size-full relative`}>
          {canvasDimensions && (
            <canvas
              ref={canvasRef}
              css={[
                tw`absolute inset-0 size-full`,
                movingIndex >= 0 ? tw`cursor-grabbing` : hoveringIndex >= 0 && tw`cursor-grab`,
              ]}
            />
          )}
        </div>
      </div>

      <div css={[tw`flex flex-col flex-shrink-0 border-l border-white p-4`]}>
        <div css={[!isSelectionValid && movingIndex < 0 && tw`opacity-50`]}>
          <canvas ref={previewCanvasRef} width={500} height={500} />
        </div>
        {/* <div
          css={tw`p-4 flex flex-col text-white select-none fixed bottom-0 left-0 bg-black bg-opacity-20`}>
          {corners.map((c, index) => (
            <code key={index}>
              [{c.x}, {c.y}]
            </code>
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default AddArtwork;
