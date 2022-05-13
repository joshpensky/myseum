import { Fragment, useEffect, useRef, useState } from 'react';
import { Matting } from '@prisma/client';
import cx from 'classnames';
import { darken, rgb } from 'polished';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import { FrameDto } from '@src/data/serializers/frame.serializer';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { Dimensions, Position } from '@src/types';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { CommonUtils } from '@src/utils/CommonUtils';
import { GeometryUtils } from '@src/utils/GeometryUtils';
import styles from './preview3d.module.scss';

export interface Preview3dProps {
  rotated: boolean;
  artwork: Pick<ArtworkDto, 'src' | 'alt' | 'size'>;
  frame?: Pick<FrameDto, 'src' | 'alt' | 'size' | 'window'>;
  framingOptions?: {
    isScaled: boolean;
    scaling: number;
    matting: Matting;
  };
}

export const Preview3d = ({ artwork, frame, rotated, framingOptions }: Preview3dProps) => {
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

  const getAverageColor = async (src: string): Promise<string | null> =>
    new Promise(resolve => {
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
          resolve(rgb(colorData.data[0], colorData.data[1], colorData.data[2]));
        } catch (error) {
          resolve(null);
        }
      };
      image.crossOrigin = 'Anonymous';
      image.src = src;
    });

  // Get color for the rotated frame depth sides
  const [frameDepthColor, setFrameDepthColor] = useState<string | null>(null);
  useEffect(() => {
    if (frame) {
      (async () => {
        const color = await getAverageColor(frame.src);
        setFrameDepthColor(color);
      })();
    }
  }, [frame?.src]);

  // Get color for the rotated artwork depth sides
  const [artworkDepthColor, setArtworkDepthColor] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const color = await getAverageColor(artwork.src);
      setArtworkDepthColor(color);
    })();
  }, [artwork.src]);

  // Get color for the rotated depth sides
  const depthColor = frame ? frameDepthColor : artworkDepthColor;

  const size = frame?.size ?? artwork.size;

  const previewDimensions = CanvasUtils.objectContain(wrapperDimensions, size);
  const previewUnitSize = previewDimensions.width / size.width;

  let artworkStyle: Record<string, number> = {
    '--width': artwork.size.width * previewUnitSize,
    '--height': artwork.size.height * previewUnitSize,
  };

  let windowPoints: Position[] = [];

  let windowRightLength = 0;
  let windowRightAngle = 0;
  let windowBottomLength = 0;
  let windowBottomAngle = 0;

  if (frame?.window) {
    /**
     * Gets an array of the visible points of the window.
     *
     *  +---------(0)
     *  |          |
     *  |          |
     *  |          |
     * (2)--------(1)
     */
    windowPoints = GeometryUtils.sortConvexQuadrilateralPoints(frame.window).map(point => ({
      x: point.x * previewUnitSize,
      y: point.y * previewUnitSize,
    }));

    // Gets the length and angle of the window's bottom side (line 2->1)
    windowBottomLength = GeometryUtils.getLineLength(windowPoints[2], windowPoints[1]);
    windowBottomAngle = GeometryUtils.getLineAngle(windowPoints[2], windowPoints[1]);
    // Gets the length and angle of the window's right side (line 0->1)
    windowRightLength = GeometryUtils.getLineLength(windowPoints[0], windowPoints[1]);
    windowRightAngle = GeometryUtils.getLineAngle(windowPoints[0], windowPoints[1]);

    if (framingOptions?.isScaled) {
      const windowMinX = Math.min(...windowPoints.map(point => point.x));
      const windowMinY = Math.min(...windowPoints.map(point => point.y));
      const windowMaxX = Math.max(...windowPoints.map(point => point.x));
      const windowMaxY = Math.max(...windowPoints.map(point => point.y));

      const windowDimensions = { width: windowMaxX - windowMinX, height: windowMaxY - windowMinY };
      const scaledDimensions = CanvasUtils.objectContain(windowDimensions, artwork.size);

      artworkStyle = {
        '--x': windowMinX + (windowDimensions.width - scaledDimensions.width) / 2,
        '--y': windowMinY + (windowDimensions.height - scaledDimensions.height) / 2,
        '--scale': framingOptions.scaling,
        '--width': scaledDimensions.width,
        '--height': scaledDimensions.height,
      };
    }
  }

  let angle = 0;
  let scale = 1;
  if (rotated) {
    angle = 30;
    scale = 0.8;
  }

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div
        className={styles.preview}
        style={{
          '--width': previewDimensions.width,
          '--height': previewDimensions.height,
          '--depth': size.depth * previewUnitSize,
          '--scale': scale,
          '--angle': angle,
          ...(depthColor && {
            '--color': depthColor,
            '--color-shade': darken(0.1, depthColor),
          }),
        }}>
        {/* Artwork preview */}
        <div
          className={cx(
            styles.previewFront,
            frame && [
              styles.previewFrontArtwork,
              styles[`matting--${framingOptions?.matting}`],
              framingOptions?.matting === 'light' && 'theme--paper',
              framingOptions?.matting === 'dark' && 'theme--ink',
              framingOptions?.isScaled && styles.scaled,
            ],
          )}
          style={artworkStyle}>
          <img src={artwork.src} alt={artwork.alt} />
        </div>

        {/* Frame preview */}
        {frame && (
          <Fragment>
            <div className={cx(styles.previewGlass, rotated && styles.previewGlassShine)} />
            <div className={styles.previewFront}>
              <img src={frame.src} alt={frame.alt} />
            </div>
          </Fragment>
        )}

        <div className={styles.previewTop} />

        <div className={styles.previewLeft} />

        {frame && (
          <Fragment>
            <div
              className={styles.previewWindowBottom}
              style={{
                '--x': windowPoints[2].x,
                '--y': windowPoints[2].y,
                '--length': windowBottomLength,
                '--angle': windowBottomAngle - 90,
              }}
            />

            <div
              className={styles.previewWindowRight}
              style={{
                '--x': windowPoints[2].x,
                '--y': windowPoints[2].y,
                '--length': windowRightLength,
                '--angle': windowRightAngle + 90,
              }}
            />
          </Fragment>
        )}
      </div>
    </div>
  );
};
