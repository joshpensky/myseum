import { Fragment, useContext, useRef, useState } from 'react';
import tw from 'twin.macro';
import { Frame } from '@prisma/client';
import { MoveFocusInside } from 'react-focus-lock';
import toast from 'react-hot-toast';
import Button from '@src/components/Button';
import FeatureFormModal from '@src/components/FeatureFormModal';
import { CreateFrameDto } from '@src/data/repositories/frame.repository';
import { supabase } from '@src/data/supabase';
// import { AddArtworkContext } from '@src/features/add-artwork/AddArtworkContext';
// import UploadImage from '@src/features/add-artwork/UploadImage';
import { Dimensions, Measurement } from '@src/types';
import { GeometryUtils } from '@src/utils/GeometryUtils';
import { AddFrameContext } from './AddFrameContext';
import DetailsPanel from './DetailsPanel';
import DimensionsPanel from './DimensionsPanel';
import FramePreview from './FramePreview';
import UploadToast from './UploadToast';
import EditSelectionModal from '../EditSelectionModal';
import { SelectionEditorState } from '../selection';

export type AddFrameRootProps = {
  onSubmit(frame: Frame): void;
  onClose(): void;
};

const AddFrameRoot = ({ onSubmit, onClose }: AddFrameRootProps) => {
  // const addArtworkContext = useContext(AddArtworkContext);

  // const uploadInputRef = useRef<HTMLInputElement>(null);
  // const [isUploadToastHidden, setIsUploadToastHidden] = useState(() => !addArtworkContext?.image);

  const [editor, setEditor] = useState(() => SelectionEditorState.create());

  const [image, setImage] = useState<HTMLImageElement>();
  const [actualDimensions, setActualDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [depth, setDepth] = useState(0);
  const [measurement, setMeasurement] = useState<Measurement>('inch');
  const [description, setDescription] = useState('');

  const [isPreviewRotated, setIsPreviewRotated] = useState(false);
  const [isPreviewManuallyRotated, setIsPreviewManuallyRotated] = useState(false);
  const [isEditingSelection, setIsEditingSelection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Callback handler for when the form submits. Validates and saves data
   * to the API, then closes the modal.
   */
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // TODO: validate data

      // TODO: supabase.storage.from('frames').upload()

      // TODO: submit data to API
      // const createFrameDto: CreateFrameDto = {
      //   src: '', // TODO: add supabase upload URL
      //   description,
      //   width: actualDimensions.width, // TODO: convert from other measurements to inches
      //   height: actualDimensions.height, // TODO: convert from other measurements to inches
      //   depth, // TODO: convert from other measurements to inches
      //   // windowX1: srcPoints[0].x,
      //   // windowY1: srcPoints[0].y,
      //   // windowX2: srcPoints[1].x,
      //   // windowY2: srcPoints[1].y,
      //   // windowX3: srcPoints[2].x,
      //   // windowY3: srcPoints[2].y,
      //   // windowX4: srcPoints[3].x,
      //   // windowY4: srcPoints[3].y,
      // };

      // const res = await fetch('/api/frames', {
      //   method: 'POST',
      //   headers: new Headers({
      //     'Content-Type': 'application/json',
      //   }),
      //   body: JSON.stringify(createFrameDto),
      // });
      // const data = await res.json();
      // onSubmit(data);

      return true;
    } catch (error) {
      toast.error(JSON.stringify(error)); // TODO: better error handling
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AddFrameContext.Provider
      value={{
        actualDimensions,
        depth,
        description,
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
        disabledClose={isEditingSelection}
        disabledSubmit={isSubmitting || isEditingSelection || !description.trim()}
        hideSubmit={!image}
        onClose={onClose}
        onSubmit={handleSubmit}>
        {!image ? (
          <FeatureFormModal.Main>
            {/* <UploadImage
              ref={uploadInputRef}
              setActualDimensions={setActualDimensions}
              setImage={setImage}
              setMeasurement={setMeasurement}
            />
            {addArtworkContext?.image && (
              <MoveFocusInside>
                <UploadToast
                  image={addArtworkContext.image}
                  hidden={isUploadToastHidden}
                  onClose={() => setIsUploadToastHidden(true)}
                />
              </MoveFocusInside>
            )} */}
          </FeatureFormModal.Main>
        ) : (
          <Fragment>
            <FeatureFormModal.Main>
              <FramePreview
                editor={editor}
                rotated={isPreviewManuallyRotated || isPreviewRotated}
                setRotated={setIsPreviewManuallyRotated}
              />
            </FeatureFormModal.Main>
            <FeatureFormModal.Sidebar>
              <FeatureFormModal.SidebarPanel title="Selection">
                <Button
                  // css={tw`mt-2`}
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
              onChange={setEditor}
              actualDimensions={actualDimensions}
              image={image}
              withLayers
              onClose={() => {
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
