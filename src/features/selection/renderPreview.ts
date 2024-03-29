import * as fx from 'glfx-es6';
import PerspT from 'perspective-transform';
import { SelectionEditorSnapshot } from '@src/features/selection';
import { Dimensions, Position } from '@src/types';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { CommonUtils } from '@src/utils/CommonUtils';
import { GeometryUtils } from '@src/utils/GeometryUtils';

export interface RenderPreviewOptions {
  destCanvas: HTMLCanvasElement;
  dimensions: Dimensions;
  image: HTMLImageElement;
  paths: SelectionEditorSnapshot;
  position: Position;
  texture: fx.Texture;
  webglCanvas: fx.Canvas;
}

export const renderPreview = ({
  destCanvas,
  dimensions,
  image,
  paths,
  position,
  texture,
  webglCanvas,
}: RenderPreviewOptions) => {
  const destCtx = destCanvas.getContext('2d');

  if (!destCtx || dimensions.width <= 0 || dimensions.height <= 0 || !image.complete) {
    return;
  }

  // Cap the max image resolution to 2048px
  const imgDimensions = CanvasUtils.objectContain(
    { width: 2048, height: 2048 },
    CommonUtils.getImageDimensions(image),
  );

  // Draw the image on the WebGL canvas
  webglCanvas.draw(texture, imgDimensions.width, imgDimensions.height);
  // Perform the perspective transformation to straighten the image
  // We use image dimensions to ensure it's drawn at the highest quality possible
  const srcPoints = GeometryUtils.sortConvexQuadrilateralPoints(paths.outline);
  const imgSrcMatrix = srcPoints.flatMap(c => [
    c.x * imgDimensions.width,
    c.y * imgDimensions.height,
  ]) as fx.Matrix;
  const imgDestMatrix = [
    ...[0, 0],
    ...[imgDimensions.width, 0],
    ...[imgDimensions.width, imgDimensions.height],
    ...[0, imgDimensions.height],
  ] as fx.Matrix;
  webglCanvas.perspective(imgSrcMatrix, imgDestMatrix);
  // Update the WebGL canvas with the latest draw
  webglCanvas.update();

  // Reset the canvas and draw the final image in the center
  CanvasUtils.clear(destCtx);
  destCtx.drawImage(
    webglCanvas,
    0,
    0,
    imgDimensions.width,
    imgDimensions.height,
    position.x,
    position.y,
    dimensions.width,
    dimensions.height,
  );

  if (paths.inner) {
    // Get perspective matrix
    const canvasSrcMatrix = srcPoints.flatMap(c => [
      c.x * dimensions.width,
      c.y * dimensions.height,
    ]) as fx.Matrix;
    const canvasDestMatrix = [
      ...[0, 0],
      ...[dimensions.width, 0],
      ...[dimensions.width, dimensions.height],
      ...[0, dimensions.height],
    ] as fx.Matrix;
    const perspective = PerspT(canvasSrcMatrix, canvasDestMatrix);

    // For each subsequent layer, cut out the window from the transformed image
    const windowPoints = paths.inner.map(point => {
      // Transform point from source matrix to projected position on destination matrix
      const [x, y] = perspective.transform(point.x * dimensions.width, point.y * dimensions.height);
      // Return points, positioned correctly on canvas
      return {
        x: position.x + x,
        y: position.y + y,
      };
    });

    // Cut out the window from the final canvas
    destCtx.globalCompositeOperation = 'destination-out';
    destCtx.beginPath();
    windowPoints.forEach((point, index) => {
      if (index === 0) {
        destCtx.moveTo(point.x, point.y);
      } else {
        destCtx.lineTo(point.x, point.y);
      }
    });
    destCtx.closePath();
    destCtx.fill();
    destCtx.globalCompositeOperation = 'source-over';
  }
};
