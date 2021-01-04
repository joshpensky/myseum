import tw, { css } from 'twin.macro';
import { useAddArtworkContext } from './AddArtworkContext';
import { AddArtworkStep, Measurement, Preset } from './types';
import { useEffect, useRef, useState } from 'react';
import { CanvasUtils } from '@src/utils/CanvasUtils';
import { Dimensions } from '@src/types';
import Select from './Select';
import NumberInput from './NumberInput';
import Close from '@src/svgs/Close';

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

class MeasureUtils {
  static inchToCm(inch: number) {
    return inch * 2.54;
  }
  static inchToMm(inch: number) {
    return this.cmToMm(this.inchToCm(inch));
  }

  static cmToInch(cm: number) {
    return cm / 2.54;
  }
  static cmToMm(cm: number) {
    return cm * 10;
  }

  static mmToInch(mm: number) {
    return this.cmToInch(mm / 10);
  }
}

const MeasurePreview = () => {
  const { actualDimensions, measurement } = useAddArtworkContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const heightLabelRef = useRef<HTMLParagraphElement>(null);
  const widthLabelRef = useRef<HTMLParagraphElement>(null);

  const [innerRect, setInnerRect] = useState({
    x: -1,
    y: -1,
    width: 0,
    height: 0,
  });

  /**
   * Updates the calculations based on the resize.
   */
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
          width: MeasureUtils.cmToInch(actualDimensions.width),
          height: MeasureUtils.cmToInch(actualDimensions.height),
        };
      } else if (measurement === 'mm') {
        objectDimensions = {
          width: MeasureUtils.mmToInch(actualDimensions.width),
          height: MeasureUtils.mmToInch(actualDimensions.height),
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

  // The width/height of a single unit of measurement
  const unitSize = innerRect.width / actualDimensions.width;

  return (
    <div css={tw`flex flex-col size-full`}>
      <div
        css={[
          tw`flex flex-col size-full relative`,
          (innerRect.x < 0 || innerRect.y < 0) && tw`opacity-0`,
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
      <div css={tw`flex flex-shrink-0 items-center justify-end mt-4 opacity-70`}>
        <div css={[tw`border border-white`, css({ width: unitSize, height: unitSize })]} />
        <p css={tw`ml-2 text-sm`}>1 {measurementShorthand}</p>
      </div>
    </div>
  );
};

const MeasureArtwork: AddArtworkStep = {
  /**
   * Renders the Main view.
   */
  Main: function MeasureArtworkMain() {
    const { image } = useAddArtworkContext();
    return (
      <div css={tw`flex flex-col flex-1 size-full`}>
        {image && <img css={tw`size-full object-contain`} src={image.src} alt="" />}
      </div>
    );
  },
  /**
   * Renders the form rail.
   */
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
          <div css={tw`flex items-center`}>
            <label css={tw`text-sm text-gray-300 mr-2`} htmlFor="preset">
              Preset
            </label>
            <Select
              id="preset"
              value={presetType}
              onChange={value => onPresetUpdate(value as Preset['type'])}
              options={[
                { value: 'custom', display: 'Custom' },
                ...presets.map(preset => ({ value: preset.type, display: preset.display })),
              ]}
            />
          </div>
          <div css={tw`flex items-end -ml-2 pt-4`}>
            <div css={tw`flex flex-1 flex-col mr-4`}>
              <label css={tw`ml-2 mb-1 text-sm text-gray-300`} htmlFor="width">
                Width
              </label>
              <NumberInput
                id="width"
                min={1}
                step={1}
                value={actualDimensions.width}
                onChange={value => {
                  setPresetType('custom');
                  setActualDimensions(dimensions => ({
                    ...dimensions,
                    width: value,
                  }));
                }}
              />
            </div>
            <div css={tw`block flex-shrink-0 size-4 mb-2`}>
              <Close />
            </div>
            <div css={tw`flex flex-1 flex-col items-start mx-4`}>
              <label css={tw`ml-2 mb-1 text-sm text-gray-300`} htmlFor="height">
                Height
              </label>
              <NumberInput
                id="height"
                min={1}
                step={1}
                value={actualDimensions.height}
                onChange={value => {
                  setPresetType('custom');
                  setActualDimensions(dimensions => ({
                    ...dimensions,
                    height: value,
                  }));
                }}
              />
            </div>
            <div css={[tw`flex flex-1 flex-col`, css({ width: 1000 })]}>
              <label css={tw`ml-2 mb-1 text-sm text-gray-300`} htmlFor="measurement">
                Measurement
              </label>
              <Select
                id="measurement"
                value={measurement}
                onChange={value => {
                  setPresetType('custom');
                  setMeasurement(value as Measurement);
                }}
                options={[
                  {
                    value: 'inch',
                    display: 'inches',
                  },
                  {
                    value: 'cm',
                    display: 'centimeters',
                  },
                  {
                    value: 'mm',
                    display: 'millimeters',
                  },
                ]}
              />
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
