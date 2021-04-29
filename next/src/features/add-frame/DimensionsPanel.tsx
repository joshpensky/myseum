import tw from 'twin.macro';
import Select from '@src/components/Select';
import TextField from '@src/components/TextField';
import Close from '@src/svgs/Close';
import { Measurement } from '@src/types';
import { useAddFrameContext } from './AddFrameContext';
import FeatureFormModal from '@src/components/FeatureFormModal';

type DimensionsPanelProps = {
  onDepthFocusChange(isFocused: boolean): void;
};

const DimensionsPanel = ({ onDepthFocusChange }: DimensionsPanelProps) => {
  const {
    actualDimensions,
    depth,
    isSubmitting,
    measurement,
    setActualDimensions,
    setDepth,
    setMeasurement,
  } = useAddFrameContext();

  return (
    <FeatureFormModal.SidebarPanel title="Dimensions">
      <div css={tw`flex items-end mt-2`}>
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
            onChange={value =>
              setActualDimensions(dimensions => ({
                ...dimensions,
                width: value,
              }))
            }
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
            onChange={value =>
              setActualDimensions(dimensions => ({
                ...dimensions,
                height: value,
              }))
            }
          />
        </div>
        <div css={tw`block flex-shrink-0 size-4 mb-3`}>
          <Close />
        </div>
        <div css={tw`flex flex-1 flex-col mx-4`}>
          <label css={tw`pb-1.5 text-sm text-gray-300`} htmlFor="depth">
            Depth
          </label>
          <TextField
            id="depth"
            type="number"
            min={0}
            disabled={isSubmitting}
            value={depth}
            onBlur={() => onDepthFocusChange(false)}
            onChange={value => setDepth(value)}
            onFocus={() => onDepthFocusChange(true)}
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
            onChange={value => setMeasurement(value as Measurement)}
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
    </FeatureFormModal.SidebarPanel>
  );
};

export default DimensionsPanel;
