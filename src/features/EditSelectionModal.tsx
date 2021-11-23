import { FormEvent, useEffect, useState } from 'react';
import tw, { css } from 'twin.macro';
import FocusLock from 'react-focus-lock';
import Button from '@src/components/Button';
import FeatureFormModal from '@src/components/FeatureFormModal';
import ImageSelectionEditor from '@src/components/ImageSelectionEditor';
import ImageSelectionPreview from '@src/components/ImageSelectionPreview';
import { LAYER_COLORS } from '@src/features/selection';
import Layer from '@src/svgs/Layer';
import { Dimensions } from '@src/types';
// import { GeometryUtils } from '@src/utils/GeometryUtils';
import { SelectionEditorState } from './selection';

type LayerInputProps = {
  layerIndex: number;
  activeLayer: number;
  onChange(layerIndex: number): void;
};
const LayerInput = ({ layerIndex, activeLayer, onChange }: LayerInputProps) => (
  <label
    css={[
      tw`flex items-center justify-between pl-3 pr-4 py-3 bg-white cursor-pointer`,
      activeLayer === layerIndex ? tw`bg-opacity-15` : tw`bg-opacity-0 hover:bg-opacity-10`,
    ]}
    htmlFor={`layer-${layerIndex}`}>
    <input
      css={tw`sr-only`}
      id={`layer-${layerIndex}`}
      type="radio"
      name="activeLayer"
      checked={activeLayer === layerIndex}
      onChange={() => onChange(layerIndex)}
    />
    <span css={tw`flex items-center`}>
      <span css={tw`block size-6 mr-3`}>
        <Layer as={layerIndex === 0 ? 'frame' : 'window'} />
      </span>
      <span>{layerIndex === 0 ? 'Frame' : 'Window'}</span>
    </span>
    <span
      css={[
        tw`w-2.5 h-2.5 rounded-sm`,
        css({ backgroundColor: LAYER_COLORS[layerIndex % LAYER_COLORS.length] }),
      ]}
    />
  </label>
);

type EditSelectionModalProps = {
  actualDimensions: Dimensions;
  editor: SelectionEditorState;
  onChange(nextEditor: SelectionEditorState): void;
  image: HTMLImageElement;
  onClose(): void;
  withLayers?: boolean;
};

const EditSelectionModal = ({
  actualDimensions,
  editor: _editor,
  onChange,
  image,
  onClose,
  withLayers,
}: EditSelectionModalProps) => {
  const [activeLayer, setActiveLayer] = useState(0);

  // Create editor copy to prevent live changes to initial editor
  const [editor, setEditor] = useState(() => SelectionEditorState.create(_editor.current));

  const onSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    onChange(editor);
    onClose();
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
        id="frame-edit-selection-modal"
        css={tw`absolute inset-0 size-full bg-black`}
        aria-label="Frame Selection Editor"
        role="dialog"
        aria-modal="true">
        <form css={tw`flex flex-1 size-full`} onSubmit={onSubmit}>
          <FeatureFormModal.Main>
            <div css={tw`px-6 py-5 size-full relative`}>
              <ImageSelectionEditor
                activeLayer={activeLayer}
                editor={editor}
                onChange={setEditor}
                actualDimensions={actualDimensions}
                image={image}
              />
            </div>
          </FeatureFormModal.Main>
          <FeatureFormModal.Sidebar>
            <FeatureFormModal.SidebarPanel css={tw`flex-1`} title="Selection">
              <p css={tw`mb-5`}>
                {withLayers
                  ? 'Drag the handles to match the size of the frame and frame window.'
                  : 'Drag the handles to match the size of the artwork.'}
              </p>

              {withLayers && (
                <fieldset css={tw`flex flex-col w-full mb-5`}>
                  <legend css={tw`text-sm mb-2 text-gray-300`}>Layers</legend>
                  <div
                    css={[
                      tw`flex flex-col rounded-lg overflow-hidden`,
                      tw`border border-white border-opacity-20 divide-y divide-white divide-opacity-20`,
                      tw`transition-colors focus-within:(border-opacity-100)`,
                    ]}>
                    <LayerInput
                      layerIndex={0}
                      activeLayer={activeLayer}
                      onChange={() => setActiveLayer(0)}
                    />
                    <LayerInput
                      layerIndex={1}
                      activeLayer={activeLayer}
                      onChange={() => {
                        if (!editor.current.inner) {
                          onChange(SelectionEditorState.commit(editor, { type: 'ADD_INNER_PATH' }));
                        }
                        setActiveLayer(1);
                      }}
                    />
                  </div>
                </fieldset>
              )}

              <div css={tw`flex items-center`}>
                <Button /*css={tw`mr-3`}*/ type="submit" filled>
                  Update
                </Button>
                <Button type="button" onClick={() => onClose()}>
                  Cancel
                </Button>
              </div>

              <div css={tw`flex flex-col flex-1 w-full justify-end mt-6`}>
                <p css={tw`text-sm mb-2 text-gray-300`}>Preview</p>
                <div css={tw`w-full h-96 bg-white bg-opacity-10 rounded-lg p-4`}>
                  <ImageSelectionPreview
                    editor={editor}
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
