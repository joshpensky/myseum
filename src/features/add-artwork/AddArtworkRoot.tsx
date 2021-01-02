import tw from 'twin.macro';
import FocusLock from 'react-focus-lock';
import Portal from '@src/components/Portal';
import { useEffect, useRef, useState } from 'react';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { AddArtworkContext } from './AddArtworkContext';
import { useSelectionEditor } from '@src/hooks/useSelectionEditor';
import { Dimensions } from '@src/types';
import MeasureArtwork from './MeasureArtwork';
import ResizeArtwork from './ResizeArtwork';
import { Measurement } from './types';
import UploadArtwork from './UploadArtwork';

export type AddArtworkRootProps = {
  onClose(): void;
};

const AddArtworkRoot = ({ onClose }: AddArtworkRootProps) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const editor = useSelectionEditor();
  const [image, setImage] = useState<HTMLImageElement>();

  const [isNextDisabled, setIsNextDisabled] = useState(false);

  const [actualDimensions, setActualDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [measurement, setMeasurement] = useState<Measurement>('inch');

  const steps = [UploadArtwork, MeasureArtwork, ResizeArtwork];

  const [stepIndex, setStepIndex] = useState(0);

  const onKeyDown = (evt: KeyboardEvent) => {
    switch (evt.key) {
      case 'Escape':
      case 'Esc': {
        evt.preventDefault();
        onClose();
      }
    }
  };

  const onFinish = () => {
    // do stuff
    onClose();
  };

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (rootRef.current) {
      disableBodyScroll(rootRef.current);
    }
    return () => {
      if (rootRef.current) {
        enableBodyScroll(rootRef.current);
      }
    };
  }, []);

  const StepComponent = steps[stepIndex];

  return (
    <AddArtworkContext.Provider
      value={{
        actualDimensions,
        editor,
        image,
        isNextDisabled,
        measurement,
        setActualDimensions,
        setImage,
        setIsNextDisabled,
        setMeasurement,
      }}>
      <Portal to="modal-root">
        <FocusLock returnFocus>
          <div
            ref={rootRef}
            css={tw`fixed inset-0 bg-black flex flex-1 divide-x divide-white z-modal text-white`}>
            <div css={tw`flex flex-col flex-shrink-0 max-w-lg w-full divide-y divide-white`}>
              <header css={tw`flex items-center px-6 py-5`}>
                <div css={tw`flex flex-1 justify-start`}>
                  {stepIndex > 0 ? (
                    <button onClick={() => setStepIndex(stepIndex - 1)}>Back</button>
                  ) : (
                    <button onClick={onClose}>Cancel</button>
                  )}
                </div>
                <div css={tw`flex flex-1 justify-center`}>
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      css={[
                        tw`size-2 rounded-full bg-white not-last:mr-2`,
                        index !== stepIndex && tw`bg-opacity-30`,
                      ]}
                    />
                  ))}
                </div>
                <div css={tw`flex flex-1 justify-end`}>
                  {stepIndex < steps.length - 1 ? (
                    <button
                      css={tw`disabled:opacity-50`}
                      disabled={isNextDisabled}
                      onClick={() => setStepIndex(stepIndex + 1)}>
                      Next
                    </button>
                  ) : (
                    <button
                      css={tw`disabled:opacity-50`}
                      disabled={isNextDisabled}
                      onClick={onFinish}>
                      Finish
                    </button>
                  )}
                </div>
              </header>
              <div css={tw`flex flex-col flex-1 overflow-auto px-6 py-5 relative`}>
                <StepComponent.Rail />
              </div>
            </div>
            <div css={tw`flex flex-1 px-6 py-5 relative`}>
              <StepComponent.Main />
            </div>
          </div>
        </FocusLock>
      </Portal>
    </AddArtworkContext.Provider>
  );
};

export default AddArtworkRoot;
