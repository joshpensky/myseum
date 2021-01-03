import tw, { css } from 'twin.macro';
import { useAddArtworkContext } from './AddArtworkContext';
import { AddArtworkStep, Measurement, Preset } from './types';
import { useEffect, useRef, useState } from 'react';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { Dimensions } from '@src/types';

const presets: Preset[] = [
  {
    type: 'a4',
    display: 'A4',
    dimensions: {
      width: 210,
      height: 297,
    },
    measurement: 'mm',
  },
  {
    type: 'poster',
    display: 'Poster',
    dimensions: {
      width: 11,
      height: 17,
    },
    measurement: 'inch',
  },
];

const cmToInch = (cm: number) => cm / 2.54;
const mmToInch = (mm: number) => cmToInch(mm / 10);

const MeasurePreview = () => {
  const { actualDimensions, measurement } = useAddArtworkContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const heightLabelRef = useRef<HTMLParagraphElement>(null);
  const widthLabelRef = useRef<HTMLParagraphElement>(null);

  const [innerRect, setInnerRect] = useState({ width: 0, height: 0, x: 0, y: 0 });

  const onResize = () => {
    if (containerRef.current && heightLabelRef.current && widthLabelRef.current) {
      const xOffset = heightLabelRef.current.clientWidth;
      const yOffset = widthLabelRef.current.clientHeight;

      const maxWidth = containerRef.current.clientWidth;
      const maxHeight = containerRef.current.clientHeight;

      const canvasDimensions = {
        width: maxWidth - xOffset,
        height: maxHeight - yOffset,
      };

      // Convert the object dimensions to inches
      let objectDimensions: Dimensions;
      if (measurement === 'inch') {
        objectDimensions = {
          width: actualDimensions.width,
          height: actualDimensions.height,
        };
      } else if (measurement === 'cm') {
        objectDimensions = {
          width: cmToInch(actualDimensions.width),
          height: cmToInch(actualDimensions.height),
        };
      } else if (measurement === 'mm') {
        objectDimensions = {
          width: mmToInch(actualDimensions.width),
          height: mmToInch(actualDimensions.height),
        };
      } else {
        throw new Error('Invalid measurement!');
      }

      // Convert object dimension inches to pixels
      const pixelsPerInch = 16; // 16 ppi
      objectDimensions.width *= pixelsPerInch;
      objectDimensions.height *= pixelsPerInch;

      // Scale the object dimensions to fit within the max width/height
      const innerRect = CanvasUtils.objectScaleDown(canvasDimensions, objectDimensions);

      const startX = maxWidth / 2;
      const endX = xOffset;
      // From 0->1, what percentage is the inner rect width taking up of the available width?
      const percFilledX = 1 - innerRect.width / canvasDimensions.width;
      // Calculate X so that it falls in the range [startX, endX] based on the percFilledX
      innerRect.x = endX + (startX - endX) * percFilledX;

      const startY = maxHeight / 2;
      const endY = yOffset;
      // From 0->1, what percentage is the inner rect height taking up of the available height?
      const percFilledY = 1 - innerRect.height / canvasDimensions.height;
      // Calculate Y so that it falls in the range [startY, endY] based on the percFilledY
      innerRect.y = endY + (startY - endY) * percFilledY;

      setInnerRect(innerRect);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver(onResize);
      observer.observe(containerRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, [actualDimensions, measurement]);

  const measurementShorthand = {
    inch: 'in',
    cm: 'cm',
    mm: 'mm',
  }[measurement];

  return (
    <div
      css={[
        tw`flex flex-col size-full relative`,
        (innerRect.width === 0 || innerRect.height === 0) && tw`opacity-0`,
      ]}>
      <p
        ref={widthLabelRef}
        css={[
          tw`absolute top-0 left-0 pb-2`,
          css`
            transform: translate(${innerRect.x + innerRect.width / 2}px, ${innerRect.y}px)
              translate(-50%, -100%);
          `,
        ]}>
        {actualDimensions.width} {measurementShorthand}
      </p>
      <div css={tw`flex flex-1 items-center relative`}>
        <p
          ref={heightLabelRef}
          css={[
            tw`absolute top-0 left-0 pr-3`,
            css`
              transform: translate(${innerRect.x}px, ${innerRect.y + innerRect.height / 2}px)
                translate(-100%, -50%);
            `,
          ]}>
          {actualDimensions.height} {measurementShorthand}
        </p>
        <div ref={containerRef} css={tw`flex relative size-full`}>
          <div
            css={[
              tw`absolute top-0 left-0 border border-white`,
              css`
                transform: translate(${innerRect.x}px, ${innerRect.y}px);
                width: ${innerRect.width}px;
                height: ${innerRect.height}px;
              `,
            ]}
          />
        </div>
      </div>
    </div>
  );
};

const MeasureArtwork: AddArtworkStep = {
  Main: function MeasureArtworkMain() {
    const { image } = useAddArtworkContext();

    return (
      <div css={tw`flex flex-col flex-1 size-full`}>
        {image && <img css={tw`size-full object-contain`} src={image.src} alt="" />}
      </div>
    );
  },
  Rail: function MeasureArtworkRail() {
    const {
      actualDimensions,
      measurement,
      setActualDimensions,
      setMeasurement,
    } = useAddArtworkContext();

    const [presetType, setPresetType] = useState<Preset['type']>('custom');

    // handler for preset updates
    const onPresetUpdate = (presetType: Preset['type']) => {
      if (presetType !== 'custom') {
        const preset = presets.find(preset => preset.type === presetType);
        if (preset) {
          setPresetType(preset.type);
          setActualDimensions(preset.dimensions);
          setMeasurement(preset.measurement);
          return;
        }
      }
      setPresetType('custom');
    };

    return (
      <div css={tw`flex flex-col flex-1`}>
        <p>Enter the physical dimensions of the artwork.</p>

        <div css={tw`flex flex-col mt-6`}>
          <div css={tw`flex`}>
            <label htmlFor="preset">Preset</label>
            <select
              id="preset"
              css={tw`bg-black hocus:(outline-none bg-white bg-opacity-10)`}
              value={presetType}
              onChange={evt => onPresetUpdate(evt.target.value as Preset['type'])}>
              <option value="custom">Custom</option>
              {presets.map(preset => (
                <option key={preset.type} value={preset.type}>
                  {preset.display}
                </option>
              ))}
            </select>
          </div>
          <div css={tw`flex pt-4`}>
            <div css={tw`flex flex-col mr-4`}>
              <label htmlFor="width">Width</label>
              <input
                id="width"
                css={tw`bg-black hocus:(outline-none bg-white bg-opacity-10)`}
                type="number"
                min="1"
                step="1"
                value={actualDimensions.width}
                onChange={evt => {
                  let width = evt.target.valueAsNumber;
                  if (Number.isNaN(width)) {
                    width = 0;
                  }
                  setPresetType('custom');
                  setActualDimensions(dimensions => ({
                    ...dimensions,
                    width,
                  }));
                }}
              />
            </div>
            <div css={tw`flex flex-col mr-4`}>
              <label htmlFor="height">Height</label>
              <input
                id="height"
                css={tw`bg-black hocus:(outline-none bg-white bg-opacity-10)`}
                type="number"
                min="1"
                step="1"
                value={actualDimensions.height}
                onChange={evt => {
                  let height = evt.target.valueAsNumber;
                  if (Number.isNaN(height)) {
                    height = 0;
                  }
                  setPresetType('custom');
                  setActualDimensions(dimensions => ({
                    ...dimensions,
                    height,
                  }));
                }}
              />
            </div>
            <div css={tw`flex flex-col`}>
              <label htmlFor="measurement">Measurement</label>
              <select
                id="measurement"
                css={tw`bg-black hocus:(outline-none bg-white bg-opacity-10)`}
                value={measurement}
                onChange={evt => {
                  setPresetType('custom');
                  setMeasurement(evt.target.value as Measurement);
                }}>
                <option value="inch">inches</option>
                <option value="cm">centimeters</option>
                <option value="mm">millimeters</option>
              </select>
            </div>
          </div>
        </div>

        <div css={tw`flex flex-col flex-1 justify-end mt-6`}>
          <p css={tw`text-sm mb-2`}>Preview</p>
          <div css={tw`w-full h-72 bg-white bg-opacity-10 rounded-md p-4`}>
            <MeasurePreview />
          </div>
        </div>
      </div>
    );
  },
};

export default MeasureArtwork;
