import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as fx from 'glfx-es6';
import tw from 'twin.macro';
import { SelectionEditor } from '@src/hooks/useSelectionEditor';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { Dimensions } from '@src/types';
import { GeometryUtils } from '@src/utils/GeometryUtils';
import { renderPreview } from '@src/utils/renderPreview';

export type ImageSelectionPreviewProps = {
  /** The actual dimensions of the artwork */
  actualDimensions: Dimensions;
  editor: SelectionEditor;
  image: HTMLImageElement;
};

const ImageSelectionPreview = ({ actualDimensions, editor, image }: ImageSelectionPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [webglCanvas] = useState(() => fx.canvas());
  const [texture, setTexture] = useState<fx.Texture>();

  const [canvasDimensions, setCanvasDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });

  // Render the final artwork onto the preview canvas
  const render = () => {
    const imgCtx = document.createElement('canvas').getContext('2d');
    const ctx = canvasRef.current?.getContext('2d');
    if (imgCtx && ctx && canvasRef.current && texture) {
      const { width, height, x, y } = CanvasUtils.objectContain(canvasDimensions, actualDimensions);

      renderPreview({
        destCanvas: canvasRef.current,
        webglCanvas,
        texture,
        image,
        layers: editor.layers,
        dimensions: { width, height },
        position: { x, y },
      });
      // if (width && height) {
      //   if (editor.layers[1]) {
      //     // Clear and ready the image context
      //     CanvasUtils.clear(imgCtx);
      //     CanvasUtils.resize(imgCtx.canvas, {
      //       width: image.naturalWidth,
      //       height: image.naturalHeight,
      //     });
      //     // Draw the image at full size on canvas
      //     imgCtx.drawImage(image, 0, 0, imgCtx.canvas.width, imgCtx.canvas.height);
      //     // Cut the inner window out of the image
      //     imgCtx.globalCompositeOperation = 'destination-out';
      //     const cuttingPoints = GeometryUtils.sortConvexQuadrilateralPoints(
      //       editor.layers[1].points,
      //     ).map(point => ({
      //       x: point.x * imgCtx.canvas.width,
      //       y: point.y * imgCtx.canvas.height,
      //     }));
      //     imgCtx.beginPath();
      //     imgCtx.moveTo(cuttingPoints[0].x, cuttingPoints[0].y);
      //     imgCtx.lineTo(cuttingPoints[1].x, cuttingPoints[1].y);
      //     imgCtx.lineTo(cuttingPoints[2].x, cuttingPoints[2].y);
      //     imgCtx.lineTo(cuttingPoints[3].x, cuttingPoints[3].y);
      //     imgCtx.closePath();
      //     imgCtx.fill();
      //     // Reset composition operation
      //     imgCtx.globalCompositeOperation = 'source-over';
      //     // Load the new image on the canvas
      //     texture.loadContentsOf(imgCtx.canvas);
      //   }

      //   // Draw the image on the WebGL canvas
      //   webglCanvas.draw(texture, width, height);
      //   // Perform the perspective transformation to straighten the image
      //   const beforePoints = GeometryUtils.sortConvexQuadrilateralPoints(editor.layers[0].points);
      //   const beforeMatrix = beforePoints.flatMap(c => [c.x * width, c.y * height]) as fx.Matrix;
      //   // BROKEN: final width and height are larger than the image width and height
      //   const afterMatrix = [
      //     ...[0, 0],
      //     ...[width, 0],
      //     ...[width, height],
      //     ...[0, height],
      //   ] as fx.Matrix;
      //   webglCanvas.perspective(beforeMatrix, afterMatrix);
      //   // Update the WebGL canvas with the latest draw
      //   webglCanvas.update();

      //   // // // Reset the canvas and draw the final image in the center
      //   CanvasUtils.clear(ctx);
      //   ctx.drawImage(webglCanvas, 0, 0, width, height, x, y, width, height);
      //   // ctx.drawImage(imgCtx.canvas, 0, 0, canvasDimensions.width, canvasDimensions.height);
      // }
    }
  };

  // Update texture when image changes
  useEffect(() => {
    const texture = webglCanvas.texture(image);
    setTexture(texture);

    return () => {
      setTexture(undefined);
      texture.destroy();
    };
  }, [image]);

  // Render canvas
  useEffect(() => {
    render();
  }, [actualDimensions, editor.layers, texture, webglCanvas]);

  // Resize and re-render canvas when dimensions change
  useEffect(() => {
    if (canvasRef.current) {
      CanvasUtils.resize(canvasRef.current, canvasDimensions);
      render();
    }
  }, [canvasDimensions]);

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
    <div ref={containerRef} css={tw`size-full relative transition-opacity`}>
      <canvas
        ref={canvasRef}
        css={tw`absolute inset-0 size-full`}
        role="img"
        aria-label="A preview of the selected image"
      />
    </div>
  );
};

export default ImageSelectionPreview;
