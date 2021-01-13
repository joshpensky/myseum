import { FormEvent, Fragment, useState } from 'react';
import tw from 'twin.macro';
import Button from '@src/components/Button';
import ImageSelectionPreview from '@src/components/ImageSelectionPreview';
import { useSelectionEditor } from '@src/hooks/useSelectionEditor';
import { AddArtworkContext } from './AddArtworkContext';
import DetailsPanel from './DetailsPanel';
import DimensionsPanel from './DimensionsPanel';
import EditSelectionModal from './EditSelectionModal';
import FramePanel from './FramePanel';
import UploadImage from './UploadImage';
import { ArtworkDetails } from './types';
import { Dimensions, Measurement } from '@src/types';
import FeatureFormModal from '@src/components/FeatureFormModal';

export type AddArtworkRootProps = {
  onClose(): void;
};

const AddArtworkRoot = ({ onClose }: AddArtworkRootProps) => {
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

  const [isEscapeDisabled, setIsEscapeDisabled] = useState(false);
  const [isEditingSelection, setIsEditingSelection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Callback handler for when the form submits. Validates and saves data
   * to the API, then closes the modal.
   */
  const onSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    try {
      setIsSubmitting(true);
      // TODO: validate and save data to API
      console.log(evt);
      return false;
    } finally {
      setIsSubmitting(true);
    }
  };

  return (
    <AddArtworkContext.Provider
      value={{
        actualDimensions,
        details,
        editor,
        frameId,
        image,
        isEscapeDisabled,
        isSubmitting,
        measurement,
        setActualDimensions,
        setDetails,
        setFrameId,
        setImage,
        setIsEscapeDisabled,
        setMeasurement,
      }}>
      <FeatureFormModal
        id="add-artwork-modal"
        aria-label="Create Artwork Modal"
        title={
          <h1>
            <span css={tw`font-medium`}>Creating{image ? ': ' : ' artwork'}</span>
            {image && (
              <span css={[!details.title.trim() && tw`text-gray-300 text-opacity-70`]}>
                {details.title.trim() || 'Unknown'}
              </span>
            )}
          </h1>
        }
        disabledClose={isEscapeDisabled}
        disabledSubmit={isSubmitting || isEditingSelection || !details.title.trim()}
        onClose={onClose}
        onSubmit={onSubmit}>
        {!image ? (
          <FeatureFormModal.Main>
            <UploadImage
              setActualDimensions={setActualDimensions}
              setImage={setImage}
              setMeasurement={setMeasurement}
            />
          </FeatureFormModal.Main>
        ) : (
          <Fragment>
            <FeatureFormModal.Main>
              <div
                css={[tw`px-6 py-5 flex flex-col items-center justify-center size-full relative`]}>
                <div css={[tw`max-w-3xl max-h-3xl size-full`]}>
                  <ImageSelectionPreview
                    editor={editor}
                    actualDimensions={actualDimensions}
                    image={image}
                  />
                </div>
                <p
                  css={[
                    tw`absolute bottom-5 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-3xl bg-black bg-opacity-90 text-yellow-500`,
                    tw`before:(content absolute inset-0 rounded-3xl bg-yellow-500 bg-opacity-20 pointer-events-none)`,
                    [
                      tw`transition-all ease-out`,
                      (!frameId || frameId < 9) && tw`opacity-0 translate-y-1 pointer-events-none`,
                    ],
                  ]}
                  role="region"
                  aria-live="assertive"
                  aria-hidden={!frameId || frameId < 9}>
                  Artwork may be cropped in this frame.
                </p>
              </div>
            </FeatureFormModal.Main>
            <FeatureFormModal.Sidebar>
              <FeatureFormModal.SidebarPanel title="Selection">
                <Button
                  css={tw`mt-2`}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsEditingSelection(true);
                    setIsEscapeDisabled(true);
                  }}
                  aria-controls="artwork-edit-selection-modal">
                  Edit selection
                </Button>
              </FeatureFormModal.SidebarPanel>
              <DimensionsPanel />
              <DetailsPanel />
              <FramePanel />
            </FeatureFormModal.Sidebar>
          </Fragment>
        )}

        {isEditingSelection && image && (
          <FeatureFormModal.OutsideForm>
            <EditSelectionModal
              editor={editor}
              actualDimensions={actualDimensions}
              image={image}
              onClose={modalEditor => {
                if (modalEditor) {
                  editor.setLayers(modalEditor.layers); // Save the latest state, if available
                }
                setIsEditingSelection(false); // Close the editor
                setIsEscapeDisabled(false);
              }}
            />
          </FeatureFormModal.OutsideForm>
        )}
      </FeatureFormModal>
    </AddArtworkContext.Provider>
  );
};

export default AddArtworkRoot;
