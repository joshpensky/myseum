import tw from 'twin.macro';
import { useAddArtworkContext } from './AddArtworkContext';
import { AddArtworkStep, Measurement, Preset } from './types';
import { useState } from 'react';

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
              <label htmlFor="height">Height</label>
              <input
                id="height"
                css={tw`bg-black hocus:(outline-none bg-white bg-opacity-10)`}
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
            {/* TODO: add dimensions renderer */}
          </div>
        </div>
      </div>
    );
  },
};

export default MeasureArtwork;
