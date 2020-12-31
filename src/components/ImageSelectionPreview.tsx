import { useEffect, useRef, useState } from 'react';
import * as fx from 'glfx-es6';
import tw from 'twin.macro';
import { SelectionEditor } from '@src/hooks/useSelectionEditor';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { Dimensions } from '@src/types';

export type ImageSelectionPreviewProps = {
  /** The actual dimensions of the artwork */
  actualDimensions: Dimensions;
  editor: SelectionEditor;
  image: HTMLImageElement;
};

const ImageSelectionPreview = ({ actualDimensions, editor, image }: ImageSelectionPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglCanvas] = useState(() => fx.canvas());
  const [texture, setTexture] = useState<fx.Texture>();

  const canvasDimensions: Dimensions = {
    width: 500,
    height: 500,
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

  // Render the final artwork onto the preview canvas
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && texture && editor.isValid) {
      const { width, height, x, y } = CanvasUtils.containObject(canvasDimensions, actualDimensions);

      // Draw the image on the WebGL canvas
      webglCanvas.draw(texture);
      // Perform the perspective transformation to straighten the image
      const beforeMatrix = editor.points.flatMap(c => [
        c.x * image.naturalWidth,
        c.y * image.naturalHeight,
      ]) as fx.Matrix;
      const afterMatrix = [
        ...[0, 0],
        ...[width, 0],
        ...[width, height],
        ...[0, height],
      ] as fx.Matrix;
      webglCanvas.perspective(beforeMatrix, afterMatrix);
      // Update the WebGL canvas with the latest draw
      webglCanvas.update();

      // Reset the canvas and draw the final image in the center
      CanvasUtils.clear(ctx);
      ctx.drawImage(webglCanvas, 0, 0, width, height, x, y, width, height);
    }
  }, [actualDimensions, canvasDimensions, editor, texture, webglCanvas]);

  return (
    <div css={[tw`relative transition-opacity`, !editor.isValid && tw`opacity-50`]}>
      <canvas ref={canvasRef} width={canvasDimensions.width} height={canvasDimensions.height} />
    </div>
  );
};

export default ImageSelectionPreview;
