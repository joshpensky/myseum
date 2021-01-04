import { useEffect, useRef, useState } from 'react';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import FocusLock from 'react-focus-lock';
import tw from 'twin.macro';
import Portal from '@src/components/Portal';
import { useSelectionEditor } from '@src/hooks/useSelectionEditor';
import { AddArtworkContext } from './AddArtworkContext';
import MeasureArtwork from './MeasureArtwork';
import ResizeArtwork from './ResizeArtwork';
import UploadArtwork from './UploadArtwork';
import { Measurement } from './types';
import { Dimensions } from '@src/types';

const NavButton = tw.button`px-2 py-1 -mx-2 -my-1 rounded bg-white bg-opacity-0 ring-0 ring-white ring-opacity-20 disabled:opacity-50 hocus:(bg-opacity-20) focus:(outline-none transition-shadow ring-2)`;

export type AddArtworkRootProps = {
  onClose(): void;
};

const AddArtworkRoot = ({ onClose }: AddArtworkRootProps) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const editor = useSelectionEditor();
  const [image, setImage] = useState<HTMLImageElement>();
  const [actualDimensions, setActualDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [measurement, setMeasurement] = useState<Measurement>('inch');

  const steps = [UploadArtwork, MeasureArtwork, ResizeArtwork];
  const [stepIndex, setStepIndex] = useState(0);
  const [isNextDisabled, setIsNextDisabled] = useState(false);

  /**
   * Key handler. Closes the modal form on escape key.
   */
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

  // Adds the key handler
  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  // Disables/enables body scroll on mount/unmount, respectively
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
                    <NavButton onClick={() => setStepIndex(stepIndex - 1)}>Back</NavButton>
                  ) : (
                    <NavButton onClick={onClose}>Cancel</NavButton>
                  )}
                </div>
                <div css={tw`flex flex-1 justify-center`}>
                  <p css={tw`sr-only`}>
                    Step {stepIndex + 1} of {steps.length}
                  </p>
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
                    <NavButton
                      css={tw`disabled:opacity-50`}
                      disabled={isNextDisabled}
                      onClick={() => setStepIndex(stepIndex + 1)}>
                      Next
                    </NavButton>
                  ) : (
                    <NavButton
                      css={tw`disabled:opacity-50`}
                      disabled={isNextDisabled}
                      onClick={onFinish}>
                      Finish
                    </NavButton>
                  )}
                </div>
              </header>
              <div
                css={tw`flex flex-col flex-1 overflow-x-hidden overflow-y-auto px-6 py-5 relative`}>
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
