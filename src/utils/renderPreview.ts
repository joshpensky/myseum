import * as fx from 'glfx-es6';
import { SelectionEditorLayer } from '@src/hooks/useSelectionEditor';
import { Dimensions, Position } from '@src/types';
import { CanvasUtils } from './CanvasUtils';
import { GeometryUtils } from './GeometryUtils';

type RenderPreviewOptions = {
  destCanvas: HTMLCanvasElement;
  dimensions: Dimensions;
  image: HTMLImageElement;
  layers: SelectionEditorLayer[];
  position: Position;
  texture: fx.Texture;
  webglCanvas: fx.Canvas;
};

export const renderPreview = ({
  destCanvas,
  dimensions,
  image,
  layers,
  position,
  texture,
  webglCanvas,
}: RenderPreviewOptions) => {
  const imgCtx = document.createElement('canvas').getContext('2d');
  const destCtx = destCanvas.getContext('2d');

  if (!destCtx || dimensions.width <= 0 || dimensions.height <= 0) {
    return;
  }

  if (imgCtx && layers[1]) {
    // Clear and ready the image context
    CanvasUtils.clear(imgCtx);
    CanvasUtils.resize(imgCtx.canvas, {
      width: image.naturalWidth,
      height: image.naturalHeight,
    });
    // Draw the image at full size on canvas
    imgCtx.drawImage(image, 0, 0, imgCtx.canvas.width, imgCtx.canvas.height);
    // Cut the inner window out of the image
    imgCtx.globalCompositeOperation = 'destination-out';
    const cuttingPoints = GeometryUtils.sortConvexQuadrilateralPoints(layers[1].points).map(
      point => ({
        x: point.x * imgCtx.canvas.width,
        y: point.y * imgCtx.canvas.height,
      }),
    );
    imgCtx.beginPath();
    imgCtx.moveTo(cuttingPoints[0].x, cuttingPoints[0].y);
    imgCtx.lineTo(cuttingPoints[1].x, cuttingPoints[1].y);
    imgCtx.lineTo(cuttingPoints[2].x, cuttingPoints[2].y);
    imgCtx.lineTo(cuttingPoints[3].x, cuttingPoints[3].y);
    imgCtx.closePath();
    imgCtx.fill();
    // Reset composition operation
    imgCtx.globalCompositeOperation = 'source-over';
    // Load the new image on the canvas
    texture.loadContentsOf(imgCtx.canvas);
  } else {
    texture.loadContentsOf(image);
  }

  // Draw the image on the WebGL canvas
  webglCanvas.draw(texture, dimensions.width, dimensions.height);
  // Perform the perspective transformation to straighten the image
  const beforePoints = GeometryUtils.sortConvexQuadrilateralPoints(layers[0].points);
  const beforeMatrix = beforePoints.flatMap(c => [
    c.x * dimensions.width,
    c.y * dimensions.height,
  ]) as fx.Matrix;
  const afterMatrix = [
    ...[0, 0],
    ...[dimensions.width, 0],
    ...[dimensions.width, dimensions.height],
    ...[0, dimensions.height],
  ] as fx.Matrix;
  webglCanvas.perspective(beforeMatrix, afterMatrix);
  // Update the WebGL canvas with the latest draw
  webglCanvas.update();

  // Reset the canvas and draw the final image in the center
  CanvasUtils.clear(destCtx);
  destCtx.drawImage(
    webglCanvas,
    0,
    0,
    dimensions.width,
    dimensions.height,
    position.x,
    position.y,
    dimensions.width,
    dimensions.height,
  );
};
