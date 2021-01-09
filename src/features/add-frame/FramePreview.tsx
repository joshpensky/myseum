import ImageSelectionPreview from '@src/components/ImageSelectionPreview';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { GeometryUtils } from '@src/utils/GeometryUtils';
import { darken, rgb } from 'polished';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import tw, { css, theme } from 'twin.macro';
import { useAddFrameContext } from './AddFrameContext';
import PerspT from 'perspective-transform';
import type { Matrix } from 'glfx-es6';
import { Position } from '@src/types';

type FramePreviewProps = {
  rotate?: boolean;
};

const FramePreview = ({ rotate }: FramePreviewProps) => {
  const { actualDimensions, depth, editor, image } = useAddFrameContext();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [wrapperDimensions, setWrapperDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
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

  const [depthRgb, setDepthRgb] = useState({ r: 255, g: 255, b: 255 });

  const onPreviewRender = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (ctx && canvas.height) {
      let colorData: ImageData;
      try {
        colorData = ctx.getImageData(0, 0, 5, canvas.height);
      } catch {
        return;
      }
      const rgb = { r: 0, g: 0, b: 0 };
      const blockSize = 5; // only visit every 5 pixels
      let count = 0;
      const length = colorData.data.length;
      let i = -4;
      while ((i += blockSize * 4) < length) {
        ++count;
        rgb.r += colorData.data[i];
        rgb.g += colorData.data[i + 1];
        rgb.b += colorData.data[i + 2];
      }
      rgb.r = Math.floor(rgb.r / count);
      rgb.g = Math.floor(rgb.g / count);
      rgb.b = Math.floor(rgb.b / count);
      setDepthRgb(rgb);
    }
  };

  const unitSize = 72; // 72ppi

  const previewDimensions = CanvasUtils.objectScaleDown(wrapperDimensions, {
    width: actualDimensions.width * unitSize,
    height: actualDimensions.height * unitSize,
  });

  let windowPoints: Position[] = [];
  let rightInnerLength = 0;
  let rightInnerAngle = 0;
  let bottomInnerLength = 0;
  let bottomInnerAngle = 0;
  if (editor.layers.length > 1) {
    const srcPoints = GeometryUtils.sortConvexQuadrilateralPoints(editor.layers[0].points);
    const canvasSrcMatrix = srcPoints.flatMap(c => [
      c.x * previewDimensions.width,
      c.y * previewDimensions.height,
    ]) as Matrix;
    const canvasDestMatrix = [
      ...[0, 0],
      ...[previewDimensions.width, 0],
      ...[previewDimensions.width, previewDimensions.height],
      ...[0, previewDimensions.height],
    ] as Matrix;
    const perspective = PerspT(canvasSrcMatrix, canvasDestMatrix);

    /**
     * Gets the points of the window.
     *
     *  +---------(0)
     *  |          |
     *  |          |
     *  |          |
     * (2)--------(1)
     */
    windowPoints = GeometryUtils.sortConvexQuadrilateralPoints(editor.layers[1].points)
      .slice(1, 4)
      .map(point => {
        const [x, y] = perspective.transform(
          point.x * previewDimensions.width,
          point.y * previewDimensions.height,
        );
        return { x, y };
      });

    rightInnerLength = GeometryUtils.getLineLength(windowPoints[0], windowPoints[1]);
    rightInnerAngle = GeometryUtils.getLineAngle(windowPoints[0], windowPoints[1]);

    bottomInnerLength = GeometryUtils.getLineLength(windowPoints[2], windowPoints[1]);
    bottomInnerAngle = GeometryUtils.getLineAngle(windowPoints[2], windowPoints[1]);
  }

  // https://css-tricks.com/css-in-3d-learning-to-think-in-cubes-instead-of-boxes/

  // TODO: prevent black (or maybe just add a light shadow behind?)
  const depthColor = rgb(depthRgb.r, depthRgb.g, depthRgb.b);

  return (
    <div ref={wrapperRef} css={[tw`max-w-3xl max-h-3xl relative size-full`]}>
      <div
        css={css`
          --depth: ${Math.max(depth, 0) * unitSize};
          --width: ${previewDimensions.width};
          --height: ${previewDimensions.height};
          --rotate: ${rotate ? 30 : 0};
          --color: ${depthColor};
          --color-shade: ${darken(0.1, depthColor)};

          width: calc(var(--width, 0) * 1px);
          height: calc(var(--height, 0) * 1px);
          position: absolute;
          left: 50%;
          top: 50%;
          transform-style: preserve-3d;
          transition: transform 300ms;
          transform: translate(-50%, -50%) rotateX(calc(-1deg * var(--rotate, 0)))
            rotateY(calc(1deg * var(--rotate, 0))) translate3d(0, 0, calc(0.5px * var(--depth, 0)));
        `}>
        <div
          id="front"
          css={css`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            /* background-color: var(--color); */
          `}>
          {image && (
            <ImageSelectionPreview
              editor={editor}
              actualDimensions={actualDimensions}
              image={image}
              onRender={onPreviewRender}
            />
          )}
        </div>

        <div
          id="top"
          css={css`
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            height: calc(var(--depth, 0) * 1px);
            background-color: var(--color);
            transform-style: preserve-3d;
            transform-origin: 50% 50%;
            transform: translate(-50%, -50%) rotateX(-90deg) rotateY(180deg)
              translate3d(0, calc(var(--depth, 0) * 0.5px), calc(var(--height, 0) * 0.5px));
          `}
        />

        {bottomInnerLength && (
          <div
            id="bottom-inner"
            css={css`
              position: absolute;
              top: ${windowPoints[2].y}px;
              left: ${windowPoints[2].x}px;
              height: ${bottomInnerLength}px;
              width: calc(var(--depth, 0) * 1px);
              background-color: var(--color);
              transform-origin: top left;
              transform-style: preserve-3d;
              transform: rotateZ(${bottomInnerAngle - 90}deg) rotateY(90deg);
            `}
          />
        )}

        <div
          id="left-side"
          css={css`
            position: absolute;
            top: 50%;
            left: 50%;
            width: calc(var(--depth, 0) * 1px);
            height: 100%;
            background-color: var(--color-shade);
            transform-style: preserve-3d;
            transform: translate(-50%, -50%) rotateX(0) rotateY(90deg)
              translate3d(calc(var(--depth, 0) * 0.5px), 0, calc(var(--width, 0) * -0.5px));
          `}
        />

        {rightInnerLength && (
          <div
            id="right-inner"
            css={css`
              position: absolute;
              top: ${windowPoints[0].y}px;
              left: ${windowPoints[0].x}px;
              height: ${rightInnerLength}px;
              width: calc(var(--depth, 0) * 1px);
              background-color: var(--color-shade);
              transform-origin: top left;
              transform-style: preserve-3d;
              transform: rotateZ(${rightInnerAngle - 90}deg) rotateY(90deg);
            `}
          />
        )}
      </div>
    </div>
  );
};

export default FramePreview;
