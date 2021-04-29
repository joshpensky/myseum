import { useEffect, useRef, useState } from 'react';
import tw from 'twin.macro';
import * as fx from 'glfx-es6';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { SelectionEditor } from '@src/hooks/useSelectionEditor';
import { Dimensions } from '@src/types';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { renderPreview } from '@src/utils/renderPreview';

export type ImageSelectionPreviewProps = {
  /** The actual dimensions of the artwork */
  actualDimensions: Dimensions;
  editor: SelectionEditor;
  image: HTMLImageElement;
  onRender?(canvas: HTMLCanvasElement): void;
};

const ImageSelectionPreview = ({
  actualDimensions,
  editor,
  image,
  onRender,
}: ImageSelectionPreviewProps) => {
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
    if (canvasRef.current && texture) {
      const { width, height, x, y } = CanvasUtils.objectContain(canvasDimensions, actualDimensions);
      // TODO: separate transform render onto separate canvas to speed up?
      // Render the preview onto the destination canvas
      renderPreview({
        destCanvas: canvasRef.current,
        webglCanvas,
        texture,
        image,
        layers: editor.layers,
        dimensions: { width, height },
        position: { x, y },
      });

      onRender?.(canvasRef.current);
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
  }, [actualDimensions.height, actualDimensions.width, editor.layers, texture, webglCanvas]);

  // Resize and re-render canvas when dimensions change
  useEffect(() => {
    if (canvasRef.current) {
      CanvasUtils.resize(canvasRef.current, canvasDimensions);
      render();
    }
  }, [canvasDimensions.height, canvasDimensions.width]);

  // Update the canvas dimensions on resize
  useIsomorphicLayoutEffect(() => {
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
