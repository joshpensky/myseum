import { FormEvent, useEffect, useState } from 'react';
import FocusLock from 'react-focus-lock';
import tw, { css, theme } from 'twin.macro';
import Button from '@src/components/Button';
import ImageSelectionEditor from '@src/components/ImageSelectionEditor';
import ImageSelectionPreview from '@src/components/ImageSelectionPreview';
import { SelectionEditor, useSelectionEditor } from '@src/hooks/useSelectionEditor';
import Panel from '@src/features/add-artwork/Panel';
import { Dimensions } from '@src/types';
import Layer from '@src/svgs/Layer';

const LAYER_COLORS = [theme`colors.blue.500`, theme`colors.magenta.500`, theme`colors.yellow.500`];

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

  const [activeLayer, setActiveLayer] = useState(0);

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
        <form css={tw`flex flex-1 size-full divide-x divide-white`} onSubmit={onSubmit}>
          <div
            css={tw`flex flex-col flex-1 px-6 py-5 items-center justify-center size-full relative`}>
            <ImageSelectionEditor
              activeLayer={activeLayer}
              editor={modalEditor}
              actualDimensions={actualDimensions}
              image={image}
            />
          </div>
          <div css={tw`relative flex-shrink-0 max-w-lg w-full`}>
            <div
              css={tw`absolute inset-0 size-full flex flex-col overflow-x-hidden overflow-y-auto`}>
              <Panel css={tw`flex-1`} title="Selection">
                <p css={tw`mb-5`}>Drag the handles to match the size of the artwork.</p>

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
                        if (modalEditor.layers.length === 1) {
                          modalEditor.setLayers(layers => [
                            layers[0],
                            {
                              name: 'Window',
                              points: layers[0].points,
                            },
                          ]);
                        }
                        setActiveLayer(1);
                      }}
                    />
                  </div>
                </fieldset>

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
                  <div css={tw`w-full h-96 bg-white bg-opacity-10 rounded-lg p-4`}>
                    <ImageSelectionPreview
                      editor={modalEditor}
                      actualDimensions={actualDimensions}
                      image={image}
                    />
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        </form>
      </div>
    </FocusLock>
  );
};

export default EditSelectionModal;
