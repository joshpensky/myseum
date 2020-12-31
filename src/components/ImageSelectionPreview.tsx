import { Dimensions } from '@src/types';
import { useEffect, useRef } from 'react';
import tw from 'twin.macro';
import * as fx from 'glfx-es6';
import { SelectionEditor } from '@src/hooks/useSelectionEditor';
import { CanvasUtils } from '@src/utils/CanvasUtils';

export type ImageSelectionPreviewProps = {
  actualDimensions: Dimensions;
  editor: SelectionEditor;
  image: HTMLImageElement;
};

const ImageSelectionPreview = ({ actualDimensions, editor, image }: ImageSelectionPreviewProps) => {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const canvasDimensions: Dimensions = {
    width: 500,
    height: 500,
  };

  // Render the final artwork onto the preview canvas
  useEffect(() => {
    const ctx = previewCanvasRef.current?.getContext('2d');
    if (ctx && editor.isValid && image && editor.state === 'idle') {
      const { width, height, x, y } = CanvasUtils.contain(canvasDimensions, actualDimensions);

      const tempCanvas = fx.canvas();
      const texture = tempCanvas.texture(image);
      tempCanvas.draw(texture);

      const beforeMatrix = [
        editor.points[0],
        editor.points[1],
        editor.points[3],
        editor.points[2],
      ].flatMap(c => [c.x * image.naturalWidth, c.y * image.naturalHeight]) as fx.Matrix;
      const afterMatrix = [
        ...[0, 0],
        ...[width, 0],
        ...[0, height],
        ...[width, height],
      ] as fx.Matrix;
      tempCanvas.perspective(beforeMatrix, afterMatrix);

      tempCanvas.update();

      ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);
      ctx.drawImage(tempCanvas, 0, 0, width, height, x, y, width, height);
    }
  }, [image, editor, actualDimensions, canvasDimensions]);

  return (
    <div css={[!editor.isValid && tw`opacity-50`]}>
      <canvas
        ref={previewCanvasRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
      />
    </div>
  );
};

export default ImageSelectionPreview;
