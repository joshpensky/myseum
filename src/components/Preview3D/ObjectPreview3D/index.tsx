import { Fragment, ReactNode, useRef, useState } from 'react';
import { SelectionEditorPath } from '@src/features/selection';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';
import { Dimensions, Dimensions3D, Position } from '@src/types';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { GeometryUtils } from '@src/utils/GeometryUtils';
import styles from './objectPreview3d.module.scss';

export interface ObjectPreview3dProps {
  size: Dimensions3D;
  rotated: boolean;
  front: ReactNode | ((previewUnitSize: number) => ReactNode);
  top: ReactNode;
  left: ReactNode;
  inner?: {
    points: SelectionEditorPath;
    bottom: ReactNode;
    right: ReactNode;
  };
}

export const ObjectPreview3D = ({
  rotated,
  size,
  front,
  top,
  left,
  inner,
}: ObjectPreview3dProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  // Track wrapper dimensions on resize
  useIsomorphicLayoutEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver(entries => {
        const [container] = entries;
        setContainerDimensions({
          height: container.contentRect.height,
          width: container.contentRect.width,
        });
      });
      observer.observe(containerRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  const previewDimensions = CanvasUtils.objectScaleDown(containerDimensions, size);
  const previewUnitSize = previewDimensions.width / size.width;

  let windowPoints: Position[] = [];

  let windowRightLength = 0;
  let windowRightAngle = 0;
  let windowBottomLength = 0;
  let windowBottomAngle = 0;

  if (inner) {
    /**
     * Gets an array of the visible points of the window.
     *
     *  +---------(0)
     *  |          |
     *  |          |
     *  |          |
     * (2)--------(1)
     */
    windowPoints = GeometryUtils.sortConvexQuadrilateralPoints(inner.points).map(point => ({
      x: point.x * previewUnitSize,
      y: point.y * previewUnitSize,
    }));

    // Gets the length and angle of the window's bottom side (line 2->1)
    windowBottomLength = GeometryUtils.getLineLength(windowPoints[2], windowPoints[1]);
    windowBottomAngle = GeometryUtils.getLineAngle(windowPoints[2], windowPoints[1]);
    // Gets the length and angle of the window's right side (line 0->1)
    windowRightLength = GeometryUtils.getLineLength(windowPoints[0], windowPoints[1]);
    windowRightAngle = GeometryUtils.getLineAngle(windowPoints[0], windowPoints[1]);
  }

  let angle = 0;
  let scale = 1;
  if (rotated) {
    angle = 30;
    scale = 0.8;
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <div
        className={styles.wrapper}
        style={{
          '--width': previewDimensions.width,
          '--height': previewDimensions.height,
          '--depth': size.depth * previewUnitSize,
          '--scale': scale,
          '--angle': angle,
        }}>
        <div className={styles.front}>
          {typeof front === 'function' ? front(previewUnitSize) : front}
        </div>

        <div className={styles.top}>{top}</div>

        <div className={styles.left}>{left}</div>

        {inner && (
          <Fragment>
            <div
              className={styles.innerBottom}
              style={{
                '--x': windowPoints[2].x,
                '--y': windowPoints[2].y,
                '--length': windowBottomLength,
                '--angle': windowBottomAngle - 90,
              }}>
              {inner.bottom}
            </div>

            <div
              className={styles.innerRight}
              style={{
                '--x': windowPoints[2].x,
                '--y': windowPoints[2].y,
                '--length': windowRightLength,
                '--angle': windowRightAngle + 90,
              }}>
              {inner.right}
            </div>
          </Fragment>
        )}
      </div>
    </div>
  );
};
