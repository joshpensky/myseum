import { FormEvent, Fragment, useContext, useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { rgba } from 'polished';
import FocusLock from 'react-focus-lock';
import tw, { css, theme } from 'twin.macro';
import Button from '@src/components/Button';
import IconButton from '@src/components/IconButton';
// import ImageSelectionPreview from '@src/components/ImageSelectionPreview';
import Portal from '@src/components/Portal';
import { useSelectionEditor } from '@src/hooks/useSelectionEditor';
import { AddArtworkContext } from '@src/features/add-artwork/AddArtworkContext';
import Panel from '@src/features/add-artwork/Panel';
import UploadImage from '@src/features/add-artwork/UploadImage';
import { AddFrameContext } from './AddFrameContext';
import UploadToast from './UploadToast';
import Close from '@src/svgs/Close';
import { Dimensions, Measurement } from '@src/types';
import ImageSelectionEditor from '@src/components/ImageSelectionEditor';

export type AddFrameRootProps = {
  onClose(): void;
};

const AddFrameRoot = ({ onClose }: AddFrameRootProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  const addArtworkContext = useContext(AddArtworkContext);
  const [isUploadToastHidden, setIsUploadToastHidden] = useState(() => !addArtworkContext?.image);

  const editor = useSelectionEditor([
    {
      name: 'Frame',
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
    },
    {
      name: 'Window',
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
      ],
    },
  ]);
  const [activeLayer, setActiveLayer] = useState(0);

  const [image, setImage] = useState<HTMLImageElement>();
  const [actualDimensions, setActualDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [measurement, setMeasurement] = useState<Measurement>('inch');
  const [description, setDescription] = useState('');

  const [isEditingSelection, setIsEditingSelection] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmitDisabled = isSubmitting || isEditingSelection || !description.trim();

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
        if (!isUploadToastHidden) {
          setIsUploadToastHidden(true);
        } else {
          _onClose();
        }
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
  }, [onKeyDown]);

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
    <AddFrameContext.Provider
      value={{
        actualDimensions,
        description,
        editor,
        image,
        isSubmitting,
        measurement,
        setActualDimensions,
        setDescription,
        setImage,
        setMeasurement,
      }}>
      <Portal to="modal-root">
        <FocusLock returnFocus>
          <div
            ref={rootRef}
            id="add-frame-modal"
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
            aria-label="Create Frame Modal"
            aria-modal="true">
            <div
              ref={contentRef}
              id="add-frame-modal-content"
              css={[tw`flex flex-col size-full`, tw`opacity-0`]}>
              <header css={tw`flex items-center border-b border-white px-6 py-5`}>
                <IconButton
                  ref={cancelBtnRef}
                  title="Cancel"
                  disabled={isSubmitting || isEditingSelection}
                  onClick={_onClose}>
                  <Close />
                </IconButton>
                <h1 css={[tw`ml-5 font-medium`, isEditingSelection && tw`opacity-50`]}>
                  Creating frame
                </h1>
              </header>
              <div css={tw`flex flex-1 relative`}>
                <form css={tw`flex flex-1 overflow-hidden`} onSubmit={onSubmit}>
                  {!image ? (
                    <Fragment>
                      <UploadImage
                        setActualDimensions={setActualDimensions}
                        setImage={setImage}
                        setMeasurement={setMeasurement}
                      />
                      {addArtworkContext?.image && (
                        <FocusLock
                          disabled={isUploadToastHidden}
                          onDeactivation={() => {
                            process.nextTick(() => cancelBtnRef.current?.focus());
                          }}>
                          <UploadToast
                            image={addArtworkContext.image}
                            hidden={isUploadToastHidden}
                            onClose={() => setIsUploadToastHidden(true)}
                          />
                        </FocusLock>
                      )}
                    </Fragment>
                  ) : (
                    <Fragment>
                      <div
                        css={tw`flex flex-col flex-1 px-6 py-5 items-center justify-center size-full relative border-r border-white`}>
                        <ImageSelectionEditor
                          activeLayer={activeLayer}
                          editor={editor}
                          actualDimensions={actualDimensions}
                          image={image}
                        />
                        {/* <div css={[tw`max-w-3xl max-h-3xl size-full`]}>
                          <ImageSelectionPreview
                            editor={editor}
                            actualDimensions={actualDimensions}
                            image={image}
                          />
                        </div> */}
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
                              aria-controls="edit-selection-modal">
                              Edit selection
                            </Button>
                          </Panel>
                          <Panel title="Layers">
                            <Button onClick={() => setActiveLayer(0)}>Frame</Button>
                            <Button onClick={() => setActiveLayer(1)}>Window</Button>
                          </Panel>
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
              </div>
            </div>
          </div>
        </FocusLock>
      </Portal>
    </AddFrameContext.Provider>
  );
};

export default AddFrameRoot;
