import tw, { css } from 'twin.macro';
import { useAddArtworkContext } from './AddArtworkContext';
import { AddArtworkStep, Measurement, Preset } from './types';
import { useEffect, useState } from 'react';
import Select from './Select';
import NumberInput from './NumberInput';
import Close from '@src/svgs/Close';
import ImageSelectionEditor from '@src/components/ImageSelectionEditor';
import ImageSelectionPreview from '@src/components/ImageSelectionPreview';

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
  /**
   * Renders the Main view.
   */
  Main: function MeasureArtworkMain() {
    const { actualDimensions, editor, image, setIsNextDisabled } = useAddArtworkContext();

    // Disable the next button when selection is invalid
    useEffect(() => {
      setIsNextDisabled(!editor.isValid);
    }, [editor.isValid]);

    return (
      <div css={tw`flex flex-col flex-1 size-full`}>
        {image && (
          <ImageSelectionEditor editor={editor} actualDimensions={actualDimensions} image={image} />
        )}
      </div>
    );
  },
  /**
   * Renders the form rail.
   */
  Rail: function MeasureArtworkRail() {
    const {
      actualDimensions,
      editor,
      image,
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
        <p>Then, drag the handles to match the size of the piece.</p>

        <div css={tw`flex flex-col my-6`}>
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
          <p css={tw`text-sm mb-2 text-gray-300`}>Preview</p>
          <div css={tw`w-full h-96 bg-white bg-opacity-10 rounded-md p-4`}>
            {image && (
              <ImageSelectionPreview
                editor={editor}
                actualDimensions={actualDimensions}
                image={image}
              />
            )}
          </div>
        </div>
      </div>
    );
  },
};

export default MeasureArtwork;
