import Checkmark from '@src/svgs/Checkmark';
import Close from '@src/svgs/Close';
import { Dimensions } from '@src/types';
import tw, { css, theme } from 'twin.macro';
import { useAddArtworkContext } from './AddArtworkContext';
import Panel from './Panel';

type Frame = {
  id: number;
  dimensions: Dimensions;
};

type FrameInputProps = {
  label: string;
  value: Frame | undefined;
};
const FrameInput = ({ label, value }: FrameInputProps) => {
  const { actualDimensions, frameId, setFrameId } = useAddArtworkContext();

  const id = `frame-${value?.id ?? 'none'}`;

  let sizeRatio = actualDimensions.width / actualDimensions.height;
  if (value) {
    sizeRatio = value.dimensions.width / value.dimensions.height;
  }
  const frameCss = css`
    height: ${theme`height.24`};
    width: calc(${theme`height.24`} * ${sizeRatio});
  `;

  const isChecked = frameId === value?.id;

  return (
    <div css={tw`flex flex-col mr-5 mb-5`}>
      <input
        css={tw`sr-only`}
        id={id}
        type="radio"
        checked={isChecked}
        name="frame"
        onChange={() => setFrameId(value?.id)}
      />
      <label css={tw`flex cursor-pointer relative`} htmlFor={id}>
        <span css={tw`sr-only`}>{label}</span>
        {value ? (
          <span css={[frameCss, tw`bg-white bg-opacity-20`]} />
        ) : (
          <span
            css={[
              frameCss,
              css`
                border: 1px solid;
                border-image: url('/img/border-image.png') 1 round;
              `,
            ]}
          />
        )}
        <span
          css={[
            tw`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`,
            tw`size-7 bg-white bg-opacity-20 flex items-center justify-center rounded-full`,
            [tw`transition-all`, !isChecked && tw`opacity-0 scale-75`],
          ]}>
          <span css={tw`block size-4`}>
            <Checkmark />
          </span>
        </span>
      </label>
    </div>
  );
};

const FramePanel = () => {
  const { actualDimensions } = useAddArtworkContext();

  const onCreateFrame = () => {
    // do stuff
  };

  return (
    <Panel
      title="Frame"
      headerAction={
        <button
          css={[
            tw`p-1.5 -m-1.5 rounded bg-white bg-opacity-0 ring-0 ring-white ring-opacity-20`,
            tw`disabled:(opacity-50 cursor-not-allowed)`,
            tw`not-disabled:hocus:(bg-opacity-20) not-disabled:focus:(outline-none transition-shadow ring-2)`,
          ]}
          onClick={onCreateFrame}>
          <span css={tw`sr-only`}>Create frame</span>
          <span css={tw`block size-4 transform rotate-45`}>
            <Close />
          </span>
        </button>
      }>
      <ul css={tw`flex flex-col mt-3`}>
        <li css={tw`flex flex-col not-last:mb-6`}>
          <p css={tw`text-sm text-gray-300 mb-3`}>No frame</p>

          <div css={tw`flex flex-wrap -mb-5`}>
            <FrameInput value={undefined} label="No frame" />
          </div>
        </li>
        <li css={tw`flex flex-col not-last:mb-6`}>
          <p css={tw`text-sm text-gray-300 mb-3`}>Compatible frames</p>

          <div css={tw`flex flex-wrap -mb-5`}>
            <FrameInput value={{ id: 1, dimensions: actualDimensions }} label="1 frame" />
            <FrameInput value={{ id: 2, dimensions: actualDimensions }} label="2 frame" />
            <FrameInput value={{ id: 3, dimensions: actualDimensions }} label="3 frame" />
            <FrameInput value={{ id: 4, dimensions: actualDimensions }} label="4 frame" />
            <FrameInput value={{ id: 5, dimensions: actualDimensions }} label="5 frame" />
            <FrameInput value={{ id: 6, dimensions: actualDimensions }} label="6 frame" />
            <FrameInput value={{ id: 7, dimensions: actualDimensions }} label="7 frame" />
            <FrameInput value={{ id: 8, dimensions: actualDimensions }} label="8 frame" />
          </div>
        </li>
        <li css={tw`flex flex-col not-last:mb-6`}>
          <p css={tw`text-sm text-gray-300 mb-3`}>Incompatible frames</p>
          <div css={tw`flex flex-wrap -mb-5`}>
            <FrameInput value={{ id: 9, dimensions: { width: 5, height: 5 } }} label="9 frame" />
            <FrameInput value={{ id: 10, dimensions: { width: 10, height: 5 } }} label="10 frame" />
          </div>
        </li>
      </ul>
    </Panel>
  );
};

export default FramePanel;
