import ImageSelectionPreview from '@src/components/ImageSelectionPreview';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { GeometryUtils } from '@src/utils/GeometryUtils';
import { darken, rgb } from 'polished';
import { useEffect, useRef, useState } from 'react';
import tw, { css, theme } from 'twin.macro';
import { useAddFrameContext } from './AddFrameContext';
import PerspT from 'perspective-transform';
import type { Matrix } from 'glfx-es6';
import { Position } from '@src/types';
import { CommonUtils } from '@src/utils/CommonUtils';
import { Convert } from '@src/utils/Convert';
import { DEFAULT_POINTS } from '@src/hooks/useSelectionEditor';
import useIsomorphicLayoutEffect from '@src/hooks/useIsomorphicLayoutEffect';

type FramePreviewProps = {
  rotate?: boolean;
};

// https://css-tricks.com/css-in-3d-learning-to-think-in-cubes-instead-of-boxes/

const FramePreview = ({ rotate }: FramePreviewProps) => {
  const { actualDimensions, depth, editor, image, measurement } = useAddFrameContext();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [wrapperDimensions, setWrapperDimensions] = useState({ width: 0, height: 0 });

  const [lightMode, setLightMode] = useState<boolean>();
  const [depthRgb, setDepthRgb] = useState({ r: 255, g: 255, b: 255 });
  const depthColor = rgb(depthRgb.r, depthRgb.g, depthRgb.b);

  // Generates the depth RGB color based on the given canvas
  const getDepthRgb = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (ctx && canvas.height) {
      const depthRgb = CanvasUtils.getAverageColor(
        ctx,
        { x: 0, y: 0 },
        { width: 5, height: canvas.height },
      );
      setDepthRgb(depthRgb);
    }
  };

  // Checks if the layers in the editor has been changed at all
  const isFreshEditor =
    editor.layers.length === 1 &&
    editor.layers[0].points.every(
      (point, index) => point.x === DEFAULT_POINTS[index].x && point.y === DEFAULT_POINTS[index].y,
    );

  // If using fresh editor, calculates the depth color when using vanilla image
  useEffect(() => {
    if (isFreshEditor && image) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imgDimensions = CommonUtils.getImageDimensions(image);
        canvas.width = 5;
        canvas.height = imgDimensions.height;
        ctx.drawImage(image, 0, 0, 5, imgDimensions.height);
        getDepthRgb(canvas);
      }
    }
  }, [isFreshEditor, image]);

  // _DEV_
  // Fix light mode animation on fast refresh
  useEffect(
    () => () => {
      setLightMode(mode => mode || undefined);
    },
    [],
  );

  // Toggles light mode when the `L` key is pressed
  useEffect(() => {
    const toggleLightMode = (evt: KeyboardEvent) => {
      const isTypingInput = (
        el: Element,
      ): el is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement =>
        new Set(['INPUT', 'TEXTAREA', 'SELECT']).has(el.tagName);

      // Checks that the user isn't currently typing in an input
      const focusedEl = document.activeElement;
      const isUserTyping = focusedEl && isTypingInput(focusedEl) && focusedEl.type !== 'number';

      if (evt.key === 'l' && !isUserTyping) {
        evt.preventDefault();
        evt.stopPropagation();
        setLightMode(mode => !mode);
      }
    };

    window.addEventListener('keydown', toggleLightMode, true);
    return () => {
      window.removeEventListener('keydown', toggleLightMode, true);
    };
  }, []);

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

  const unitSize = Convert.from(1, measurement).to('px').value;
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

  const imageDimensions = image && CommonUtils.getImageDimensions(image);

  return (
    <div
      css={[
        tw`px-6 py-5 flex flex-col items-center justify-center size-full overflow-hidden`,
        [tw`transition-colors duration-200`, lightMode && tw`bg-white`],
      ]}>
      <button
        css={[
          lightMode ? tw`border-black ring-black` : tw`border-white ring-white`,
          tw`absolute bottom-5 left-6 size-6 rounded-full overflow-hidden border-2`,
          tw`ring-0 outline-none focus:(outline-none ring-opacity-50 ring)`,
          css`
            transition: border-color ${theme`transitionTimingFunction.DEFAULT`} 200ms,
              box-shadow ${theme`transitionTimingFunction.DEFAULT`} 200ms,
              transform cubic-bezier(0.85, 0, 0.15, 1) 300ms;
          `,
          // Don't animate when lightMode is undefined
          lightMode !== undefined &&
            css`
              ${lightMode ? 'transform: rotate(180deg)' : 'animation: finish-rotation 300ms 1'};
              @keyframes finish-rotation {
                0% {
                  transform: rotate(180deg);
                }
                100% {
                  transform: rotate(360deg); // Will auto-set to 0deg after animation is complete
                }
              }
            `,
        ]}
        type="button"
        aria-pressed={!!lightMode}
        title="Toggle preview light mode"
        onClick={() => setLightMode(!lightMode)}>
        <span css={tw`sr-only`}>Toggle preview light mode</span>
        <span css={tw`absolute top-0 left-0 w-1/2 h-full bg-black`} />
        <span css={tw`absolute top-0 left-1/2 w-1/2 h-full bg-white`} />
      </button>

      <div ref={wrapperRef} css={[tw`max-w-3xl max-h-3xl relative size-full`]}>
        <div
          css={css`
            --width: ${previewDimensions.width};
            --height: ${previewDimensions.height};
            --depth: ${depth * previewUnitSize};
            --angle: ${rotate ? 30 : 0};
            --color: ${depthColor};
            --color-shade: ${darken(0.1, depthColor)};

            position: absolute;
            top: 50%;
            left: 50%;
            width: calc(var(--width, 0) * 1px);
            height: calc(var(--height, 0) * 1px);
            transition: transform 300ms ease;
            // In order: centers the frame on X/Y, rotates frame on 30deg axis (isometrics), then centers the frame on Z axis with changing depth
            transform: translate(-50%, -50%) rotateX(calc(var(--angle, 0) * -1deg))
              rotateY(calc(var(--angle, 0) * 1deg)) translate3d(0, 0, calc(0.5px * var(--depth, 0)));

            &,
            > * {
              transform-style: preserve-3d;
            }
          `}>
          {/* Draws the front face of the frame, a.k.a the preview */}
          <div
            id="front-face"
            css={css`
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            `}>
            {image && imageDimensions && (
              <div
                css={css`
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: ${imageDimensions.width}px;
                  height: ${imageDimensions.height}px;
                  transform-origin: top left;
                  // Prevent canvas re-renders on dimension change by using transform scale instead (utilizes GPU)
                  transform: scaleX(${previewDimensions.width / imageDimensions.width})
                    scaleY(${previewDimensions.height / imageDimensions.height});
                `}>
                {/* Improve performance by rendering only image if using a fresh editor (no changes) */}
                {isFreshEditor ? (
                  <img css={tw`absolute inset-0 size-full object-cover`} src={image.src} alt="" />
                ) : (
                  <ImageSelectionPreview
                    editor={editor}
                    actualDimensions={imageDimensions}
                    image={image}
                    onRender={getDepthRgb}
                  />
                )}
              </div>
            )}
          </div>

          {/* Draws the top face of the outer frame */}
          <div
            id="top-face"
            css={css`
              background-color: var(--color);
              position: absolute;
              top: 50%;
              left: 50%;
              height: calc(var(--depth, 0) * 1px);
              width: 100%;
              transform-origin: center center;
              transform: translate(-50%, -50%) rotateX(-90deg) rotateY(180deg)
                translate3d(0, calc(var(--depth, 0) * 0.5px), calc(var(--height, 0) * 0.5px));
            `}
          />

          {/* Draws the left face of the outer frame */}
          <div
            id="left-face"
            css={css`
              background-color: var(--color-shade);
              position: absolute;
              top: 50%;
              left: 50%;
              width: calc(var(--depth, 0) * 1px);
              height: 100%;
              transform-origin: center center;
              transform: translate(-50%, -50%) rotateX(0) rotateY(90deg)
                translate3d(calc(var(--depth, 0) * 0.5px), 0, calc(var(--width, 0) * -0.5px));
            `}
          />

          {/* Draws the bottom face of the inner window */}
          {windowBottomLength > 0 && (
            <div
              id="window-bottom-face"
              css={css`
                background-color: var(--color);
                position: absolute;
                top: ${windowPoints[2].y}px;
                left: ${windowPoints[2].x}px;
                height: ${windowBottomLength}px;
                width: calc(var(--depth, 0) * 1px);
                transform-origin: top left;
                transform: rotateZ(${windowBottomAngle - 90}deg) rotateY(90deg);
              `}
            />
          )}

          {/* Draws the right face of the inner window */}
          {windowRightLength > 0 && (
            <div
              id="window-right-face"
              css={css`
                background-color: var(--color-shade);
                position: absolute;
                top: ${windowPoints[0].y}px;
                left: ${windowPoints[0].x}px;
                height: ${windowRightLength}px;
                width: calc(var(--depth, 0) * 1px);
                transform-origin: top left;
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
