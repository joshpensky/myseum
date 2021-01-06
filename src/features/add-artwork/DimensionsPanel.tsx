import { useState } from 'react';
import tw from 'twin.macro';
import { useAddArtworkContext } from './AddArtworkContext';
import Panel from './Panel';
import Select from './Select';
import TextField from './TextField';
import { Measurement, Preset } from './types';
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

const DimensionsPanel = () => {
  const {
    actualDimensions,
    isSubmitting,
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
    <Panel title="Dimensions">
      <div css={tw`flex flex-col mt-2`}>
        <div css={tw`flex flex-1 flex-col`}>
          <label css={tw`pb-1.5 text-sm text-gray-300`} htmlFor="preset">
            Preset
          </label>
          <Select
            id="preset"
            disabled={isSubmitting}
            value={presetType}
            onChange={value => onPresetUpdate(value as Preset['type'])}
            options={[
              { value: 'custom', display: 'Custom' },
              ...presets.map(preset => ({ value: preset.type, display: preset.display })),
            ]}
          />
        </div>
        <div css={tw`flex items-end pt-4`}>
          <div css={tw`flex flex-1 flex-col mr-4`}>
            <label css={tw`pb-1.5 text-sm text-gray-300`} htmlFor="width">
              Width
            </label>
            <TextField
              id="width"
              type="number"
              min={1}
              disabled={isSubmitting}
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
          <div css={tw`block flex-shrink-0 size-4 mb-3`}>
            <Close />
          </div>
          <div css={tw`flex flex-1 flex-col mx-4`}>
            <label css={tw`pb-1.5 text-sm text-gray-300`} htmlFor="height">
              Height
            </label>
            <TextField
              id="height"
              type="number"
              min={1}
              disabled={isSubmitting}
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
          <div css={tw`flex flex-1 flex-col`}>
            <label css={tw`pb-1.5 text-sm text-gray-300`} htmlFor="measurement">
              Measurement
            </label>
            <Select
              id="measurement"
              disabled={isSubmitting}
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
    </Panel>
  );
};

export default DimensionsPanel;
