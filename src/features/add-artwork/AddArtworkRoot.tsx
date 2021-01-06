import { FormEvent, Fragment, useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { rgba } from 'polished';
import FocusLock from 'react-focus-lock';
import tw, { css, theme } from 'twin.macro';
import Button from '@src/components/Button';
import IconButton from '@src/components/IconButton';
import ImageSelectionPreview from '@src/components/ImageSelectionPreview';
import Portal from '@src/components/Portal';
import { useSelectionEditor } from '@src/hooks/useSelectionEditor';
import { AddArtworkContext } from './AddArtworkContext';
import DetailsPanel from './DetailsPanel';
import DimensionsPanel from './DimensionsPanel';
import EditSelectionModal from './EditSelectionModal';
import FramePanel from './FramePanel';
import Panel from './Panel';
import UploadArtwork from './UploadArtwork';
import { ArtworkDetails, Measurement } from './types';
import Close from '@src/svgs/Close';
import { Dimensions } from '@src/types';

export type AddArtworkRootProps = {
  onClose(): void;
};

const AddArtworkRoot = ({ onClose }: AddArtworkRootProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const editor = useSelectionEditor();
  const [image, setImage] = useState<HTMLImageElement>();
  const [actualDimensions, setActualDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [measurement, setMeasurement] = useState<Measurement>('inch');
  const [details, setDetails] = useState<ArtworkDetails>({
    title: '',
    artist: '',
    description: '',
    createdAt: 2020,
    acquiredAt: 2020,
  });
  const [frameId, setFrameId] = useState<number>();

  const [isEditingSelection, setIsEditingSelection] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmitDisabled = isSubmitting || isEditingSelection || !details.title.trim();

  const ModalAnimations = {
    enter() {
      const scalePadding = 24; // # of pixels to end smaller
      const scaleXStart = (window.innerWidth - scalePadding) / window.innerWidth;
      const scaleYStart = (window.innerHeight - scalePadding) / window.innerHeight;
      const t = anime
        .timeline()
        .add({
          targets: rootRef.current,
          scaleX: [scaleXStart, 1],
          scaleY: [scaleYStart, 1],
          opacity: [0, 1],
          duration: 300,
          easing: 'easeOutQuint',
        })
        .add(
          {
            targets: contentRef.current,
            opacity: [0, 1],
            duration: 150,
            easing: 'easeOutQuad',
          },
          50,
        );
      return t.finished;
    },
    leave() {
      const scalePadding = 24; // # of pixels to start smaller
      const scaleXEnd = (window.innerWidth - scalePadding) / window.innerWidth;
      const scaleYEnd = (window.innerHeight - scalePadding) / window.innerHeight;
      const t = anime
        .timeline()
        .add({
          targets: contentRef.current,
          opacity: [1, 0],
          duration: 150,
          easing: 'easeOutSine',
        })
        .add(
          {
            targets: rootRef.current,
            scaleX: [1, scaleXEnd],
            scaleY: [1, scaleYEnd],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeOutQuint',
          },
          50,
        );
      return t.finished;
    },
  };

  /**
   * Wrapper for the close handler. Plays the close animation, then calls the
   * passed handler.
   */
  const _onClose = async () => {
    await ModalAnimations.leave();
    onClose();
  };

  /**
   * Key handler. Closes the modal form on escape key.
   */
  const onKeyDown = (evt: KeyboardEvent) => {
    switch (evt.key) {
      case 'Escape':
      case 'Esc': {
        evt.preventDefault();
        _onClose();
      }
    }
  };

  /**
   * Callback handler for when the form submits. Validates and saves data
   * to the API, then closes the modal.
   */
  const onSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (isSubmitDisabled) {
      return;
    }
    setIsSubmitting(true);
    // TODO: validate and save data to API
    setIsSubmitting(false);
    _onClose();
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
      ModalAnimations.enter();
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
        frameId,
        image,
        isSubmitting,
        measurement,
        setActualDimensions,
        setDetails,
        setFrameId,
        setImage,
        setMeasurement,
      }}>
      <Portal to="modal-root">
        <FocusLock returnFocus>
          <div
            ref={rootRef}
            id="add-artwork-modal"
            css={[
              tw`fixed inset-0 bg-black text-white z-modal overflow-hidden`,
              tw`opacity-0`,
              css`
                box-shadow: 0 0 70px 0 ${rgba(theme`colors.white`, 0.5)};
                & *::selection {
                  background: ${rgba(theme`colors.white`, 0.35)};
                }
              `,
            ]}
            role="dialog"
            aria-label="Create Artwork Modal"
            aria-modal="true">
            <div
              ref={contentRef}
              id="add-artwork-modal-content"
              css={[tw`flex flex-col size-full`, tw`opacity-0`]}>
              <header css={tw`flex items-center border-b border-white px-6 py-5`}>
                <IconButton
                  title="Cancel"
                  disabled={isSubmitting || isEditingSelection}
                  onClick={_onClose}>
                  <Close />
                </IconButton>
                <h1 css={[tw`ml-5`, isEditingSelection && tw`opacity-50`]}>
                  <span css={tw`font-medium`}>Creating{image ? ': ' : ' artwork'}</span>
                  {image && (
                    <span css={[!details.title.trim() && tw`text-gray-300 text-opacity-70`]}>
                      {details.title.trim() || 'Unknown'}
                    </span>
                  )}
                </h1>
              </header>
              <div css={tw`flex flex-1 relative`}>
                <form css={tw`flex flex-1`} onSubmit={onSubmit}>
                  {!image && <UploadArtwork />}
                  {image && (
                    <Fragment>
                      <div
                        css={tw`flex flex-col flex-1 px-6 py-5 items-center justify-center size-full relative border-r border-white`}>
                        <div css={[tw`max-w-3xl max-h-3xl size-full`]}>
                          <ImageSelectionPreview
                            editor={editor}
                            actualDimensions={actualDimensions}
                            image={image}
                          />
                        </div>
                        {/* TODO: add actual logic for showing this alert */}
                        <p
                          css={[
                            tw`absolute bottom-5 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-3xl bg-black bg-opacity-90 text-yellow-500`,
                            tw`before:(content absolute inset-0 rounded-3xl bg-yellow-500 bg-opacity-20 pointer-events-none)`,
                            [
                              tw`transition-all ease-out`,
                              (!frameId || frameId < 9) &&
                                tw`opacity-0 translate-y-1 pointer-events-none`,
                            ],
                          ]}
                          role="region"
                          aria-live="assertive"
                          aria-hidden={!frameId || frameId < 9}>
                          Artwork may be cropped in this frame.
                        </p>
                      </div>
                      <div css={tw`relative flex-shrink-0 max-w-lg w-full`}>
                        <div
                          css={tw`absolute inset-0 size-full flex flex-col overflow-x-hidden overflow-y-auto divide-y divide-white`}>
                          <Panel css={[isEditingSelection && tw`flex-1`]} title="Selection">
                            <Button
                              css={tw`mt-2`}
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => setIsEditingSelection(true)}
                              aria-controls="artwork-edit-selection-modal">
                              Edit selection
                            </Button>
                          </Panel>
                          <DimensionsPanel />
                          <DetailsPanel />
                          <FramePanel />
                        </div>
                      </div>
                    </Fragment>
                  )}

                  {/* Render Save button in top right corner, last in tab order */}
                  {image && (
                    <Button
                      css={tw`fixed right-4 top-8 transform -translate-y-1/2`}
                      disabled={isSubmitDisabled}
                      filled
                      type="submit">
                      Save
                    </Button>
                  )}
                </form>

                {isEditingSelection && image && (
                  <EditSelectionModal
                    editor={editor}
                    actualDimensions={actualDimensions}
                    image={image}
                    onClose={modalEditor => {
                      if (modalEditor) {
                        editor.setPoints(modalEditor.points); // Save the latest state, if available
                      }
                      setIsEditingSelection(false); // Close the editor
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </FocusLock>
      </Portal>
    </AddArtworkContext.Provider>
  );
};

export default AddArtworkRoot;
