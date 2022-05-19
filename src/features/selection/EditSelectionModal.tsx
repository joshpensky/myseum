import { FormEvent, useEffect, useState } from 'react';
import FocusLock from 'react-focus-lock';
import Button from '@src/components/Button';
// import FeatureFormModal from '@src/features/add-frame/FeatureFormModal';
import { LAYER_COLORS } from '@src/features/selection';
import ImageSelectionEditor from '@src/features/selection/ImageSelectionEditor';
import ImageSelectionPreview from '@src/features/selection/ImageSelectionPreview';
import { LayerIcon } from '@src/svgs/LayerIcon';
import { Dimensions } from '@src/types';
// import { GeometryUtils } from '@src/utils/GeometryUtils';
import { SelectionEditorState } from '.';

type LayerInputProps = {
  layerIndex: number;
  activeLayer: number;
  onChange(layerIndex: number): void;
};
const LayerInput = ({ layerIndex, activeLayer, onChange }: LayerInputProps) => (
  <label
    /*css={[
      tw`flex items-center justify-between pl-3 pr-4 py-3 bg-white cursor-pointer`,
      activeLayer === layerIndex ? tw`bg-opacity-15` : tw`bg-opacity-0 hover:bg-opacity-10`,
    ]}*/
    htmlFor={`layer-${layerIndex}`}>
    <input
      /*css={tw`sr-only`}*/
      id={`layer-${layerIndex}`}
      type="radio"
      name="activeLayer"
      checked={activeLayer === layerIndex}
      onChange={() => onChange(layerIndex)}
    />
    <span /*css={tw`flex items-center`}*/>
      <span /*css={tw`block size-6 mr-3`}*/>
        <LayerIcon as={layerIndex === 0 ? 'outline' : 'inner'} />
      </span>
      <span>{layerIndex === 0 ? 'Frame' : 'Window'}</span>
    </span>
    <span
    /*css={[
        tw`w-2.5 h-2.5 rounded-sm`,
        css({ backgroundColor: LAYER_COLORS[layerIndex % LAYER_COLORS.length] }),
      ]}*/
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

  return <FocusLock returnFocus></FocusLock>;
};

export default EditSelectionModal;
