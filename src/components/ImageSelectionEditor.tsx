import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import tw, { theme } from 'twin.macro';
import { createGlobalStyle } from 'styled-components';
import { SelectionEditor, SelectionEditorPoints } from '@src/hooks/useSelectionEditor';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { BaseProps, Dimensions } from '@src/types';
import { GeometryUtils } from '@src/utils/GeometryUtils';

const POINT_RADIUS = 5;
const STROKE_WIDTH = 3;
const INNER_CANVAS_PADDING = POINT_RADIUS + STROKE_WIDTH / 2;

const GlobalGrabbingCursor = createGlobalStyle`
  * {
    ${tw`cursor-grabbing!`}
  }
`;

export type ImageSelectionEditorProps = BaseProps & {
  editor: SelectionEditor;
  image: HTMLImageElement;
};

const ImageSelectionEditor = ({ className, css, editor, image }: ImageSelectionEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [canvasDimensions, setCanvasDimensions] = useState<Dimensions>();

  const [hoveringIndex, setHoveringIndex] = useState<number>(-1);
  const [movingIndex, setMovingIndex] = useState<number>(-1);

  const onMouseMove = (evt: MouseEvent) => {
    if (canvasRef.current && canvasDimensions) {
      const rect = canvasRef.current.getBoundingClientRect();
      // Calculates the mouseX and mouseY within the canvas
      const mouseX = evt.clientX - rect.left;
      const mouseY = evt.clientY - rect.top;

      // If mouse is outside the canvas, ignore the event
      if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) {
        return;
      }

      const { width, height, x, y } = CanvasUtils.contain(
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
        editor.onPointsChange(points => {
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
    }
  };

  const onMouseDown = (evt: MouseEvent) => {
    if (hoveringIndex >= 0) {
      evt.preventDefault();
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
    if (ctx && canvasDimensions) {
      // Reset canvas
      ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
      ctx.imageSmoothingEnabled = false;
      // ctx.translate(0.5, 0.5); // fix crisp render

      const { width, height, x, y } = CanvasUtils.contain(
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

      // Draw point targets
      editor.points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x * width + x, point.y * height + y, POINT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
      });
    }
  };

  // Update editor state
  useEffect(() => {
    if (movingIndex >= 0) {
      editor.onStateChange('editing');
    } else {
      editor.onStateChange('idle');
    }
  }, [movingIndex]);

  // Re-render the canvas when points (and their validity) change
  useEffect(() => {
    render();
  }, [editor.isValid, editor.points]);

  // Resize the canvas when dimensions change
  useEffect(() => {
    if (canvasRef.current && canvasDimensions) {
      canvasRef.current.width = canvasDimensions.width;
      canvasRef.current.height = canvasDimensions.height;
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
  }, [canvasDimensions, hoveringIndex, movingIndex]);

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

  return (
    <div ref={containerRef} className={className} css={[tw`size-full relative`, css]}>
      {canvasDimensions && (
        <canvas
          ref={canvasRef}
          css={[tw`absolute inset-0 size-full`, hoveringIndex >= 0 && tw`cursor-grab`]}
        />
      )}
      {movingIndex >= 0 && <GlobalGrabbingCursor />}
      {/* <div
        css={tw`p-4 flex flex-col text-white pointer-events-none fixed bottom-0 left-0 bg-black bg-opacity-20`}>
        {editor.points.map((c, index) => (
          <code key={index}>
            [{c.x}, {c.y}]
          </code>
        ))}
      </div> */}
    </div>
  );
};

export default ImageSelectionEditor;
