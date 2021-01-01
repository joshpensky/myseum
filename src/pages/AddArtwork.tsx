import { useEffect, useState } from 'react';
import tw from 'twin.macro';
import ImageSelectionEditor from '@src/components/ImageSelectionEditor';
import ImageSelectionPreview from '@src/components/ImageSelectionPreview';
import { useSelectionEditor } from '@src/hooks/useSelectionEditor';
import { Dimensions } from '@src/types';

type Measurement = 'inch' | 'cm' | 'mm';
type Preset = {
  type: 'custom' | 'a4' | 'poster';
  display: string;
  dimensions: Dimensions;
  measurement: Measurement;
};

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

const AddArtwork = () => {
  const editor = useSelectionEditor();
  const [image, setImage] = useState<HTMLImageElement>();

  const [presetType, setPresetType] = useState<Preset['type']>('custom');
  const [actualDimensions, setActualDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [measurement, setMeasurement] = useState<Measurement>('inch');

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

  // Load the image
  useEffect(() => {
    if (!image) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        const getDimension = (value: number) => {
          const inches = value / 72; // px to in, at 72ppi
          return Math.round(inches * 100) / 100; // rounded to nearest 0.01
        };
        setActualDimensions({
          width: getDimension(img.naturalWidth),
          height: getDimension(img.naturalHeight),
        });
      };
      img.src = '/img/test-add.jpeg';
    }
  }, []);

  return (
    <div css={tw`fixed inset-0 bg-black flex flex-1`}>
      <div css={tw`flex flex-col flex-1 items-center justify-center p-4`}>
        <div css={tw`flex flex-col flex-1 size-full`}>
          {image && (
            <ImageSelectionEditor
              editor={editor}
              actualDimensions={actualDimensions}
              image={image}
            />
          )}
        </div>
      </div>

      <div css={[tw`flex flex-col flex-shrink-0 border-l border-white p-4`]}>
        <div css={tw`flex flex-col pb-6`}>
          <label htmlFor="preset" css={tw`text-white`}>
            Preset
          </label>
          <select
            id="preset"
            value={presetType}
            onChange={evt => onPresetUpdate(evt.target.value as Preset['type'])}>
            <option value="custom">Custom</option>
            {presets.map(preset => (
              <option key={preset.type} value={preset.type}>
                {preset.display}
              </option>
            ))}
          </select>
          <div css={tw`flex pt-4`}>
            <div css={tw`flex flex-col mr-4`}>
              <label htmlFor="width" css={tw`text-white`}>
                Width
              </label>
              <input
                id="width"
                type="number"
                min="0"
                step="0.1"
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
              <label htmlFor="height" css={tw`text-white`}>
                Height
              </label>
              <input
                id="height"
                type="number"
                min="0"
                step="0.1"
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
              <label htmlFor="measurement" css={tw`text-white`}>
                Measurement
              </label>
              <select
                id="measurement"
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
        {image && (
          <ImageSelectionPreview
            editor={editor}
            actualDimensions={actualDimensions}
            image={image}
          />
        )}
      </div>
    </div>
  );
};

export default AddArtwork;
