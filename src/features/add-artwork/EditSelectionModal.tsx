import { FormEvent, useEffect } from 'react';
import FocusLock from 'react-focus-lock';
import tw from 'twin.macro';
import Button from '@src/components/Button';
import ImageSelectionEditor from '@src/components/ImageSelectionEditor';
import ImageSelectionPreview from '@src/components/ImageSelectionPreview';
import { SelectionEditor, useSelectionEditor } from '@src/hooks/useSelectionEditor';
import { Dimensions } from '@src/types';
import FeatureFormModal from '@src/components/FeatureFormModal';

type EditSelectionModalProps = {
  actualDimensions: Dimensions;
  editor: SelectionEditor;
  image: HTMLImageElement;
  onClose(newState?: SelectionEditor): void;
};

const EditSelectionModal = ({
  actualDimensions,
  editor,
  image,
  onClose,
}: EditSelectionModalProps) => {
  const modalEditor = useSelectionEditor(editor.layers);

  const onSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    onClose(modalEditor);
  };

  const onKeyDown = (evt: KeyboardEvent) => {
    switch (evt.key) {
      case 'Escape':
      case 'Esc': {
        evt.preventDefault();
        evt.stopPropagation();
        onClose();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, []);

  return (
    <FocusLock returnFocus>
      <div
        id="artwork-edit-selection-modal"
        css={tw`absolute inset-0 size-full bg-black`}
        aria-label="Selection Editor"
        role="dialog"
        aria-modal="true">
        <form css={tw`flex flex-1 size-full`} onSubmit={onSubmit}>
          <div
            css={tw`flex flex-col flex-1 px-6 py-5 items-center justify-center size-full relative`}>
            <ImageSelectionEditor
              editor={modalEditor}
              actualDimensions={actualDimensions}
              image={image}
            />
          </div>
          <FeatureFormModal.Sidebar>
            <FeatureFormModal.SidebarPanel css={tw`flex-1`} title="Selection">
              <p css={tw`mb-5`}>Drag the handles to match the size of the artwork.</p>
              <div css={tw`flex items-center`}>
                <Button css={tw`mr-3`} type="submit" filled>
                  Update
                </Button>
                <Button type="button" onClick={() => onClose()}>
                  Cancel
                </Button>
              </div>
              <div css={tw`flex flex-col flex-1 w-full justify-end mt-6`}>
                <p css={tw`text-sm mb-2 text-gray-300`}>Preview</p>
                <div css={tw`w-full h-96 bg-white bg-opacity-10 rounded-md p-4`}>
                  <ImageSelectionPreview
                    editor={modalEditor}
                    actualDimensions={actualDimensions}
                    image={image}
                  />
                </div>
              </div>
            </FeatureFormModal.SidebarPanel>
          </FeatureFormModal.Sidebar>
        </form>
      </div>
    </FocusLock>
  );
};

export default EditSelectionModal;
