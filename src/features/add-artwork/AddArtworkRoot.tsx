import { Fragment, useEffect, useRef, useState } from 'react';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { math } from 'polished';
import FocusLock from 'react-focus-lock';
import tw, { css, theme, styled } from 'twin.macro';
import Portal from '@src/components/Portal';
import { useSelectionEditor } from '@src/hooks/useSelectionEditor';
import { AddArtworkContext } from './AddArtworkContext';
import UploadArtwork from './UploadArtwork';
import { ArtworkDetails, Measurement } from './types';
import { Dimensions } from '@src/types';
import Button from '@src/components/Button';
import MeasureArtwork from './MeasureArtwork';
import ImageSelectionPreview from '@src/components/ImageSelectionPreview';
import ImageSelectionEditor from '@src/components/ImageSelectionEditor';

const NavButton = styled.button(() => [
  tw`px-2 py-1 -mx-2 rounded bg-white bg-opacity-0 ring-0 ring-white ring-opacity-20`,
  tw`disabled:(opacity-50 cursor-not-allowed)`,
  tw`not-disabled:hocus:(bg-opacity-20) not-disabled:focus:(outline-none transition-shadow ring-2)`,
]);

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
  const [details, setDetails] = useState<ArtworkDetails>({
    title: '',
  });

  const [isEditingSelection, setIsEditingSelection] = useState(false);

  // const steps = [UploadArtwork, MeasureArtwork];
  // const [stepIndex, setStepIndex] = useState(0);
  // const [isNextDisabled, setIsNextDisabled] = useState(false);

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

  return (
    <AddArtworkContext.Provider
      value={{
        actualDimensions,
        details,
        editor,
        image,
        measurement,
        setActualDimensions,
        setDetails,
        setImage,
        setMeasurement,
      }}>
      <Portal to="modal-root">
        <FocusLock returnFocus>
          <div
            ref={rootRef}
            css={tw`fixed inset-0 bg-black flex flex-col flex-1 z-modal text-white`}
            role="dialog"
            aria-label="Add artwork modal"
            aria-modal="true">
            <header css={tw`flex items-center border-b border-white px-6 py-5`}>
              <div css={tw`flex flex-1 justify-start`}>
                <NavButton onClick={onClose}>Cancel</NavButton>
              </div>
              {image && (
                <Fragment>
                  <div css={tw`flex flex-1 justify-center`}>
                    <h1
                      css={[
                        tw`leading-none text-3xl font-serif transform translate-y-1`,
                        !details.title && tw`opacity-50`,
                      ]}>
                      {details.title || 'Unknown'}
                    </h1>
                  </div>
                  <div css={tw`flex flex-1 justify-end`}></div>
                </Fragment>
              )}
            </header>
            <div css={tw`flex flex-1 relative divide-x divide-white`}>
              {image ? (
                <Fragment>
                  <div css={tw`flex flex-1 px-6 py-5 relative`}>
                    <div css={tw`flex flex-col flex-1 size-full`}></div>
                    {isEditingSelection ? (
                      <ImageSelectionEditor
                        editor={editor}
                        actualDimensions={actualDimensions}
                        image={image}
                      />
                    ) : (
                      <ImageSelectionPreview
                        editor={editor}
                        actualDimensions={actualDimensions}
                        image={image}
                      />
                    )}
                  </div>
                  <div
                    css={tw`flex flex-col max-w-lg w-full overflow-x-hidden overflow-y-auto divide-y divide-white`}>
                    <div
                      css={[
                        tw`flex flex-col px-6 pt-5 pb-6 items-start`,
                        isEditingSelection && tw`flex-1`,
                      ]}>
                      <h2 css={[tw`font-medium mb-1`]}>Selection</h2>
                      {isEditingSelection ? (
                        <Fragment>
                          <p css={tw`mb-4`}>Drag the handles to match the size of the artwork.</p>
                          <div css={tw`flex items-center`}>
                            <Button
                              css={tw`mr-5`}
                              disabled={!editor.isValid}
                              onClick={() => {
                                editor.history.squash();
                                setIsEditingSelection(false);
                              }}>
                              Save
                            </Button>
                            <NavButton
                              onClick={() => {
                                editor.history.restart();
                                setIsEditingSelection(false);
                              }}>
                              Cancel
                            </NavButton>
                          </div>
                          <div css={tw`flex flex-col flex-1 w-full justify-end mt-6`}>
                            <p css={tw`text-sm mb-2 text-gray-300`}>Preview</p>
                            <div css={tw`w-full h-96 bg-white bg-opacity-10 rounded-md p-4`}>
                              <ImageSelectionPreview
                                editor={editor}
                                actualDimensions={actualDimensions}
                                image={image}
                              />
                            </div>
                          </div>
                        </Fragment>
                      ) : (
                        <Button css={tw`mt-2`} onClick={() => setIsEditingSelection(true)}>
                          Edit selection
                        </Button>
                      )}
                    </div>
                    {!isEditingSelection && (
                      <Fragment>
                        <div css={tw`flex flex-col px-6 pt-5 pb-6 items-start`}>
                          <h2 css={tw`font-medium mb-3`}>Dimensions</h2>
                          <MeasureArtwork.Rail />
                        </div>
                        <div css={tw`flex flex-col px-6 pt-5 pb-6 items-start`}>
                          <h2 css={tw`font-medium mb-3`}>Details</h2>
                        </div>
                        <div css={tw`flex flex-col px-6 pt-5 pb-6 items-start`}>
                          <h2 css={tw`font-medium mb-3`}>Frame</h2>
                        </div>
                      </Fragment>
                    )}
                  </div>
                </Fragment>
              ) : (
                <UploadArtwork.Main />
              )}
            </div>
            {image && (
              <NavButton
                css={[
                  tw`fixed right-6 transform -translate-y-1/2`,
                  css({
                    top: math(`${theme`padding.6`} + (${theme`fontSize.3xl`} / 2)`),
                  }),
                ]}
                disabled
                onClick={onFinish}>
                Save
              </NavButton>
            )}
          </div>
        </FocusLock>
      </Portal>
    </AddArtworkContext.Provider>
  );
};

export default AddArtworkRoot;
