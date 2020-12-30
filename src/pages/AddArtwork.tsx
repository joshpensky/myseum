import { Dimensions, Position } from '@src/types';
import { MouseEvent, SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
import tw, { theme } from 'twin.macro';
import quickhull from 'quickhull';

const AddArtwork = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [image, setImage] = useState<HTMLImageElement | undefined>();

  const [canvasDimensions, setCanvasDimensions] = useState<Dimensions | undefined>();

  const [targets, setTargets] = useState<Position[]>([
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ]);

  // Checks whether the targets form a valid convex quadrilateral selection
  const isSelectionValid = useMemo(() => {
    // Checks the convex hull of the target points
    const hull = quickhull(targets);
    // If all points are accounted for in hull, it's valid!
    // TODO: need to also check if lines intersect OR are colinear
    return hull.length > targets.length;
  }, [targets]);

  const getImageOnCanvas = (image: HTMLImageElement, canvasDimensions: Dimensions) => {
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const canvasRatio = canvasDimensions.width / canvasDimensions.height;

    let height: number;
    let width: number;

    if (canvasRatio < imageRatio) {
      // Scale by canvas width
      width = canvasDimensions.width;
      height = image.naturalHeight * (canvasDimensions.width / image.naturalWidth);
    } else {
      // Scale by canvas height
      height = canvasDimensions.height;
      width = image.naturalWidth * (canvasDimensions.height / image.naturalHeight);
    }

    const x = (canvasDimensions.width - width) / 2;
    const y = (canvasDimensions.height - height) / 2;

    return {
      width,
      height,
      x,
      y,
    };
  };

  const [hoveringIndex, setHoveringIndex] = useState<number>(-1);
  const [movingIndex, setMovingIndex] = useState<number>(-1);

  const onMouseMove = (evt: MouseEvent<HTMLCanvasElement>) => {
    if (image && canvasDimensions) {
      const rect = evt.currentTarget.getBoundingClientRect();
      const mouseX = evt.clientX - rect.left;
      const mouseY = evt.clientY - rect.top;

      const { width, height, x, y } = getImageOnCanvas(image, canvasDimensions);

      // If there's a moving index, update target position
      if (movingIndex >= 0) {
        setTargets(targets => {
          // We calculate canvas position as..... cx = target.x * width + x;
          // So we inverse for target position... target.x = (cx - x) / width
          const tx = (mouseX - x) / width;
          const ty = (mouseY - y) / height;
          return [
            ...targets.slice(0, movingIndex),
            {
              x: Math.min(1, Math.max(0, tx)),
              y: Math.min(1, Math.max(0, ty)),
            },
            ...targets.slice(movingIndex + 1),
          ];
        });
        return;
      }

      // Otherwise, update hovering state
      const strokeOffset = 1.5;
      const hoveringIndex = targets.findIndex(target => {
        const cx = target.x * width + x;
        const cy = target.y * height + y;
        const radius = 5 + strokeOffset;
        // Find if mouse is within circle target using Pythagorean theorem
        // sqrt((x - center_x)^2 + (y - center_y)^2) <= radius
        // https://math.stackexchange.com/questions/198764/how-to-know-if-a-point-is-inside-a-circle
        const euclidianDistance = Math.sqrt(Math.pow(mouseX - cx, 2) + Math.pow(mouseY - cy, 2));
        return euclidianDistance <= radius;
      });
      setHoveringIndex(hoveringIndex);
    }
  };

  const onMouseDown = (evt: MouseEvent<HTMLCanvasElement>) => {
    if (hoveringIndex >= 0) {
      setMovingIndex(hoveringIndex);
    }
  };

  const onMouseUp = (evt: MouseEvent<HTMLCanvasElement>) => {
    if (movingIndex >= 0) {
      setMovingIndex(-1);
    }
  };

  const render = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && image && canvasDimensions) {
      ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
      // ctx.translate(0.5, 0.5); // fix crisp
      ctx.imageSmoothingEnabled = false;

      const { width, height, x, y } = getImageOnCanvas(image, canvasDimensions);

      if (isSelectionValid) {
        // The target forms a valid convex quadrilateral!
        ctx.strokeStyle = '#0989FF';
      } else {
        // The target does not form a valid convex quadrilateral
        ctx.strokeStyle = theme`colors.red.500`;
      }

      ctx.lineWidth = 3;
      const strokeOffset = ctx.lineWidth / 2;

      const tempCvs = document.createElement('canvas');
      tempCvs.width = canvasDimensions.width;
      tempCvs.height = canvasDimensions.height;

      // Draw black overlay
      ctx.fillStyle = theme`colors.black`;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);
      ctx.globalAlpha = 1;

      // Draw and clip overlay window
      ctx.globalCompositeOperation = 'destination-out';
      const path = new Path2D();
      targets.forEach((target, idx) => {
        if (idx === 0) {
          path.moveTo(target.x * width + x, target.y * height + y);
        } else {
          path.lineTo(target.x * width + x, target.y * height + y);
        }
      });
      path.closePath();
      ctx.fill(path);

      // Revert back to regular composition type
      ctx.globalCompositeOperation = 'source-over';

      // Outline frame path
      ctx.fillStyle = theme`colors.white`;
      ctx.globalAlpha = 1;
      ctx.stroke(path);

      // Draw resize targets
      targets.forEach(target => {
        ctx.beginPath();
        ctx.arc(target.x * width + x, target.y * height + y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
      });

      // ctx.beginPath();
      // ctx.arc(x + strokeOffset, y + strokeOffset, 5, 0, Math.PI * 2);
      // ctx.fill();
      // ctx.stroke();

      // ctx.beginPath();
      // ctx.arc(x + width - strokeOffset, y + strokeOffset, 5, 0, Math.PI * 2);
      // ctx.fill();
      // ctx.stroke();

      // ctx.beginPath();
      // ctx.arc(x + width - strokeOffset, y + height - strokeOffset, 5, 0, Math.PI * 2);
      // ctx.fill();
      // ctx.stroke();

      // ctx.beginPath();
      // ctx.arc(x + strokeOffset, y + height - strokeOffset, 5, 0, Math.PI * 2);
      // ctx.fill();
      // ctx.stroke();

      // ctx.strokeRect(x, y + ctx.lineWidth / 2, width, height - ctx.lineWidth);
    }
  };

  const resize = () => {
    if (canvasRef.current && canvasDimensions) {
      canvasRef.current.width = canvasDimensions.width;
      canvasRef.current.height = canvasDimensions.height;
      render();
    }
  };

  useEffect(() => {
    if (canvasDimensions) {
      render();
    }
  }, [canvasDimensions, targets]);

  useEffect(() => {
    if (canvasDimensions) {
      resize();
    }
  }, [canvasDimensions]);

  useEffect(() => {
    if (image && containerRef.current) {
      const observer = new ResizeObserver(entries => {
        entries.forEach(entry => {
          const canvasDimensions = {
            height: entry.contentRect.height,
            width: entry.contentRect.width,
          };
          setCanvasDimensions(canvasDimensions);
        });
      });
      observer.observe(containerRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, [image]);

  const onImageLoad = (evt: SyntheticEvent<HTMLImageElement>) => {
    setImage(evt.currentTarget);
  };

  return (
    <div css={tw`fixed inset-0 bg-black flex flex-1`}>
      <div css={tw`flex flex-col flex-1 items-center justify-center p-10`}>
        <div ref={containerRef} css={tw`flex flex-col flex-1 size-full relative`}>
          <img
            src="/img/test-add.jpeg"
            alt=""
            css={tw`absolute inset-0 object-contain size-full`}
            onLoad={onImageLoad}
          />
          {canvasDimensions && (
            <canvas
              ref={canvasRef}
              css={[
                tw`absolute inset-0 size-full`,
                movingIndex >= 0 ? tw`cursor-grabbing` : hoveringIndex >= 0 && tw`cursor-grab`,
              ]}
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
              onMouseMove={onMouseMove}
            />
          )}
        </div>
      </div>

      <div css={tw`flex flex-col border-l border-white w-96 p-4`}></div>
    </div>
  );
};

export default AddArtwork;
