import { useEffect, useState } from 'react';
import tw, { css, theme } from 'twin.macro';
import { Frame } from '@prisma/client';
import { pages } from 'next-pages-gen';
import FeatureFormModal from '@src/components/FeatureFormModal';
import IconButton from '@src/components/IconButton';
import AddFrameRoot from '@src/features/add-frame/AddFrameRoot';
import Checkmark from '@src/svgs/Checkmark';
import Close from '@src/svgs/Close';
import { useAddArtworkContext } from './AddArtworkContext';

type FrameInputProps = {
  label: string;
  value: Frame | null;
};

const FrameInput = ({ label, value }: FrameInputProps) => {
  const { actualDimensions, frameId, isSubmitting, setFrameId } = useAddArtworkContext();

  const id = `frame-${value?.id ?? 'none'}`;
  const isChecked = frameId === value?.id;

  let sizeRatio = actualDimensions.width / actualDimensions.height;
  if (value) {
    sizeRatio = value.width / value.height;
  }

  const frameCss = [
    isSubmitting && tw`opacity-50`,
    css`
      height: ${theme`height.24`};
      width: calc(${theme`height.24`} * ${sizeRatio});
    `,
  ];

  return (
    <div css={tw`flex flex-col mr-5 mb-5`}>
      <input
        css={tw`sr-only not-disabled:focus:sibling:(ring-1)`}
        id={id}
        type="radio"
        name="frame"
        disabled={isSubmitting}
        checked={isChecked}
        onChange={() => setFrameId(value?.id)}
      />
      <label
        css={[
          tw`relative flex rounded-sm`,
          tw`ring-0 ring-white ring-opacity-50 ring-offset-4 ring-offset-black`,
          isSubmitting ? tw`cursor-not-allowed` : tw`cursor-pointer`,
        ]}
        htmlFor={id}>
        <span css={tw`sr-only`}>{label}</span>
        {value ? (
          <span css={[frameCss]}>
            <img css={[tw`w-full h-full`]} src={value.src} alt="" />
          </span>
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
            tw`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10`,
            tw`size-7 bg-white bg-opacity-20 flex items-center justify-center rounded-full`,
            tw`border border-white border-opacity-50`,
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
  const {
    // actualDimensions,
    isEscapeDisabled,
    isSubmitting,
    setIsEscapeDisabled,
    setFrameId,
  } = useAddArtworkContext();

  const [isAddingFrame, setIsAddingFrame] = useState(false);

  const [frames, setFrames] = useState<Frame[]>([]);
  const fetchFrames = async () => {
    const res = await fetch(pages.api.frames.index);
    const data = await res.json();
    setFrames(data);
  };

  useEffect(() => {
    fetchFrames();
  }, []);

  useEffect(() => {
    if (isAddingFrame) {
      setIsEscapeDisabled(true);
      return () => {
        setIsEscapeDisabled(isEscapeDisabled);
      };
    }
  }, [isAddingFrame]);

  return (
    <FeatureFormModal.SidebarPanel
      title="Frame"
      headerAction={
        <IconButton
          type="button"
          title="Create frame"
          disabled={isSubmitting}
          onClick={() => setIsAddingFrame(true)}>
          <span css={tw`block transform rotate-45`}>
            <Close />
          </span>
        </IconButton>
      }>
      {isAddingFrame && (
        <AddFrameRoot
          onSubmit={frame => {
            setFrames(frames => [...frames, frame]);
            setFrameId(frame.id);
          }}
          onClose={() => setIsAddingFrame(false)}
        />
      )}
      <ul css={tw`flex flex-col mt-3`}>
        <li css={tw`flex flex-col not-last:mb-6`} role="group" aria-labelledby="no-frame-label">
          <p id="no-frame-label" css={tw`text-sm text-gray-300 mb-3`}>
            No frame
          </p>
          <div css={tw`flex flex-wrap -mb-5`}>
            <FrameInput value={null} label="No frame" />
          </div>
        </li>
        <li
          css={tw`flex flex-col not-last:mb-6`}
          role="group"
          aria-labelledby="compatible-frames-label">
          <p id="compatible-frames-label" css={tw`text-sm text-gray-300 mb-3`}>
            Available frames
            {/* TODO: incompatible vs. compatible frames */}
          </p>
          <div css={tw`flex flex-wrap -mb-5`}>
            {frames.map(frame => (
              <FrameInput key={frame.id} value={frame} label={frame.description} />
            ))}
          </div>
        </li>
        {/* <li
          css={tw`flex flex-col not-last:mb-6`}
          role="group"
          aria-labelledby="incompatible-frames-label">
          <p id="incompatible-frames-label" css={tw`text-sm text-gray-300 mb-3`}>
            Incompatible frames
          </p>
          <div css={tw`flex flex-wrap -mb-5`}>
            <FrameInput value={{ id: 9, dimensions: { width: 5, height: 5 } }} label="9 frame" />
            <FrameInput value={{ id: 10, dimensions: { width: 10, height: 5 } }} label="10 frame" />
          </div>
        </li> */}
      </ul>
    </FeatureFormModal.SidebarPanel>
  );
};

export default FramePanel;
