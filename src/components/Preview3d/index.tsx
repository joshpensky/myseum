import { useEffect, useRef, useState } from 'react';
import { darken, rgb } from 'polished';
import { ArtworkDto } from '@src/data/ArtworkSerializer';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { Dimensions } from '@src/types';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { CommonUtils } from '@src/utils/CommonUtils';
// import { FrameDto } from '@src/data/FrameSerializer';
import styles from './preview3d.module.scss';

interface Preview3dProps {
  rotated: boolean;
  artwork: Pick<ArtworkDto, 'src' | 'alt' | 'size'>;
  // frame?: Pick<FrameDto, 'src' | 'description' | 'size'>;
}

export const Preview3d = ({ artwork, rotated }: Preview3dProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [wrapperDimensions, setWrapperDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  // Track wrapper dimensions on resize
  useIsomorphicLayoutEffect(() => {
    if (wrapperRef.current) {
      const observer = new ResizeObserver(entries => {
        const [wrapper] = entries;
        setWrapperDimensions({
          height: wrapper.contentRect.height,
          width: wrapper.contentRect.width,
        });
      });
      observer.observe(wrapperRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  // Get color for the rotated depth sides
  const [depthColor, setDepthColor] = useState(rgb(124, 124, 124));
  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      try {
        // Create the canvas
        const canvas = document.createElement('canvas');
        const imgDimensions = CommonUtils.getImageDimensions(image);
        canvas.width = 5;
        canvas.height = imgDimensions.height;
        // Get the canvas 2D context
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Context not found.');
        }
        // Draw the right edge onto a single pixel
        ctx.drawImage(image, 0, 0, 5, imgDimensions.height, 0, 0, 1, 1);
        // Get the RGB data for that pixel and set color
        const colorData = ctx.getImageData(0, 0, 1, 1);
        setDepthColor(rgb(colorData.data[0], colorData.data[1], colorData.data[2]));
      } catch {
        // If anything fails, use default depth color
        setDepthColor(rgb(124, 124, 124));
      }
    };
    image.src = artwork.src;
  }, [artwork.src]);

  let angle = 0;
  let scale = 1;
  if (rotated) {
    angle = 30;
    scale = 0.8;
  }

  const previewDimensions = CanvasUtils.objectContain(wrapperDimensions, {
    width: artwork.size.width,
    height: artwork.size.height,
  });
  const previewUnitSize = previewDimensions.width / artwork.size.width;

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div
        className={styles.preview}
        style={{
          '--width': previewDimensions.width,
          '--height': previewDimensions.height,
          '--depth': artwork.size.depth * previewUnitSize,
          '--scale': scale,
          '--angle': angle,
          '--color': depthColor,
          '--color-shade': darken(0.1, depthColor),
        }}>
        <div className={styles.previewFront}>
          <img src={artwork.src} alt={artwork.alt} />
        </div>
        <div className={styles.previewTop} />
        <div className={styles.previewLeft} />
      </div>
    </div>
  );
};
