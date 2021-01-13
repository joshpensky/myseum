import { FormEvent, Fragment, useContext, useEffect, useRef, useState } from 'react';
import FocusLock from 'react-focus-lock';
import tw from 'twin.macro';
import Button from '@src/components/Button';
import { useSelectionEditor } from '@src/hooks/useSelectionEditor';
import { AddArtworkContext } from '@src/features/add-artwork/AddArtworkContext';
import UploadImage from '@src/features/add-artwork/UploadImage';
import { AddFrameContext } from './AddFrameContext';
import UploadToast from './UploadToast';
import { Dimensions, Measurement } from '@src/types';
import EditSelectionModal from '../EditSelectionModal';
import FramePreview from './FramePreview';
import DetailsPanel from './DetailsPanel';
import DimensionsPanel from './DimensionsPanel';
import FeatureFormModal from '@src/components/FeatureFormModal';

export type AddFrameRootProps = {
  onClose(): void;
};

const AddFrameRoot = ({ onClose }: AddFrameRootProps) => {
  const addArtworkContext = useContext(AddArtworkContext);

  const uploadInputRef = useRef<HTMLInputElement>(null);
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
  ]);

  const [image, setImage] = useState<HTMLImageElement>();
  const [actualDimensions, setActualDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [depth, setDepth] = useState(0);
  const [measurement, setMeasurement] = useState<Measurement>('inch');
  const [description, setDescription] = useState('');

  const [isPreviewRotated, setIsPreviewRotated] = useState(false);
  const [isEditingSelection, setIsEditingSelection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Key handler. Closes the modal form on escape key.
   */
  const onKeyDown = (evt: KeyboardEvent) => {
    switch (evt.key) {
      case 'Escape':
      case 'Esc': {
        evt.preventDefault();
        setIsUploadToastHidden(true);
      }
    }
  };

  /**
   * Callback handler for when the form submits. Validates and saves data
   * to the API, then closes the modal.
   */
  const onSubmit = (evt: FormEvent<HTMLFormElement>) => {
    try {
      setIsSubmitting(true);
      // TODO: validate and save data to API
      console.log(evt);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isUploadToastHidden) {
      window.addEventListener('keydown', onKeyDown);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [isUploadToastHidden]);

  return (
    <AddFrameContext.Provider
      value={{
        actualDimensions,
        depth,
        description,
        editor,
        image,
        isSubmitting,
        measurement,
        setActualDimensions,
        setDepth,
        setDescription,
        setImage,
        setMeasurement,
      }}>
      <FeatureFormModal
        id="add-frame-modal"
        aria-label="Create Frame Modal"
        title={<h1 css={tw`font-medium`}>Creating frame</h1>}
        disabledClose={isEditingSelection || isUploadToastHidden}
        disabledSubmit={isSubmitting || isEditingSelection || !description.trim()}
        hideSubmit={!image}
        onClose={onClose}
        onSubmit={onSubmit}>
        {!image ? (
          <FeatureFormModal.Main>
            <UploadImage
              ref={uploadInputRef}
              setActualDimensions={setActualDimensions}
              setImage={setImage}
              setMeasurement={setMeasurement}
            />
            {addArtworkContext?.image && (
              <FocusLock
                disabled={isUploadToastHidden}
                onDeactivation={() => {
                  process.nextTick(() => uploadInputRef.current?.focus());
                }}>
                <UploadToast
                  image={addArtworkContext.image}
                  hidden={isUploadToastHidden}
                  onClose={() => setIsUploadToastHidden(true)}
                />
              </FocusLock>
            )}
          </FeatureFormModal.Main>
        ) : (
          <Fragment>
            <FeatureFormModal.Main>
              <FramePreview rotate={isPreviewRotated} />
            </FeatureFormModal.Main>
            <FeatureFormModal.Sidebar>
              <FeatureFormModal.SidebarPanel title="Selection">
                <Button
                  css={tw`mt-2`}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsEditingSelection(true)}
                  aria-controls="edit-selection-modal">
                  Edit selection
                </Button>
              </FeatureFormModal.SidebarPanel>
              <DimensionsPanel onDepthFocusChange={isFocused => setIsPreviewRotated(isFocused)} />
              <DetailsPanel />
            </FeatureFormModal.Sidebar>
          </Fragment>
        )}

        {isEditingSelection && image && (
          <FeatureFormModal.OutsideForm>
            <EditSelectionModal
              editor={editor}
              actualDimensions={actualDimensions}
              image={image}
              withLayers
              onClose={modalEditor => {
                if (modalEditor) {
                  editor.setLayers(modalEditor.layers); // Save the latest state, if available
                }
                setIsEditingSelection(false); // Close the editor
              }}
            />
          </FeatureFormModal.OutsideForm>
        )}
      </FeatureFormModal>
    </AddFrameContext.Provider>
  );
};

export default AddFrameRoot;
