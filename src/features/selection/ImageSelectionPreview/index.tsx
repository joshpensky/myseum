import { useEffect, useRef, useState } from 'react';
import * as fx from 'glfx-es6';
import { SelectionEditorState } from '@src/features/selection';
import { renderPreview, RenderPreviewOptions } from '@src/features/selection/renderPreview';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { Dimensions } from '@src/types';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import styles from './imageSelectionPreview.module.scss';

export type ImageSelectionPreviewProps = {
  /** The actual dimensions of the artwork */
  actualDimensions: Dimensions;
  editor: SelectionEditorState;
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
      const previewOptions: RenderPreviewOptions = {
        destCanvas: canvasRef.current,
        webglCanvas,
        texture,
        image,
        paths: editor.current,
        dimensions: { width, height },
        position: { x, y },
      };
      // TODO: separate transform render onto separate canvas to speed up?
      // Render the preview onto the destination canvas
      requestAnimationFrame(() => renderPreview(previewOptions));

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
  }, [
    actualDimensions.height,
    actualDimensions.width,
    JSON.stringify(editor),
    texture,
    webglCanvas,
  ]);

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
    <div ref={containerRef} className={styles.container}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label="A preview of the selected image"
      />
    </div>
  );
};

export default ImageSelectionPreview;
