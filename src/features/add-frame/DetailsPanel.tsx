import tw from 'twin.macro';
import TextField from '@src/components/TextField';
import { useAddFrameContext } from './AddFrameContext';
import FeatureFormModal from '@src/components/FeatureFormModal';

const DetailsPanel = () => {
  const { description, isSubmitting, setDescription } = useAddFrameContext();

  return (
    <FeatureFormModal.SidebarPanel title="Details">
      <div css={tw`flex flex-col w-full mt-3`}>
        <div css={tw`flex flex-col flex-1 not-last:mb-4`}>
          <label css={tw`pb-1.5 text-sm text-gray-300`} htmlFor="description">
            Description
          </label>
          <TextField
            id="description"
            type="text"
            grow
            placeholder="Unknown"
            required
            disabled={isSubmitting}
            value={description}
            onChange={value => setDescription(value.slice(0, 128))}
          />
          <p css={tw`pt-1 text-xs text-gray-300 self-end`}>
            {/* TODO: a11y (e.g., https://github.com/rikschennink/short-and-sweet/blob/master/src/short-and-sweet.js) */}
            <span css={tw`sr-only`}>Character count: </span>
            <span>{description.length} / 128</span>
          </p>
        </div>
      </div>
    </FeatureFormModal.SidebarPanel>
  );
};

export default DetailsPanel;
