import { Fragment, useEffect, useState } from 'react';
import { Matting } from '@prisma/client';
import cx from 'classnames';
import { darken, rgb } from 'polished';
import { ObjectPreview3D, ObjectPreview3dProps } from '@src/components/Preview3D/ObjectPreview3D';
import { ArtworkDto } from '@src/data/serializers/artwork.serializer';
import { FrameDto } from '@src/data/serializers/frame.serializer';
import { SelectionEditorPath } from '@src/features/selection';
import { Dimensions3D } from '@src/types';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { CommonUtils } from '@src/utils/CommonUtils';
import { GeometryUtils } from '@src/utils/GeometryUtils';
import { convertUnit } from '@src/utils/convertUnit';
import styles from './artworkPreview3d.module.scss';

export interface ArtworkPreview3DProps {
  rotated: boolean;
  artwork: Pick<ArtworkDto, 'src' | 'alt' | 'size' | 'unit'>;
  frame?: Pick<FrameDto, 'src' | 'alt' | 'size' | 'window'>;
  framingOptions?: {
    isScaled: boolean;
    scaling: number;
    matting: Matting;
  };
}

export const ArtworkPreview3D = ({
  artwork,
  frame,
  rotated,
  framingOptions,
}: ArtworkPreview3DProps) => {
  const unitSize = convertUnit(1, artwork.unit, 'px');

  const originalSize = frame?.size ?? artwork.size;
  const size: Dimensions3D = {
    width: originalSize.width * unitSize,
    height: originalSize.height * unitSize,
    depth: originalSize.depth * unitSize,
  };

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

  let inner: ObjectPreview3dProps['inner'] = undefined;
  if (frame) {
    inner = {
      points: frame.window.map(({ x, y }) => ({
        x: x * unitSize,
        y: y * unitSize,
      })) as SelectionEditorPath,
      bottom: <div className={styles.side} style={{ '--color': depthColor ?? '' }} />,
      right: (
        <div
          className={styles.side}
          style={{ '--color': depthColor ? darken(0.1, depthColor) : '' }}
        />
      ),
    };
  }

  return (
    <ObjectPreview3D
      size={size}
      rotated={rotated}
      front={previewUnitSize => {
        let artworkStyle: Record<string, number> = {
          '--width': artwork.size.width * unitSize * previewUnitSize,
          '--height': artwork.size.height * unitSize * previewUnitSize,
        };

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
          const windowPoints = GeometryUtils.sortConvexQuadrilateralPoints(frame.window).map(
            point => ({
              x: point.x * frame.size.width * unitSize * previewUnitSize,
              y: point.y * frame.size.height * unitSize * previewUnitSize,
            }),
          );

          if (framingOptions?.isScaled) {
            const windowMinX = Math.min(...windowPoints.map(point => point.x));
            const windowMinY = Math.min(...windowPoints.map(point => point.y));
            const windowMaxX = Math.max(...windowPoints.map(point => point.x));
            const windowMaxY = Math.max(...windowPoints.map(point => point.y));

            const windowDimensions = {
              width: windowMaxX - windowMinX,
              height: windowMaxY - windowMinY,
            };
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

        return (
          <Fragment>
            <div
              className={cx(
                styles.front,
                frame && [
                  styles.frontArtwork,
                  styles[`matting--${framingOptions?.matting}`],
                  framingOptions?.matting === 'light' && 'theme--paper',
                  framingOptions?.matting === 'dark' && 'theme--ink',
                  framingOptions?.isScaled && styles.scaled,
                ],
              )}
              style={artworkStyle}>
              <img src={artwork.src} alt={artwork.alt} />
            </div>

            {frame && (
              <Fragment>
                <div className={cx(styles.glass, rotated && styles.glassShine)} />
                <div className={styles.front}>
                  <img src={frame.src} alt={frame.alt} />
                </div>
              </Fragment>
            )}
          </Fragment>
        );
      }}
      top={<div className={styles.side} style={{ '--color': depthColor ?? '' }} />}
      left={
        <div
          className={styles.side}
          style={{ '--color': depthColor ? darken(0.1, depthColor) : '' }}
        />
      }
      inner={inner}
    />
  );
};
