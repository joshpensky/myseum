import ImageSelectionPreview from '@src/components/ImageSelectionPreview';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { darken } from 'polished';
import { useLayoutEffect, useRef, useState } from 'react';
import tw, { css, theme } from 'twin.macro';
import { useAddFrameContext } from './AddFrameContext';

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

  const unitSize = 72; // 72ppi

  const previewDimensions = CanvasUtils.objectScaleDown(wrapperDimensions, {
    width: actualDimensions.width * unitSize,
    height: actualDimensions.height * unitSize,
  });

  // https://css-tricks.com/css-in-3d-learning-to-think-in-cubes-instead-of-boxes/

  return (
    <div ref={wrapperRef} css={[tw`max-w-3xl max-h-3xl relative size-full`]}>
      <div
        css={css`
          --depth: ${Math.max(depth, 0) * unitSize};
          --width: ${previewDimensions.width};
          --height: ${previewDimensions.height};
          --rotate: ${rotate ? 30 : 0};
          --color: ${theme`colors.blue.500`};
          --color-shade: ${darken(0.1, theme`colors.blue.500`)};
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
        {/* <div
              id-"back"
              css={css`
                ${depth <= 0 && tw`invisible`}
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: darkgreen;
                transform-style: preserve-3d;
                transform: translate3d(0, 0, calc(-1px * var(--depth, 0)));
              `}
            /> */}
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
            <ImageSelectionPreview
              editor={editor}
              actualDimensions={actualDimensions}
              image={image}
            />
          )}
        </div>
        {/* TODO: add inner left/bottom for window */}
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

        <div
          id="bottom"
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
              translate3d(0, calc(var(--depth, 0) * 0.5px), calc(var(--height, 0) * -0.5px));
          `}
        />
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
        <div
          id="right-side"
          css={css`
            position: absolute;
            top: 50%;
            left: 50%;
            width: calc(var(--depth, 0) * 1px);
            height: 100%;
            background-color: var(--color-shade);
            transform-style: preserve-3d;
            transform: translate(-50%, -50%) rotateX(0) rotateY(90deg)
              translate3d(calc(var(--depth, 0) * 0.5px), 0, calc(var(--width, 0) * 0.5px));
          `}
        />
      </div>
    </div>
  );
};

export default FramePreview;
