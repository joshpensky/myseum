import ImageSelectionPreview from '@src/components/ImageSelectionPreview';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { GeometryUtils } from '@src/utils/GeometryUtils';
import { darken, rgb } from 'polished';
import { useLayoutEffect, useRef, useState } from 'react';
import tw, { css } from 'twin.macro';
import { useAddFrameContext } from './AddFrameContext';
import PerspT from 'perspective-transform';
import type { Matrix } from 'glfx-es6';
import { Position } from '@src/types';

type FramePreviewProps = {
  rotate?: boolean;
};

// https://css-tricks.com/css-in-3d-learning-to-think-in-cubes-instead-of-boxes/

const FramePreview = ({ rotate }: FramePreviewProps) => {
  const { actualDimensions, depth, editor, image } = useAddFrameContext();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [wrapperDimensions, setWrapperDimensions] = useState({ width: 0, height: 0 });

  const [lightMode, setLightMode] = useState(false);
  const [depthRgb, setDepthRgb] = useState({ r: 255, g: 255, b: 255 });
  const depthColor = rgb(depthRgb.r, depthRgb.g, depthRgb.b);

  const onPreviewRender = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (ctx && canvas.height) {
      const colorData: ImageData[] = [];
      try {
        colorData.push(ctx.getImageData(0, 0, 5, canvas.height));
      } catch {
        return;
      }
      const rgb = { r: 0, g: 0, b: 0 };
      const blockSize = 5; // only visit every 5 pixels
      let count = 0;
      colorData.forEach(({ data }) => {
        const length = data.length;
        let i = -4;
        while ((i += blockSize * 4) < length) {
          ++count;
          rgb.r += data[i];
          rgb.g += data[i + 1];
          rgb.b += data[i + 2];
        }
      });
      rgb.r = Math.floor(rgb.r / count);
      rgb.g = Math.floor(rgb.g / count);
      rgb.b = Math.floor(rgb.b / count);
      setDepthRgb(rgb);
    }
  };

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

  const unitSize = 72; // 72ppi // TODO: change based on measurement
  const previewDimensions = CanvasUtils.objectScaleDown(wrapperDimensions, {
    width: actualDimensions.width * unitSize,
    height: actualDimensions.height * unitSize,
  });
  const previewUnitSize = previewDimensions.width / actualDimensions.width;

  let windowPoints: Position[] = [];
  let windowRightLength = 0;
  let windowRightAngle = 0;
  let windowBottomLength = 0;
  let windowBottomAngle = 0;
  if (editor.layers.length > 1) {
    const srcPoints = GeometryUtils.sortConvexQuadrilateralPoints(editor.layers[0].points);
    const previewSrcMatrix = srcPoints.flatMap(c => [
      c.x * previewDimensions.width,
      c.y * previewDimensions.height,
    ]) as Matrix;
    const previewDestMatrix = [
      ...[0, 0],
      ...[previewDimensions.width, 0],
      ...[previewDimensions.width, previewDimensions.height],
      ...[0, previewDimensions.height],
    ] as Matrix;
    const perspective = PerspT(previewSrcMatrix, previewDestMatrix);

    /**
     * Gets an array of the visible points of the window.
     *
     *  +---------(0)
     *  |          |
     *  |          |
     *  |          |
     * (2)--------(1)
     */
    windowPoints = GeometryUtils.sortConvexQuadrilateralPoints(editor.layers[1].points)
      .slice(1) // don't need top-left corner since no visible side uses it
      .map(point => {
        const [x, y] = perspective.transform(
          point.x * previewDimensions.width,
          point.y * previewDimensions.height,
        );
        return { x, y };
      });

    // Gets the length and angle of the window's bottom side (line 2->1)
    windowBottomLength = GeometryUtils.getLineLength(windowPoints[2], windowPoints[1]);
    windowBottomAngle = GeometryUtils.getLineAngle(windowPoints[2], windowPoints[1]);
    // Gets the length and angle of the window's right side (line 0->1)
    windowRightLength = GeometryUtils.getLineLength(windowPoints[0], windowPoints[1]);
    windowRightAngle = GeometryUtils.getLineAngle(windowPoints[0], windowPoints[1]);
  }

  return (
    <div
      css={[
        tw`px-6 py-5 flex flex-col items-center justify-center size-full overflow-hidden`,
        [tw`transition-colors`, lightMode && tw`bg-white`],
      ]}>
      <button
        css={[
          lightMode ? tw`bg-black border-white ring-black` : tw`bg-white border-black ring-white`,
          tw`absolute bottom-5 left-6 size-6 rounded-full transition-all border-2`,
          tw`ring-1 outline-none focus:(outline-none ring-opacity-50 ring)`,
        ]}
        type="button"
        aria-pressed={lightMode}
        title="Toggle preview light mode"
        onClick={() => setLightMode(!lightMode)}>
        <span css={tw`sr-only`}>Toggle preview light mode</span>
      </button>
      <div ref={wrapperRef} css={[tw`max-w-3xl max-h-3xl relative size-full`]}>
        <div
          css={css`
            --depth: ${Math.max(depth, 0) * previewUnitSize};
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
            transition: transform 300ms ease;
            transform: translate(-50%, -50%) rotateX(calc(-1deg * var(--rotate, 0)))
              rotateY(calc(1deg * var(--rotate, 0)))
              translate3d(0, 0, calc(0.5px * var(--depth, 0)));
          `}>
          {/* Draws the front face of the frame, a.k.a the preview */}
          <div
            id="front"
            css={css`
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              transform-style: preserve-3d;
            `}>
            {image && (
              <div
                css={css`
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: ${image.naturalWidth}px;
                  height: ${image.naturalHeight}px;
                  transform-origin: top left;
                  // Prevent canvas re-renders on dimension change by using transform scale (uses GPU)
                  transform: scaleX(${previewDimensions.width / image.naturalWidth})
                    scaleY(${previewDimensions.height / image.naturalHeight});
                `}>
                <ImageSelectionPreview
                  editor={editor}
                  actualDimensions={{ width: image.naturalWidth, height: image.naturalHeight }}
                  image={image}
                  onRender={onPreviewRender}
                />
              </div>
            )}
          </div>

          {/* Draws the top face of the outer frame */}
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
              transform-origin: center center;
              transform: translate(-50%, -50%) rotateX(-90deg) rotateY(180deg)
                translate3d(0, calc(var(--depth, 0) * 0.5px), calc(var(--height, 0) * 0.5px));
            `}
          />

          {/* Draws the left face of the outer frame */}
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
              transform-origin: center center;
              transform: translate(-50%, -50%) rotateX(0) rotateY(90deg)
                translate3d(calc(var(--depth, 0) * 0.5px), 0, calc(var(--width, 0) * -0.5px));
            `}
          />

          {/* Draws the bottom face of the inner window */}
          {windowBottomLength > 0 && (
            <div
              id="window-bottom-side"
              css={css`
                position: absolute;
                top: ${windowPoints[2].y}px;
                left: ${windowPoints[2].x}px;
                height: ${windowBottomLength}px;
                width: calc(var(--depth, 0) * 1px);
                background-color: var(--color);
                transform-origin: top left;
                transform-style: preserve-3d;
                transform: rotateZ(${windowBottomAngle - 90}deg) rotateY(90deg);
              `}
            />
          )}

          {/* Draws the right face of the inner window */}
          {windowRightLength > 0 && (
            <div
              id="window-right-side"
              css={css`
                position: absolute;
                top: ${windowPoints[0].y}px;
                left: ${windowPoints[0].x}px;
                height: ${windowRightLength}px;
                width: calc(var(--depth, 0) * 1px);
                background-color: var(--color-shade);
                transform-origin: top left;
                transform-style: preserve-3d;
                transform: rotateZ(${windowRightAngle - 90}deg) rotateY(90deg);
              `}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FramePreview;
